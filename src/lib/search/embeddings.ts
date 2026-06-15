import "server-only";

import {embed, embedMany} from "ai";
import {createVoyage} from "voyage-ai-provider";

/**
 * The SOLE Voyage access point for the project (Phase 1.09). Every embedding
 * call goes through here, so Phase 2.03 can swap the embedding provider (or a
 * future self-hosted model) without touching any call site — the orchestrator
 * and the re-index route only ever import `embedQuery` / `embedDocuments`.
 *
 * Importing this module never requires a key: the Voyage model is built lazily
 * inside `getModel()`, which runs only when an embed call is actually made (the
 * callers gate on `VOYAGE_API_KEY` being present before they get this far).
 */

/** The active Voyage embedding model id (overridable; defaults to voyage-3.5). */
export const EMBEDDING_MODEL = process.env.VOYAGE_MODEL || "voyage-3.5";

/**
 * Vector dimension for voyage-3.5 / voyage-4 (their default output). Must match
 * the `vector(1024)` column and the `match_reviews` RPC signature in the
 * migration; changing one without the others breaks the cosine search.
 */
export const EMBEDDING_DIMENSIONS = 1024;

/**
 * Build the Voyage embedding model on demand. Kept private and lazy so a bare
 * `import` of this module costs nothing and needs no env var.
 */
function getModel() {
  const voyage = createVoyage({apiKey: process.env.VOYAGE_API_KEY});
  // `.embeddingModel(...)` — `.textEmbeddingModel` is deprecated in v4.
  return voyage.embeddingModel(EMBEDDING_MODEL);
}

/** Embed a user search query (Voyage `inputType: "query"`). */
export async function embedQuery(text: string): Promise<number[]> {
  const {embedding} = await embed({
    model: getModel(),
    value: text,
    providerOptions: {voyage: {inputType: "query"}},
  });
  return embedding;
}

/**
 * Embed several queries in one request (Voyage `inputType: "query"`). The live
 * search embeds one query at a time via {@link embedQuery}; this batched form is
 * for tooling that scores many queries at once (e.g. the ranking test) and keeps
 * those within Voyage's request-rate limits.
 */
export async function embedQueries(texts: string[]): Promise<number[][]> {
  const {embeddings} = await embedMany({
    model: getModel(),
    values: texts,
    providerOptions: {voyage: {inputType: "query"}},
  });
  return embeddings;
}

/** Embed one or more documents for indexing (Voyage `inputType: "document"`). */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const {embeddings} = await embedMany({
    model: getModel(),
    values: texts,
    providerOptions: {voyage: {inputType: "document"}},
  });
  return embeddings;
}
