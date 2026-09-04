/**
 * Mobile audit harness (Phase 3.01).
 *
 * Drives a headless Chrome over the DevTools Protocol using **only** Node
 * built-ins (`WebSocket` is global from Node 22 on) — deliberately no Playwright
 * / Puppeteer, because Phase 3.01 forbids adding dependencies. Point it at a
 * running `next start` and it walks every route × locale × viewport and records:
 *
 *  - the full document height,
 *  - every element that extends past the viewport width (horizontal overflow),
 *  - every interactive element whose *effective hit area* is under 44 × 44,
 *  - a full-page screenshot (a curated subset — see SHOT_MATRIX).
 *
 * "Effective hit area" is probed with `document.elementFromPoint` walking out
 * from each element's centre, so a target enlarged by a transparent `::after`
 * overlay (the `@media (pointer: coarse)` technique this phase uses) measures at
 * its real tappable size, not its painted size.
 *
 * Usage:
 *   npm run audit:mobile -- --out docs/mobile-audit/before
 *   npm run audit:mobile -- --out docs/mobile-audit/after --base http://localhost:3210
 */

import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

// ---------------------------------------------------------------- config ----

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = process.argv.slice(2);
const argOf = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = argOf("base", "http://localhost:3210");
const OUT = argOf("out", "docs/mobile-audit/before");
const ONLY = argOf("only", "");
const NO_SHOTS = args.includes("--no-shots");
const FROM = Number(argOf("from", "0"));
const TO = Number(argOf("to", "99999"));
const APPEND = args.includes("--append");

type Viewport = { name: string; width: number; height: number; mobile: boolean };

const MOBILE_VIEWPORTS: Viewport[] = [
  { name: "320x568", width: 320, height: 568, mobile: true },
  { name: "360x740", width: 360, height: 740, mobile: true },
  { name: "375x812", width: 375, height: 812, mobile: true },
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "430x932", width: 430, height: 932, mobile: true },
  { name: "844x390-landscape", width: 844, height: 390, mobile: true },
];

const DESKTOP_VIEWPORTS: Viewport[] = [
  { name: "1024x800", width: 1024, height: 800, mobile: false },
  { name: "1280x900", width: 1280, height: 900, mobile: false },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];

const LOCALES = ["mk", "en", "sr"] as const;

type Route = { key: string; path: (locale: string) => string };

const STATIC_ROUTES: Route[] = [
  { key: "home", path: (l) => `/${l}` },
  { key: "about", path: (l) => `/${l}/about` },
  { key: "book", path: (l) => `/${l}/book` },
  { key: "reviews", path: (l) => `/${l}/reviews` },
  { key: "blog", path: (l) => `/${l}/blog` },
  { key: "contact", path: (l) => `/${l}/contact` },
  { key: "privacy", path: (l) => `/${l}/privacy` },
];

/**
 * Which (route, locale, viewport) combinations get a full-page screenshot.
 * Measurements run over the *whole* matrix; screenshots are curated so the
 * committed evidence set stays a sane size in a public repo.
 */
function wantsShot(route: string, locale: string, viewport: string) {
  if (viewport === "375x812") return true; // every route, every locale
  if (locale !== "mk") return false;
  if (viewport === "320x568" || viewport === "430x932") return true;
  if (viewport === "844x390-landscape")
    return ["home", "reviews", "blog-post"].includes(route);
  if (["1024x800", "1280x900", "1440x900"].includes(viewport))
    return ["home", "reviews", "review-detail", "blog-post", "contact"].includes(route);
  return false;
}

// ------------------------------------------------------------------ CDP -----

type CdpFrame = {
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  sessionId?: string;
  error?: { message: string };
};

class Cdp {
  #ws: WebSocket;
  #id = 0;
  #pending = new Map<number, { ok: (v: never) => void; fail: (e: Error) => void }>();
  #listeners = new Map<string, ((params: unknown) => void)[]>();

