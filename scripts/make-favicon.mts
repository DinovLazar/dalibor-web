/**
 * scripts/make-favicon.mts — Phase 2.01e browser-tab icon.
 *
 * Generates the App-Router icon files from Dalibor's square avatar so the site
 * shows his face in the browser tab / on a phone home screen instead of the
 * framework's default logo:
 *
 *   content-packet/assets/author/avatar-square.jpg  (512×512, face crop)
 *        → src/app/icon.png        512×512  (browser tab / general icon)
 *        → src/app/apple-icon.png  180×180  (apple-touch-icon)
 *
 * Next.js auto-emits the <link rel="icon"> / <link rel="apple-touch-icon"> tags
 * from these top-level `app/` files (see node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/01-metadata/app-icons.md). The default
 * `src/app/favicon.ico` is deleted separately so `icon.png` is authoritative.
 *
 * The avatar is already a square face crop, so this is a resize + PNG re-encode
 * (no cropping). `sharp` is a devDependency (favicon-generation only — not
 * shipped in the app bundle).
 *
 * Run:  npm run make:favicon   ( = node --import tsx scripts/make-favicon.mts )
 */
import {existsSync} from "node:fs";
import path from "node:path";

import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content-packet/assets/author/avatar-square.jpg");
const ICON = path.join(ROOT, "src/app/icon.png");
const APPLE_ICON = path.join(ROOT, "src/app/apple-icon.png");

if (!existsSync(SRC)) {
  console.error(`Favicon source missing: ${SRC}`);
  process.exit(1);
}

async function emit(out: string, size: number) {
  await sharp(SRC)
    // `fit: cover` keeps it square + fills the frame even if the source is not
    // exactly square; the avatar already is 512×512, so this is a clean resize.
    .resize(size, size, {fit: "cover"})
    .png()
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`  wrote ${path.relative(ROOT, out)} — ${meta.width}×${meta.height} ${meta.format}`);
}

console.log(`Generating app icons from ${path.relative(ROOT, SRC)}…`);
await emit(ICON, 512);
await emit(APPLE_ICON, 180);
console.log("Done.");
