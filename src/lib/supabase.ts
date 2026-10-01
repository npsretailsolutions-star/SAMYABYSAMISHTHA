import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase storage is not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "product-images";