  private constructor(ws: WebSocket) {
    this.#ws = ws;
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data)) as CdpFrame;
      if (msg.id != null) {
        const p = this.#pending.get(msg.id);
        if (!p) return;
        this.#pending.delete(msg.id);
        if (msg.error) p.fail(new Error(`${msg.error.message}`));
        else p.ok(msg.result as never);
      } else if (msg.method) {
        for (const fn of [...(this.#listeners.get(msg.method) ?? [])]) fn(msg.params);
      }
    });
    // A crashed browser closes the socket; without this every in-flight promise
    // would hang forever and Node would exit(0) mid-run with no diagnostic.
    ws.addEventListener("close", () => {
      this.closed = true;
      for (const [, p] of this.#pending) p.fail(new Error("CDP socket closed (Chrome exited)"));
      this.#pending.clear();
    });
  }

  closed = false;

  static async connect(url: string) {
    const ws = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      ws.addEventListener("open", () => resolve(), { once: true });
      ws.addEventListener("error", () => reject(new Error("CDP socket failed")), { once: true });
    });
    return new Cdp(ws);
  }

  /** `sessionId` is a sibling of `params` in the flat protocol, never inside it. */
  send<T = Record<string, unknown>>(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ): Promise<T> {
    const id = ++this.#id;
    return new Promise<T>((ok, fail) => {
      this.#pending.set(id, { ok: ok as (v: never) => void, fail });
      this.#ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
    });
  }

  on(method: string, fn: (params: unknown) => void) {
    const list = this.#listeners.get(method) ?? [];
    list.push(fn);
    this.#listeners.set(method, list);
    return () => {
      this.#listeners.set(method, (this.#listeners.get(method) ?? []).filter((f) => f !== fn));
    };
  }

  once(method: string) {
    return new Promise<unknown>((resolve) => {
      const off = this.on(method, (params) => {
        off();
        resolve(params);
      });
    });
  }

  close() {
    this.#ws.close();
  }
}

async function launchChrome(): Promise<{ proc: ChildProcess; wsUrl: string }> {
  const port = 9222 + Math.floor(Math.random() * 500);
  const userDataDir = join(process.env.TMPDIR ?? "/tmp", `dalibor-mobile-audit-${Date.now()}`);
  const proc = spawn(
    CHROME,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--force-device-scale-factor=1",
      "--force-color-profile=srgb",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );

  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = (await res.json()) as { webSocketDebuggerUrl: string };
      if (json.webSocketDebuggerUrl) return { proc, wsUrl: json.webSocketDebuggerUrl };
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("Chrome did not expose a DevTools endpoint");
}

// --------------------------------------------------- in-page measurement ----

/**
 * Serialized into the page. Returns document height, overflow offenders, and
 * every interactive element under 44 × 44 of *effective* hit area.
 *
 * WCAG 2.2 SC 2.5.8 exempts targets rendered inline in a sentence or block of
 * text (the "Inline" exception). Those are still reported, but tagged
 * `inline: true`, so the audit separates "we failed" from "the spec exempts it".
 */
