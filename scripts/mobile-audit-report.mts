/**
 * Builds `docs/mobile-audit/README.md` from the two measurement sets the audit
 * harness produces (`before/measurements.json`, `after/measurements.json`) plus,
 * when present, the Lighthouse summary written by `scripts/lighthouse-mobile.mts`.
 *
 * Kept separate from the harness so the report can be regenerated without
 * re-driving a browser.
 *
 *   npm run audit:report
 */

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIR = "docs/mobile-audit";

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

type Row = {
  route: string;
  locale: string;
  viewport: string;
  url: string;
  docHeight: number;
  horizontalOverflow: boolean;
  overflowElements: { path: string; label: string }[];
  interactiveCount: number;
  smallTargets: SmallTarget[];
  extra: Record<string, unknown>;
};

const MOBILE = ["320x568", "360x740", "375x812", "390x844", "430x932", "844x390-landscape"];
const DESKTOP = ["1024x800", "1280x900", "1440x900"];
const ROUTES = [
  "home",
  "about",
  "book",
  "reviews",
  "review-detail",
  "blog",
  "blog-post",
  "contact",
  "privacy",
];

const load = async (set: string): Promise<Row[]> =>
  JSON.parse(await readFile(join(DIR, set, "measurements.json"), "utf8"));

const key = (r: Row) => `${r.viewport}|${r.locale}|${r.route}`;
const hard = (r: Row) => r.smallTargets.filter((t) => !t.inline);
const pct = (b: number, a: number) => (b === 0 ? "—" : `${Math.round(((a - b) / b) * 100)}%`);

function heightTable(before: Row[], after: Row[], viewport: string) {
  const b = new Map(before.filter((r) => r.viewport === viewport).map((r) => [key(r), r]));
  const a = new Map(after.filter((r) => r.viewport === viewport).map((r) => [key(r), r]));
  const lines = [
    "| page | locale | before | after | change |",
    "| --- | --- | ---: | ---: | ---: |",
  ];
  for (const route of ROUTES)
    for (const locale of ["mk", "en", "sr"]) {
      const k = `${viewport}|${locale}|${route}`;
      const bb = b.get(k);
      const aa = a.get(k);
      if (!bb || !aa) continue;
      const d = aa.docHeight - bb.docHeight;
      lines.push(
        `| ${route} | ${locale} | ${bb.docHeight.toLocaleString()} | ${aa.docHeight.toLocaleString()} | ${
          d === 0 ? "0" : `${d > 0 ? "+" : ""}${d.toLocaleString()} (${pct(bb.docHeight, aa.docHeight)})`
        } |`,
      );
    }
  return lines.join("\n");
}

function targetTable(before: Row[], after: Row[]) {
  const lines = [
    "| viewport | locale | sub-44 before | sub-44 after | inline-exempt after |",
    "| --- | --- | ---: | ---: | ---: |",
  ];
  for (const viewport of MOBILE)
    for (const locale of ["mk", "en", "sr"]) {
      const bs = before.filter((r) => r.viewport === viewport && r.locale === locale);
      const as = after.filter((r) => r.viewport === viewport && r.locale === locale);
      if (!bs.length || !as.length) continue;
      lines.push(
        `| ${viewport} | ${locale} | ${bs.reduce((n, r) => n + hard(r).length, 0)} | ${as.reduce(
          (n, r) => n + hard(r).length,
          0,
        )} | ${as.reduce((n, r) => n + r.smallTargets.filter((t) => t.inline).length, 0)} |`,
      );
    }
  return lines.join("\n");
}

