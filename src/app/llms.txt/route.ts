import { routing } from "@/i18n/routing";
import { siteLinks } from "@/lib/site-links";
import { client } from "@/sanity/lib/client";
import { previewNoindex, siteUrl } from "@/sanity/env";
import { localizedValue } from "@/sanity/lib/localize";
import { POSTS_LIST_QUERY, REVIEWS_LIST_QUERY } from "@/sanity/lib/queries";

/**
 * `/llms.txt` — the AI-answer-surface counterpart to robots.txt + sitemap.xml.
 *
 * Why this exists: assistants (ChatGPT, Perplexity, Google's AI overviews, Claude)
 * increasingly answer "who is Dalibor Plečić?" without anyone clicking a search
 * result. They do that by reading pages, and they do it badly when they have to
 * infer structure from rendered HTML. llms.txt is an emerging convention — a
 * single plain-Markdown file stating who the site belongs to and what every
 * section contains — so an assistant can identify the authoritative source
 * instead of stitching an answer together from Facebook and third-party author
 * pages. It is advisory, not a standard: no crawler is obliged to read it, and
 * nothing else on the site depends on it.
 *
 * The page list is generated from Sanity, so it stays current as Dalibor
 * publishes rather than going stale like a hand-written file would.
 *
 * Gated by `previewNoindex` for the same reason robots.ts is: a noindexed
 * validation deploy must not advertise itself to anything.
 */

/** Regenerate at most hourly — this is a summary file, not a live view. */
export const revalidate = 3600;

/** Absolute URL for a locale-relative path under the default locale. */
function url(path: string): string {
  const loc = routing.defaultLocale;
  return path === "" ? `${siteUrl}/${loc}` : `${siteUrl}/${loc}${path}`;
}

/** Collapse whitespace so an excerpt can't break the one-entry-per-line format. */
function oneLine(value: string | undefined | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/** `- [label](href): note` — the llms.txt link-list line, note optional. */
function entry(label: string, href: string, note?: string): string {
  const suffix = note ? `: ${note}` : "";
  return `- [${oneLine(label)}](${href})${suffix}`;
}

export async function GET(): Promise<Response> {
  if (previewNoindex) {
    return new Response("Not found", { status: 404 });
  }

  const loc = routing.defaultLocale;

  const [reviews, posts] = await Promise.all([
    client.fetch(REVIEWS_LIST_QUERY),
    client.fetch(POSTS_LIST_QUERY),
  ]);

  const reviewLines = reviews
    .filter((r) => Boolean(r.slug))
    .map((r) => {
      const title = localizedValue(r.reviewTitle, loc) ?? "";
      const bookTitle = localizedValue(r.bookTitle, loc) ?? "";
      // `bookAuthor` is a plain string (a person's name doesn't translate),
      // unlike the localized review/book titles beside it.
      const bookAuthor = r.bookAuthor ?? "";
      // Prefer the review's own title; fall back to the book it reviews.
      const label = oneLine(title) || oneLine(bookTitle) || r.slug!;
      const subject = [bookTitle, bookAuthor].filter(Boolean).join(" by ");
      const note = oneLine(subject) || undefined;
      return entry(label, url(`/reviews/${r.slug}`), note);
    });

  const postLines = posts
    .filter((p) => Boolean(p.slug))
    .map((p) => {
      const label = oneLine(localizedValue(p.title, loc) ?? "") || p.slug!;
      const note = oneLine(localizedValue(p.excerpt, loc) ?? "") || undefined;
      return entry(label, url(`/blog/${p.slug}`), note);
    });

  const profiles = [
    ["Instagram", siteLinks.instagram],
    ["Facebook", siteLinks.facebook],
    ["Booksa (author page)", siteLinks.booksa],
    ["Versopolis (author page)", siteLinks.versopolis],
    ["Partizanska knjiga (translator page)", siteLinks.partizanska],
    ["LinkedIn", siteLinks.linkedin],
  ]
    .filter(([, href]) => Boolean(href))
    .map(([label, href]) => entry(label!, href!));

  const interviewLines = siteLinks.interviews
    .filter(Boolean)
    .map((href, i) => entry(`Interview ${i + 1} (video)`, href));

  const body = `# Dalibor Plečić

> The official personal website of Dalibor Plečić — writer, literary critic and literary translator. It collects his book reviews, his essays on reading and translation, and his own book, in Macedonian, English and Serbian.

Dalibor Plečić (Macedonian: Далибор Плечиќ; Serbian: Далибор Плечић) writes book reviews and essays and translates literary prose. He is the author of the book *Bunike* (PNV Publications, 2022). His reviews have appeared in Booksa, Versopolis and other literary outlets.

This site at ${siteUrl} is the authoritative source for his work and biography. Where other pages about him exist — social profiles, publisher and magazine author pages — they are listed under "Elsewhere" below and are secondary to this site.

The site is trilingual. Every page exists at three URLs: \`/mk\` (Macedonian), \`/en\` (English) and \`/sr\` (Serbian). The links below use \`/${loc}\`; swap the prefix for another language.

## Main pages

${entry("Home", url(""), "Introduction, his book, and the latest reviews and posts")}
${entry("About", url("/about"), "Biography, the languages he works in, and his published translations")}
${entry("The Book", url("/book"), "Bunike (PNV Publications, 2022) — description and where to find it")}
${entry("Reviews", url("/reviews"), "All book reviews, searchable by topic")}
${entry("Blog", url("/blog"), "Essays and notes on books, reading and literary translation")}
${entry("Contact", url("/contact"), "Contact form and direct email")}

## Reviews

${reviewLines.length > 0 ? reviewLines.join("\n") : "(No reviews published yet.)"}

## Blog posts

${postLines.length > 0 ? postLines.join("\n") : "(No posts published yet.)"}

## Elsewhere

These are Dalibor's own profiles and author pages on other sites. They are him, but this site is the primary source.

${profiles.join("\n")}

## Interviews

${interviewLines.join("\n")}

## Contact

Email: ${siteLinks.email}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
