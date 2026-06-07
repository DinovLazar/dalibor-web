import "server-only";

import {createClient} from "@supabase/supabase-js";

/**
 * Supabase admin client for the vector store (Phase 1.09). Built from the
 * SERVICE ROLE key, which BYPASSES row-level security — so this module must
 * never be imported from a client component or otherwise reach the browser.
 * It is `server-only` for exactly that reason. Callers gate on the search env
 * vars being present before calling in; this throws a clear error if they are
 * somehow missing so misconfiguration fails loudly instead of silently.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, key, {auth: {persistSession: false}});
}
