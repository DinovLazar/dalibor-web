/**
 * Runs Lighthouse in its **mobile** configuration (Moto-G-class CPU throttling +
 * simulated slow 4G — the default `lighthouse` preset, not the desktop one) over
 * the six pages Phase 3.01's Definition of Done names, and writes the four
 * category scores plus LCP / CLS / TBT to `docs/mobile-audit/lighthouse.json`
 * for `scripts/mobile-audit-report.mts` to table up.
 *
 * Lighthouse is invoked through `npx` rather than added to `package.json`: this
 * phase forbids new dependencies, and an audit tool is not a dependency of the
 * app. Nothing in `src/` imports it.
 *
 *   npm run audit:lighthouse -- --base http://localhost:3210
 */

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const args = process.argv.slice(2);
const argOf = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = argOf("base", "http://localhost:3210");
const LOCALE = argOf("locale", "mk");
const RUNS = Number(argOf("runs", "1"));
const OUT = "docs/mobile-audit/lighthouse.json";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

type Page = { page: string; path: string };

async function discover(): Promise<Page[]> {
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const review = sitemap.match(/\/mk\/reviews\/([a-z0-9-]+)</)?.[1];
  const post = sitemap.match(/\/mk\/blog\/([a-z0-9-]+)</)?.[1];
  if (!review || !post) throw new Error("Could not discover slugs from the sitemap");
  return [
    { page: "home", path: `/${LOCALE}` },
    { page: "reviews", path: `/${LOCALE}/reviews` },
    { page: "review-detail", path: `/${LOCALE}/reviews/${review}` },
    { page: "blog", path: `/${LOCALE}/blog` },
    { page: "blog-post", path: `/${LOCALE}/blog/${post}` },
    { page: "contact", path: `/${LOCALE}/contact` },
  ];
}

type Result = {
  page: string;
  url: string;
  scores: Record<string, number | null>;
  metrics: Record<string, number | null>;
};

async function audit(dir: string, p: Page): Promise<Result> {
  const url = `${BASE}${p.path}`;
  const out = join(dir, `${p.page}.json`);
  // `--only-categories` keeps the run to the four scored categories; the default
  // (mobile) form factor and throttling are exactly what the DoD asks for, so
  // they are deliberately left untouched.
  await run(
    "npx",
    [
      "--yes",
      "lighthouse@13",
      url,
      "--quiet",
      "--output=json",
      `--output-path=${out}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-first-run --no-default-browser-check --disable-extensions",
      "--max-wait-for-load=60000",
    ],
    { env: { ...process.env, CHROME_PATH: CHROME }, maxBuffer: 1024 * 1024 * 64 },
  );

  const lhr = JSON.parse(await readFile(out, "utf8"));
  const cat = (id: string) => lhr.categories?.[id]?.score ?? null;
  const num = (id: string) => lhr.audits?.[id]?.numericValue ?? null;
  return {
    page: p.page,
    url,
    scores: {
      performance: cat("performance"),
      accessibility: cat("accessibility"),
      "best-practices": cat("best-practices"),
      seo: cat("seo"),
    },
    metrics: {
      lcp: num("largest-contentful-paint"),
      cls: num("cumulative-layout-shift"),
      tbt: num("total-blocking-time"),
      fcp: num("first-contentful-paint"),
      si: num("speed-index"),
    },
  };
}

/** Median of N runs — Lighthouse's performance score is noisy on a loaded machine. */
function median(rs: Result[]): Result {
  const pick = (get: (r: Result) => number | null) => {
    const vs = rs.map(get).filter((v): v is number => v != null).sort((a, b) => a - b);
    return vs.length ? vs[Math.floor((vs.length - 1) / 2)] : null;
  };
  const keysS = Object.keys(rs[0].scores);
  const keysM = Object.keys(rs[0].metrics);
  return {
    page: rs[0].page,
    url: rs[0].url,
    scores: Object.fromEntries(keysS.map((k) => [k, pick((r) => r.scores[k])])),
    metrics: Object.fromEntries(keysM.map((k) => [k, pick((r) => r.metrics[k])])),
  };
}

async function main() {
  const pages = await discover();
  const dir = await mkdtemp(join(tmpdir(), "lh-"));
  const results: Result[] = [];
  try {
    for (const p of pages) {
      const runs: Result[] = [];
      for (let i = 0; i < RUNS; i++) {
        process.stdout.write(`\r${p.page} (run ${i + 1}/${RUNS})`.padEnd(48));
        runs.push(await audit(dir, p));
      }
      const m = median(runs);
      results.push(m);
      process.stdout.write(
        `\r${p.page.padEnd(16)} P${Math.round((m.scores.performance ?? 0) * 100)} A${Math.round(
          (m.scores.accessibility ?? 0) * 100,
        )} BP${Math.round((m.scores["best-practices"] ?? 0) * 100)} SEO${Math.round(
          (m.scores.seo ?? 0) * 100,
        )}\n`,
      );
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  await writeFile(OUT, JSON.stringify(results, null, 2));
  console.log(`✔ ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