const MEASURE_FN = String.raw`
(() => {
  document.documentElement.style.scrollBehavior = "auto";
  const SEL = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const label = (el) => ((el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 70);
  const path = (el) => {
    const bits = [];
    let n = el;
    while (n && n.nodeType === 1 && bits.length < 4) {
      let s = n.tagName.toLowerCase();
      if (n.id) { bits.unshift(s + '#' + n.id); break; }
      const cls = (n.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      if (cls) s += '.' + cls;
      bits.unshift(s);
      n = n.parentElement;
    }
    return bits.join(' > ');
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (cs.clipPath === 'inset(50%)') return false;
    if (cs.clip === 'rect(0px, 0px, 0px, 0px)') return false;
    return true;
  };

  // ---- horizontal overflow -------------------------------------------------
  const overflow = [];
  const docW = document.documentElement.scrollWidth;
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' && parseFloat(cs.left || '0') < -1000) continue;
    const r = el.getBoundingClientRect();
    const right = r.right + window.scrollX;
    const left = r.left + window.scrollX;
    if (right > vw + 1 || left < -1) {
      overflow.push({ path: path(el), label: label(el), left: Math.round(left), right: Math.round(right), width: Math.round(r.width) });
      if (overflow.length > 40) break;
    }
  }

  // ---- effective hit areas -------------------------------------------------
  const MIN = 44;
  const REACH = 24;
  const els = Array.from(document.querySelectorAll(SEL)).filter(visible);
  const small = [];

  const owns = (el, x, y) => {
    if (x < 0 || y < 0 || x >= vw || y >= vh) return false;
    const hit = document.elementFromPoint(x, y);
    if (!hit) return false;
    return hit === el || el.contains(hit) || hit.closest(SEL) === el;
  };

  const scrollY0 = window.scrollY;
  for (const el of els) {
    const r0 = el.getBoundingClientRect();
    if (r0.width >= MIN && r0.height >= MIN) continue; // painted box already passes

    const cs = getComputedStyle(el);
    let fixed = false;
    for (let n = el; n; n = n.parentElement) {
      const p = getComputedStyle(n).position;
      if (p === 'fixed' || p === 'sticky') { fixed = true; break; }
    }
    // scrollIntoView (not window.scrollTo) so NESTED scrollers are handled too:
    // a chip inside the horizontal topic rail can sit outside the viewport
    // horizontally, and probing it there would report it as obscured when it is
    // simply not scrolled into view yet.
    if (!fixed) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });

    const r = el.getBoundingClientRect();
    const cx = Math.round(r.left + r.width / 2);
    const cy = Math.round(r.top + r.height / 2);
    const rec = {
      path: path(el), label: label(el), tag: el.tagName.toLowerCase(),
      w: Math.round(r.width), h: Math.round(r.height),
      effW: Math.round(r.width), effH: Math.round(r.height),
      obscured: false, inline: false,
    };

    // WCAG 2.2 SC 2.5.8 "Inline" exception, decided from the DOM before any
    // geometry: a link that wraps across two lines has a bounding-box centre
    // that lands in the gap between its line boxes, so the probe below would
    // call it "obscured" when it is simply inline prose.
    const parentEl = el.parentElement;
    rec.inline =
      cs.display.startsWith('inline') &&
      !!parentEl &&
      ['P', 'LI', 'SPAN', 'TD', 'DD', 'BLOCKQUOTE', 'FIGCAPTION'].includes(parentEl.tagName) &&
      (parentEl.textContent || '').trim().length > (el.textContent || '').trim().length + 8;

    if (!owns(el, cx, cy)) {
      // Obscured by an overlay (or nested inside a bigger link). Report honestly.
      rec.obscured = true;
      small.push(rec);
      continue;
    }
    let l = 0, rr = 0, u = 0, d = 0;
    while (l < REACH && owns(el, cx - l - 1, cy)) l++;
    while (rr < REACH && owns(el, cx + rr + 1, cy)) rr++;
    while (u < REACH && owns(el, cx, cy - u - 1)) u++;
    while (d < REACH && owns(el, cx, cy + d + 1)) d++;
    rec.effW = l + rr + 1;
    rec.effH = u + d + 1;
    if (rec.effW >= MIN && rec.effH >= MIN) continue;

    small.push(rec);
  }
  window.scrollTo(0, scrollY0);

  return {
    docHeight: Math.round(document.documentElement.scrollHeight),
    docWidth: Math.round(docW),
    viewportWidth: vw,
    horizontalOverflow: docW > vw + 1,
    overflowElements: overflow,
    interactiveCount: els.length,
    smallTargets: small,
  };
})()
`;

/** Page-specific probes: card density, filter height, placeholder clipping, hero. */
const EXTRA_FN = String.raw`
(() => {
  const out = {};
  const card = document.querySelector('main li a[href*="/reviews/"]');
  if (card) {
    const r = card.getBoundingClientRect();
    out.reviewCardHeight = Math.round(r.height);
    out.reviewCardWidth = Math.round(r.width);
  }
  const filter = Array.from(document.querySelectorAll('main nav')).find((n) => n.querySelector('a[href*="topic="], a[href$="/reviews"], a[href$="/blog"]'));
  if (filter) {
    const r = filter.getBoundingClientRect();
    out.topicFilterHeight = Math.round(r.height);
    out.topicFilterTop = Math.round(r.top + window.scrollY);
  }
  const search = document.querySelector('input[type="search"]');
  if (search) {
    const r = search.getBoundingClientRect();
    const cs = getComputedStyle(search);
    out.searchTop = Math.round(r.top + window.scrollY);
    out.searchHeight = Math.round(r.height);
    out.searchFontSize = cs.fontSize;
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;';
    probe.style.font = cs.font;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.textContent = search.placeholder || '';
    document.body.appendChild(probe);
    const textW = probe.getBoundingClientRect().width;
    probe.remove();
    const usable = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    out.placeholder = search.placeholder || '';
    out.placeholderWidth = Math.round(textW);
    out.placeholderUsable = Math.round(usable);
    out.placeholderClipped = textW > usable + 0.5;
  }
  const firstItem = document.querySelector('main ul > li');
  if (firstItem) out.firstResultTop = Math.round(firstItem.getBoundingClientRect().top + window.scrollY);
  const hero = document.querySelector('main img');
  if (hero) {
    const r = hero.getBoundingClientRect();
    out.heroImage = {
      width: Math.round(r.width), height: Math.round(r.height),
      fetchPriority: hero.getAttribute('fetchpriority'),
      loading: hero.getAttribute('loading'),
      sizes: hero.getAttribute('sizes'),
      top: Math.round(r.top + window.scrollY),
    };
  }
  // Reading measure (characters per line) of the first body paragraph.
  const p = document.querySelector('main .article-body p, main article p, main p');
  if (p) {
    const cs = getComputedStyle(p);
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;';
    probe.style.font = cs.font;
    probe.textContent = 'abcdefghijklmnopqrstuvwxyz';
    document.body.appendChild(probe);
    const avg = probe.getBoundingClientRect().width / 26;
    probe.remove();
    out.measureChars = Math.round(p.getBoundingClientRect().width / avg);
    out.bodyFontSize = cs.fontSize;
  }
  const themeColor = document.querySelector('meta[name="theme-color"]');
  out.themeColor = themeColor ? themeColor.getAttribute('content') : null;
  out.manifest = !!document.querySelector('link[rel="manifest"]');
  out.appleTouchIcon = !!document.querySelector('link[rel="apple-touch-icon"]');
  return out;
})()
`;

