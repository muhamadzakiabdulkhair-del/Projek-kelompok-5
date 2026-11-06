import { createClient } from "@supabase/supabase-js";

// Ganti dua nilai ini dengan Project URL dan anon key dari
// Project Settings → API di dashboard Supabase.
// JANGAN pakai service_role key — anon key sudah cukup selama RLS aktif.
const SUPABASE_URL = "https://axupgavlsgezpzrrfogj.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_65R7-G58BPmzxKpYRpdqbA_y7XqbUZZ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
