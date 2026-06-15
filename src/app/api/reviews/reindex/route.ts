import type {NextRequest} from "next/server";

import {
  buildReviewEmbeddingText,
  reviewEmbeddingHash,
} from "@/lib/search/review-embedding-text";
import {semanticConfigured} from "@/lib/search/reviews-search";
import {client} from "@/sanity/lib/client";
import {REVIEW_BY_SLUG_QUERY} from "@/sanity/lib/queries";

/**
 * `POST /api/reviews/reindex` — DORMANT in Part 1. Nothing calls this yet; the
 * Sanity → re-index webhook that drives it is wired in Phase 2.03. It is built
 * now so the schema and the embedding pipeline are in place, but it stays inert
 * until both the webhook secret AND the three search env vars are configured.
 *
 * Re-indexes a single review into the vector store: it embeds ONE combined
 * cross-lingual document per review and upserts it by slug. The request must
 * carry the shared `x-webhook-secret`; the service-role Supabase write happens
 * server-side only.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Re-index route not configured.", {status: 503});
  }
  if (request.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized.", {status: 401});
  }
  // Same gate as the search orchestrator — single-sourced via semanticConfigured().
  if (!semanticConfigured()) {
    return new Response("Semantic search not configured.", {status: 503});
  }

  let slug: unknown;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    slug = body.slug;
  } catch {
    return new Response("Invalid JSON body.", {status: 400});
  }
  if (typeof slug !== "string" || slug.length === 0) {
    return new Response("Missing or invalid 'slug'.", {status: 400});
  }

  const review = await client.fetch(REVIEW_BY_SLUG_QUERY, {slug});
  if (!review) {
    return new Response("Review not found.", {status: 404});
  }

  // One vector row per review (decision #5): the multilingual model matches
  // cross-lingually from this single combined-language source text. Built via
  // the shared builder so this route and the backfill script embed identically.
  const content = buildReviewEmbeddingText(review);
  const contentHash = reviewEmbeddingHash(content);

  const {embedDocuments, EMBEDDING_MODEL} = await import(
    "@/lib/search/embeddings"
  );
  const {getSupabaseAdmin} = await import("@/lib/search/supabase");

  const [embedding] = await embedDocuments([content]);

  const supabase = getSupabaseAdmin();
  const {error} = await supabase.from("review_embeddings").upsert(
    {
      slug,
      content,
      embedding,
      model: EMBEDDING_MODEL,
      content_hash: contentHash,
      updated_at: new Date().toISOString(),
    },
    {onConflict: "slug"},
  );
  if (error) {
    return new Response("Failed to store embedding.", {status: 500});
  }

  return Response.json({ok: true, slug, model: EMBEDDING_MODEL});
}