function overflowTable(before: Row[], after: Row[]) {
  const count = (rows: Row[], vps: string[]) =>
    rows.filter((r) => vps.includes(r.viewport) && r.horizontalOverflow).length;
  const lines = [
    "| set | mobile pages with horizontal overflow | desktop pages with horizontal overflow |",
    "| --- | ---: | ---: |",
    `| before | ${count(before, MOBILE)} / ${before.filter((r) => MOBILE.includes(r.viewport)).length} | ${count(
      before,
      DESKTOP,
    )} / ${before.filter((r) => DESKTOP.includes(r.viewport)).length} |`,
    `| after | ${count(after, MOBILE)} / ${after.filter((r) => MOBILE.includes(r.viewport)).length} | ${count(
      after,
      DESKTOP,
    )} / ${after.filter((r) => DESKTOP.includes(r.viewport)).length} |`,
  ];
  const offenders = after.filter((r) => r.horizontalOverflow);
  if (offenders.length) {
    lines.push("", "**Offenders remaining after:**", "");
    for (const r of offenders)
      lines.push(
        `- ${r.viewport} ${r.locale} ${r.route}: ${r.overflowElements
          .slice(0, 3)
          .map((e) => `\`${e.path}\``)
          .join(", ")}`,
      );
  }
  return lines.join("\n");
}

function remainingTargets(after: Row[]) {
  const seen = new Map<string, { count: number; sample: SmallTarget; where: Set<string> }>();
  for (const r of after.filter((x) => MOBILE.includes(x.viewport)))
    for (const t of hard(r)) {
      const k = `${t.tag} · ${t.label || t.path}`;
      const e = seen.get(k) ?? { count: 0, sample: t, where: new Set<string>() };
      e.count++;
      e.where.add(r.route);
      seen.set(k, e);
    }
  if (!seen.size) return "None. Every interactive element measures at least 44×44 of effective hit area at every mobile viewport, in all three locales.";
  return [
    "| element | occurrences | painted | effective | pages |",
    "| --- | ---: | --- | --- | --- |",
    ...[...seen.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(
        ([k, v]) =>
          `| ${k.replace(/\|/g, "\\|")} | ${v.count} | ${v.sample.w}×${v.sample.h} | ${v.sample.effW}×${v.sample.effH} | ${[
            ...v.where,
          ].join(", ")} |`,
      ),
  ].join("\n");
}

function desktopParity(before: Row[], after: Row[]) {
  const b = new Map(before.map((r) => [key(r), r]));
  const rows: string[] = [];
  let changed = 0;
  for (const r of after.filter((x) => DESKTOP.includes(x.viewport))) {
    const o = b.get(key(r));
    if (!o) continue;
    if (o.docHeight !== r.docHeight) {
      changed++;
      rows.push(`| ${r.viewport} | ${r.route} | ${o.docHeight} | ${r.docHeight} | **${r.docHeight - o.docHeight}** |`);
    }
  }
  const total = after.filter((x) => DESKTOP.includes(x.viewport)).length;
  if (!changed)
    return `All ${total} desktop page measurements (1024 / 1280 / 1440 px × 9 routes × 3 locales where captured) are **identical** to the baseline, to the pixel.`;
  return [
    `${changed} of ${total} desktop measurements differ from the baseline:`,
    "",
    "| viewport | page | before | after | Δ |",
    "| --- | --- | ---: | ---: | ---: |",
    ...rows,
  ].join("\n");
}

async function lighthouseSection() {
  const p = join(DIR, "lighthouse.json");
  if (!existsSync(p)) return "_Not captured in this run._";
  const data: {
    url: string;
    page: string;
    scores: Record<string, number | null>;
    metrics: Record<string, number | null>;
  }[] = JSON.parse(await readFile(p, "utf8"));
  const s = (v: number | null | undefined) => (v == null ? "—" : String(Math.round(v * 100)));
  return [
    "| page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...data.map(
      (d) =>
        `| ${d.page} | ${s(d.scores.performance)} | ${s(d.scores.accessibility)} | ${s(
          d.scores["best-practices"],
        )} | ${s(d.scores.seo)} | ${
          d.metrics.lcp == null ? "—" : `${(d.metrics.lcp / 1000).toFixed(2)}s`
        } | ${d.metrics.cls == null ? "—" : d.metrics.cls.toFixed(3)} | ${
          d.metrics.tbt == null ? "—" : `${Math.round(d.metrics.tbt)}ms`
        } |`,
    ),
  ].join("\n");
}

async function main() {
  const before = await load("before");
  const after = await load("after");

  const md = `# Mobile audit — Phase 3.01

Generated by \`npm run audit:report\` from \`before/measurements.json\` and
\`after/measurements.json\`, both produced by \`scripts/mobile-audit.mts\` — a
dependency-free Chrome DevTools Protocol harness (no Playwright / Puppeteer, per
the phase's no-new-dependency rule).

**Matrix:** 9 routes × 3 locales (mk / en / sr) × 6 mobile viewports
(320×568, 360×740, 375×812, 390×844, 430×932, and 844×390 landscape), plus
3 desktop viewports (1024, 1280, 1440) for non-regression — ${before.length}
measurements per set.

**What is measured per page:** full document height; every element extending past
the viewport width; and every interactive element whose *effective hit area* is
under 44 × 44. Effective hit area is probed with \`document.elementFromPoint\`
walking outward from the element's centre, so a target enlarged by a transparent
\`::before\` overlay measures at its real tappable size rather than its painted
size — and, importantly, a target whose enlarged area is **stolen by an
overlapping neighbour** is correctly reported as still failing.

WCAG 2.2 AA SC 2.5.8 exempts targets rendered inline within a sentence or block
of text. Those are counted separately as "inline-exempt" throughout: growing them
would make body text *harder* to tap, not easier, because adjacent lines' hit
areas would overlap.

Screenshots are in \`before/screens/\` and \`after/screens/\`, named
\`<viewport>_<locale>_<route>.jpg\`. Every route × locale is captured at 375×812;
\`/mk\` is additionally captured at 320 and 430, at 844×390 landscape for the
three longest pages, and at all three desktop widths for the five most
structurally complex pages.

---

## 1. Document height — 375 × 812 (the reference phone)

${heightTable(before, after, "375x812")}

## 2. Document height — 320 × 568 (the smallest phone)

${heightTable(before, after, "320x568")}

## 3. Document height — 430 × 932 (the largest phone)

${heightTable(before, after, "430x932")}

## 4. Touch targets under 44 × 44

${targetTable(before, after)}

### Remaining sub-44 targets after

${remainingTargets(after)}

## 5. Horizontal overflow

${overflowTable(before, after)}

## 6. Desktop non-regression

${desktopParity(before, after)}

## 7. Lighthouse (mobile, throttled)

${await lighthouseSection()}
`;

  await writeFile(join(DIR, "README.md"), md);
  console.log(`✔ ${join(DIR, "README.md")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