/** Blocks until the real (non-fallback) faces are rendering. */
const FONTS_READY_FN = String.raw`
(async () => {
  if (!document.fonts) return true;
  const fam = (el) => el ? getComputedStyle(el).fontFamily : "";
  const body = fam(document.body);
  const display = fam(document.querySelector("h1, h2, h3, .font-display")) || body;
  // Latin + Cyrillic so neither subset can be left un-requested.
  const sample = "Aa Аа";
  const specs = [
    ["400 18px " + body], ["500 15px " + body], ["600 13px " + body],
    ["600 20px " + display], ["700 44px " + display],
  ];
  await Promise.all(specs.map(([s]) => document.fonts.load(s, sample).catch(() => {})));
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return true;
})()
`;

// ------------------------------------------------------------------ run -----

type SmallTarget = {
  path: string;
  label: string;
  tag: string;
  w: number;
  h: number;
  effW: number;
  effH: number;
  obscured: boolean;
  inline: boolean;
};

type Measured = {
  docHeight: number;
  docWidth: number;
  viewportWidth: number;
  horizontalOverflow: boolean;
  overflowElements: { path: string; label: string; left: number; right: number; width: number }[];
  interactiveCount: number;
  smallTargets: SmallTarget[];
};

type PageResult = Measured & {
  route: string;
  locale: string;
  viewport: string;
  url: string;
  extra: Record<string, unknown>;
};

