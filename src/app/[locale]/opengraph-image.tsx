import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

/**
 * The site's default Open Graph / Twitter share card (Phase 1.12).
 *
 * A branded, photography-free card in the Style A "Hardcover" palette: the
 * Playfair wordmark on the cream ground, a caramel rule, and the localized
 * one-line descriptor (the same role line the Home hero uses). Because this is a
 * file-convention image, Next auto-injects `og:image` + `twitter:image` for every
 * route under `[locale]` — so the metadata helper deliberately sets no image
 * fields (no duplicate tag). Real per-page photo cards drop into deeper route
 * segments in Part 2 without touching this.
 *
 * Runs in the default Node.js runtime (it reads the bundled font files from disk).
 * One card is generated per locale via `generateStaticParams`.
 */

export const alt = "Dalibor Plečić";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender one card per locale (matches the statically-rendered locale roots).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Style A tokens (mirrored from globals.css — ImageResponse can't read CSS vars).
const CREAM = "#F4EDE1";
const ESPRESSO = "#2E2218";
const MUTED = "#6F5D46";
const CARAMEL = "#A87437";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "home" });
  const tagline = t("title");

  // Static, single-subset TTFs bundled in-repo. Satori (next/og) doesn't parse
  // variable fonts, so we ship static instances and cover the full charset by
  // loading one font per subset and stacking them in `fontFamily` — Satori falls
  // back per-glyph across the stack. Coverage needed: the wordmark's č/ć
  // (Latin-ext) and the Macedonian (Cyrillic) tagline.
  const dir = join(process.cwd(), "src/lib/seo/og-fonts");
  const [pfLatin, pfExt, loraLatin, loraExt, loraCyr] = await Promise.all([
    readFile(join(dir, "pf-latin.ttf")),
    readFile(join(dir, "pf-ext.ttf")),
    readFile(join(dir, "lora-latin.ttf")),
    readFile(join(dir, "lora-ext.ttf")),
    readFile(join(dir, "lora-cyr.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: CREAM,
          padding: "96px",
          fontFamily: "Lora, LoraExt, LoraCyr",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Playfair, PlayfairExt",
            fontSize: 104,
            color: ESPRESSO,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          Dalibor Plečić
        </div>

        {/* Caramel rule (the §6.16 brand rule, single line for the card). */}
        <div
          style={{
            display: "flex",
            width: 148,
            height: 5,
            backgroundColor: CARAMEL,
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        <div
          style={{
            display: "flex",
            fontFamily: "Lora, LoraExt, LoraCyr",
            fontSize: 42,
            color: MUTED,
            lineHeight: 1.3,
            maxWidth: 820,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: pfLatin, weight: 700, style: "normal" },
        { name: "PlayfairExt", data: pfExt, weight: 700, style: "normal" },
        { name: "Lora", data: loraLatin, weight: 400, style: "normal" },
        { name: "LoraExt", data: loraExt, weight: 400, style: "normal" },
        { name: "LoraCyr", data: loraCyr, weight: 400, style: "normal" },
      ],
    },
  );
}
