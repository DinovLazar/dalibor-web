-- Phase 1.09: review topic-search store. WRITTEN here; RUN in Phase 2.03.
create extension if not exists vector;

create table if not exists public.review_embeddings (
  slug         text primary key,           -- one row per review (language-neutral slug)
  content      text not null,              -- combined-language source text that was embedded
  embedding    vector(1024) not null,      -- 1024 = voyage-3.5 / voyage-4 default dim
  model        text not null,              -- e.g. 'voyage-3.5' (provenance)
  content_hash text not null,              -- skip re-embedding when unchanged
  updated_at   timestamptz not null default now()
);

-- HNSW + cosine: 2026 recommendation for sub-1M-row corpora.
create index if not exists review_embeddings_embedding_idx
  on public.review_embeddings using hnsw (embedding vector_cosine_ops);

-- Server-only access via the service role (which bypasses RLS). No public policy.
alter table public.review_embeddings enable row level security;

create or replace function public.match_reviews(
  query_embedding vector(1024),
  match_count int default 10,
  match_threshold float default 0.0
)
returns table (slug text, similarity float)
language sql stable
as $$
  select
    re.slug,
    1 - (re.embedding <=> query_embedding) as similarity
  from public.review_embeddings re
  where 1 - (re.embedding <=> query_embedding) >= match_threshold
  order by re.embedding <=> query_embedding
  limit match_count;
$$;