async function main() {
  // Discover the real review / blog slugs from the sitemap so the harness never
  // goes stale when content changes.
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const reviewSlug = sitemap.match(/\/mk\/reviews\/([a-z0-9-]+)</)?.[1];
  const blogSlug = sitemap.match(/\/mk\/blog\/([a-z0-9-]+)</)?.[1];
  if (!reviewSlug || !blogSlug) throw new Error("Could not discover slugs from the sitemap");

  const routes: Route[] = [
    ...STATIC_ROUTES,
    { key: "review-detail", path: (l: string) => `/${l}/reviews/${reviewSlug}` },
    { key: "blog-post", path: (l: string) => `/${l}/blog/${blogSlug}` },
  ].sort((a, b) => a.key.localeCompare(b.key));

  // Headless Chrome gets unstable after a few dozen tall full-page captures, so
  // the run is batched: each batch gets a fresh browser.
  let proc: ChildProcess | undefined;
  let cdp: Cdp | undefined;
  let sessionId = "";

  const openBrowser = async () => {
    const launched = await launchChrome();
    proc = launched.proc;
    cdp = await Cdp.connect(launched.wsUrl);
    const { targetId } = await cdp.send<{ targetId: string }>("Target.createTarget", { url: "about:blank" });
    ({ sessionId } = await cdp.send<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true }));
    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
  };
  const closeBrowser = () => {
    cdp?.close();
    proc?.kill("SIGKILL");
    cdp = undefined;
    proc = undefined;
  };

  const call = <T = Record<string, unknown>,>(method: string, params: Record<string, unknown> = {}) =>
    cdp!.send<T>(method, params, sessionId);
  const evaluate = async <T,>(expression: string): Promise<T> => {
    const res = await call<{ result: { value: T }; exceptionDetails?: { text: string } }>(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true },
    );
    if (res.exceptionDetails) throw new Error(`In-page error: ${res.exceptionDetails.text}`);
    return res.result.value;
  };

  await openBrowser();

  if (!APPEND) await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "screens"), { recursive: true });

  const combos: { route: Route; locale: string; vp: Viewport }[] = [];
  for (const vp of MOBILE_VIEWPORTS)
    for (const locale of LOCALES) for (const route of routes) combos.push({ route, locale, vp });
  for (const vp of DESKTOP_VIEWPORTS)
    for (const route of routes) combos.push({ route, locale: "mk", vp });

  const selected = ONLY ? combos.filter((c) => c.route.key === ONLY) : combos;
  const filtered = selected.slice(FROM, TO);
  const results: PageResult[] = [];

  const BATCH = Number(argOf("batch", "24"));
  let n = 0;
  for (const { route, locale, vp } of filtered) {
    n++;
    if (!cdp || cdp.closed || (n > 1 && (n - 1) % BATCH === 0)) {
      closeBrowser();
      await openBrowser();
    }
    const url = `${BASE}${route.path(locale)}`;
    process.stdout.write(
      `\r[${String(n).padStart(3)}/${filtered.length}] ${vp.name} ${locale} ${route.key}`.padEnd(72),
    );

    await call("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
      screenWidth: vp.width,
      screenHeight: vp.height,
    });
    await call(
      "Emulation.setTouchEmulationEnabled",
      vp.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false },
    );

    const loaded = cdp!.once("Page.loadEventFired");
    await call("Page.navigate", { url });
    await Promise.race([loaded, sleep(20000)]);
    // `document.fonts.ready` alone is not enough: with `display: swap` it can
    // resolve before a face that nothing has *requested* yet starts loading, and
    // the page then measures in the Georgia fallback — whose metrics wrap chip
    // rows differently. Force the faces this page actually uses (both scripts,
    // both families, the weights in play) and only then measure.
    await evaluate<boolean>(FONTS_READY_FN);
    // Let the CSS reveal animation finish (360ms + up to 240ms stagger).
    await sleep(420);

    const measured = await evaluate<Measured>(MEASURE_FN);
    const extra = await evaluate<Record<string, unknown>>(EXTRA_FN);
    results.push({ route: route.key, locale, viewport: vp.name, url, extra, ...measured });

    if (!NO_SHOTS && wantsShot(route.key, locale, vp.name)) {
      const shot = await call<{ data: string }>("Page.captureScreenshot", {
        format: "jpeg",
        quality: 62,
        captureBeyondViewport: true,
      });
      await writeFile(
        join(OUT, "screens", `${vp.name}_${locale}_${route.key}.jpg`),
        Buffer.from(shot.data, "base64"),
      );
    }
  }

  process.stdout.write("\n");
  const prior: PageResult[] =
    APPEND && existsSync(join(OUT, "measurements.json"))
      ? JSON.parse(await readFile(join(OUT, "measurements.json"), "utf8"))
      : [];
  const all = [...prior, ...results];
  await writeFile(join(OUT, "measurements.json"), JSON.stringify(all, null, 2));
  await writeFile(join(OUT, "summary.md"), renderSummary(all));

  closeBrowser();
  console.log(`✔ ${results.length} new (${all.length} total) page measurements → ${OUT}`);
}

function renderSummary(results: PageResult[]) {
  const hard = (r: PageResult) => r.smallTargets.filter((t) => !t.inline);
  const mobile = results.filter((r) => !r.viewport.startsWith("10") && !r.viewport.startsWith("12") && !r.viewport.startsWith("14"));
  const rows = mobile
    .filter((r) => ["320x568", "375x812", "430x932"].includes(r.viewport))
    .map(
      (r) =>
        `| ${r.route} | ${r.locale} | ${r.viewport} | ${r.docHeight} | ${
          r.horizontalOverflow ? "**YES**" : "no"
        } | ${hard(r).length} | ${r.smallTargets.filter((t) => t.inline).length} |`,
    );

  const offenders = new Map<string, { count: number; sample: SmallTarget }>();
  for (const r of mobile)
    for (const t of r.smallTargets) {
      if (t.inline) continue;
      const key = `${t.tag} · ${t.label || t.path}`;
      const e = offenders.get(key) ?? { count: 0, sample: t };
      e.count++;
      offenders.set(key, e);
    }

  return [
    "# Mobile audit — raw summary",
    "",
    `Generated ${new Date().toISOString()} · ${results.length} page measurements`,
    "",
    "## Per page (key viewports)",
    "",
    "| route | locale | viewport | doc height | h-overflow | sub-44 targets | (inline-exempt) |",
    "| --- | --- | --- | ---: | :---: | ---: | ---: |",
    ...rows,
    "",
    "## Sub-44 offenders across all mobile viewports",
    "",
    "| element | occurrences | painted | effective |",
    "| --- | ---: | --- | --- |",
    ...[...offenders.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(
        ([k, v]) =>
          `| ${k.replace(/\|/g, "\\|")} | ${v.count} | ${v.sample.w}×${v.sample.h} | ${v.sample.effW}×${v.sample.effH} |`,
      ),
    "",
  ].join("\n");
}

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}. Set CHROME_PATH.`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
