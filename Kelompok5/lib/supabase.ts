import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

// URL & anon key dibaca dari file .env
// JANGAN pakai service_role key di sini.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY belum diisi di file .env. " +
      "Setelah mengisi, restart dengan: npx expo start -c",
  );
}

const isWeb = Platform.OS === "web";

// Di HP, sesi login disimpan ke AsyncStorage agar tidak hilang saat aplikasi ditutup,
// dan agar "code verifier" PKCE tersimpan selama proses login Google.
// Di web, Supabase otomatis memakai localStorage.
const storage = isWeb
  ? undefined
  : // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@react-native-async-storage/async-storage").default;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    persistSession: true,
    autoRefreshToken: true,
    // Web: Supabase membaca ?code=... dari alamat halaman saat kembali dari Google.
    // HP: tidak ada alamat halaman, kode ditukar manual (lihat authService.ts).
    detectSessionInUrl: isWeb,
    // PKCE: Google mengembalikan ?code=..., bukan token mentah.
    // INI PENYEBAB UTAMA login Google gagal sebelumnya.
    flowType: "pkce",
  },
});

// Di HP, hentikan refresh token otomatis saat aplikasi di latar belakang.
if (!isWeb) {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}