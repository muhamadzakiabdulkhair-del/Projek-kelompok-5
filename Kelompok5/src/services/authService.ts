/**
 * authService.ts
 * Pemanggilan Supabase Auth yang tidak terkait tampilan.
 *
 * Alur login Google (PKCE):
 *   Web : halaman dialihkan ke Google, lalu kembali ke /auth/callback?code=...
 *         Supabase (detectSessionInUrl) menukar kode itu otomatis.
 *   HP  : alamat Google dibuka lewat openAuthSessionAsync; setelah kembali,
 *         kode dibaca dari alamat balikan dan ditukar lewat tukarKode().
 */

import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import type { Profil } from "@/context/auth";
import { supabase } from "../../lib/supabase";

// Diperlukan di web agar jendela login bisa menutup dirinya sendiri.
WebBrowser.maybeCompleteAuthSession();

// ─── Profil ───────────────────────────────────────────────────────────────────

export async function ambilProfil(userId: string): Promise<Profil | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nama, peran, phone, avatar_url, status")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    // Biasanya karena RLS atau tabel belum ada. Dicatat agar mudah dilacak.
    console.warn("[auth] gagal membaca profil:", error.code, error.message);
    return null;
  }
  return (data as Profil | null) ?? null;
}

// ─── Alamat balikan (redirect) ────────────────────────────────────────────────

/**
 * Alamat tujuan Google setelah login. HARUS terdaftar di
 * Supabase -> Authentication -> URL Configuration -> Redirect URLs.
 *   Web       : http://localhost:8081/auth/callback
 *   Expo Go   : exp://192.168.x.x:8081/--/auth/callback  (IP berubah-ubah)
 *   Build/APK : proyekkelompok5://auth/callback          (dari "scheme" di app.json)
 */
export function alamatCallback(): string {
  return Linking.createURL("auth/callback");
}

// ─── Membaca hasil dari alamat balikan ────────────────────────────────────────

type ParamAuth = Record<string, string>;

/** Membaca parameter dari ?query dan #fragment sekaligus. */
export function bacaParamAuth(url: string): ParamAuth {
  const [tanpaHash, hash = ""] = url.split("#");
  const query = tanpaHash.split("?")[1] ?? "";
  const hasil: ParamAuth = {};
  for (const bagian of [query, hash]) {
    if (!bagian) continue;
    for (const pasangan of bagian.split("&")) {
      if (!pasangan) continue;
      const [k, v = ""] = pasangan.split("=");
      try {
        hasil[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
      } catch {
        hasil[k] = v;
      }
    }
  }
  return hasil;
}

/** Mengubah error dari Google/Supabase menjadi pesan yang mudah dipahami. */
export function pesanErrorOAuth(param: ParamAuth): string {
  const deskripsi = (param.error_description ?? param.error ?? "").toLowerCase();
  if (deskripsi.includes("database error saving new user")) {
    return "Akun Google belum bisa dibuat di server (trigger profil bermasalah). Hubungi pengembang.";
  }
  if (deskripsi.includes("access_denied") || deskripsi.includes("denied")) {
    return "Login Google dibatalkan.";
  }
  if (deskripsi.includes("redirect")) {
    return "Alamat balikan belum terdaftar di Supabase. Hubungi pengembang.";
  }
  return "Login Google gagal. Coba lagi.";
}

// ─── Menukar kode menjadi sesi ────────────────────────────────────────────────

export type HasilTukar = { ok: true } | { ok: false; message: string };

// Kode OAuth hanya bisa dipakai SEKALI. Di Android, kode yang sama bisa sampai ke
// dua tempat (hasil openAuthSessionAsync dan layar /auth/callback). Dengan menyimpan
// janji per kode, pemanggilan kedua mendapat hasil yang sama, bukan error.
const penukaran = new Map<string, Promise<HasilTukar>>();

export function tukarKode(kode: string): Promise<HasilTukar> {
  let janji = penukaran.get(kode);
  if (!janji) {
    janji = supabase.auth.exchangeCodeForSession(kode).then(({ data, error }) => {
      if (error || !data.session) {
        console.warn("[auth] gagal menukar kode:", error?.code, error?.message);
        return { ok: false, message: "Gagal menyelesaikan login Google. Coba lagi." } as const;
      }
      return { ok: true } as const;
    });
    penukaran.set(kode, janji);
  }
  return janji;
}

/** Menukar sesi dari alamat balikan lengkap (dipakai di HP). */
export async function sesiDariAlamat(url: string): Promise<HasilTukar> {
  const param = bacaParamAuth(url);
  if (param.error || param.error_description) {
    return { ok: false, message: pesanErrorOAuth(param) };
  }
  if (!param.code) {
    return { ok: false, message: "Tidak ada kode otorisasi dari Google. Coba lagi." };
  }
  return tukarKode(param.code);
}

// ─── Memulai login Google ─────────────────────────────────────────────────────

export type HasilMulaiGoogle =
  | { status: "selesai" } // HP: sesi sudah terbentuk
  | { status: "dialihkan" } // Web: halaman sedang pindah ke Google
  | { status: "batal" } // Pengguna menutup jendela Google
  | { status: "gagal"; message: string };

export async function mulaiLoginGoogle(): Promise<HasilMulaiGoogle> {
  const redirectTo = alamatCallback();
  if (__DEV__) console.log("[auth] redirectTo =", redirectTo); // daftarkan persis ini di Supabase

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== "web",
      queryParams: { prompt: "select_account" }, // selalu tampilkan pilihan akun
    },
  });
  if (error) {
    console.warn("[auth] signInWithOAuth gagal:", error.message);
    return { status: "gagal", message: "Tidak dapat membuka Google. Coba lagi." };
  }

  // Web: supabase-js sudah mengalihkan halaman ke Google.
  if (Platform.OS === "web") return { status: "dialihkan" };

  if (!data.url) {
    return { status: "gagal", message: "Tidak dapat membuka Google. Coba lagi." };
  }

  const hasil = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (hasil.type !== "success" || !hasil.url) return { status: "batal" };

  const tukar = await sesiDariAlamat(hasil.url);
  return tukar.ok ? { status: "selesai" } : { status: "gagal", message: tukar.message };
}