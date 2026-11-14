/**
 * karyawanService.ts
 * Operasi akun karyawan dan pelanggan untuk Owner.
 * - Daftar akun, edit nama/telepon: langsung ke public.profiles (diizinkan RLS untuk owner).
 * - Buat karyawan: Edge Function "buat-karyawan".
 * - Nonaktifkan/aktifkan dan reset password: Edge Function "kelola-akun"
 *   (pemeriksaan owner dilakukan di server).
 * Password hanya dikirim ke server dan tidak pernah disimpan di aplikasi.
 */

import {
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

// ─── Tipe ─────────────────────────────────────────────────────────────────────

export type StatusAkun = "Aktif" | "Nonaktif";
export type PeranAkun = "karyawan" | "pelanggan";

export type Karyawan = {
  id: string;
  email: string;
  nama: string;
  status: StatusAkun;
  created_at: string;
  phone?: string | null;
};

/** Karyawan dan pelanggan memakai bentuk data yang sama. */
export type Akun = Karyawan;

export type BuatKaryawanInput = {
  nama: string;
  email: string;
  password: string;
};

export type UbahAkunInput = {
  nama: string;
  phone: string;
};

const KOLOM_AKUN = "id, email, nama, phone, status, created_at";
const NAMA_PERAN: Record<PeranAkun, string> = {
  karyawan: "karyawan",
  pelanggan: "pelanggan",
};

// ─── Validasi (dipakai form dan service) ──────────────────────────────────────

/** Mengembalikan pesan error, atau undefined bila nama valid. */
export function validasiNama(nama: string): string | undefined {
  const n = nama.trim();
  if (!n) return "Nama lengkap wajib diisi.";
  if (n.length > 100) return "Nama terlalu panjang (maksimal 100 karakter).";
  return undefined;
}

/** Telepon opsional. Boleh kosong; bila diisi harus 8-20 karakter angka, spasi, strip, atau awalan +. */
export function validasiTelepon(phone: string): string | undefined {
  const p = phone.trim();
  if (!p) return undefined;
  if (!/^\+?[0-9][0-9\s-]*$/.test(p)) {
    return "Nomor telepon hanya boleh berisi angka, spasi, dan tanda strip.";
  }
  const jumlahAngka = p.replace(/\D/g, "").length;
  if (jumlahAngka < 8 || jumlahAngka > 15) {
    return "Nomor telepon harus 8 sampai 15 angka.";
  }
  return undefined;
}

/** Aturan password sama dengan saat membuat karyawan: 8-72 karakter. */
export function validasiPasswordBaru(password: string): string | undefined {
  if (!password) return "Password wajib diisi.";
  if (password.length < 8) return "Password minimal 8 karakter.";
  if (password.length > 72) return "Password maksimal 72 karakter.";
  return undefined;
}

// ─── Penanganan error Edge Function (dipakai ulang) ───────────────────────────

/**
 * Mengubah error dari supabase.functions.invoke menjadi Error dengan pesan ramah.
 * Catatan teknis dicetak ke console tanpa password/token.
 */
async function jelaskanError(
  error: unknown,
  namaFungsi: string,
  pesanUmum: string,
): Promise<Error> {
  const err = error as { name?: string; message?: string };
  console.warn(`[${namaFungsi}]`, err?.name, err?.message);

  // Server menjawab dengan status error (400/401/403/404/409/500)
  if (error instanceof FunctionsHttpError) {
    const status: number | undefined = error.context?.status;
    let pesan = pesanUmum;
    try {
      const isi = await error.context.json();
      if (typeof isi?.error === "string") pesan = isi.error;
      else if (status === 404) {
        pesan = `Fungsi ${namaFungsi} belum tersedia di server. Hubungi pengembang.`;
      } else if (status === 401) {
        pesan = "Sesi tidak valid. Silakan login ulang.";
      }
    } catch {
      // isi respons bukan JSON, pakai pesan umum
    }
    return new Error(pesan);
  }
  // Fungsi ada tetapi gagal dijalankan oleh platform
  if (error instanceof FunctionsRelayError) {
    return new Error("Fungsi server tidak dapat dijalankan. Hubungi pengembang.");
  }
  // Tidak sampai ke server (internet putus, diblokir CORS di web, dll.)
  return new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/** Ambil semua akun dengan peran tertentu dari Supabase (terbaru di atas). */
export async function fetchAkun(peran: PeranAkun): Promise<Akun[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(KOLOM_AKUN)
    .eq("peran", peran)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Gagal memuat daftar ${NAMA_PERAN[peran]}. Periksa koneksi lalu coba lagi.`,
    );
  }
  return (data ?? []) as Akun[];
}

/** Ambil semua akun dengan peran 'karyawan' (terbaru di atas). */
export function fetchKaryawan(): Promise<Karyawan[]> {
  return fetchAkun("karyawan");
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/** Daftarkan akun karyawan baru. Melempar Error dengan pesan yang ramah pengguna. */
export async function buatKaryawan(input: BuatKaryawanInput): Promise<Karyawan> {
  const { data, error } = await supabase.functions.invoke("buat-karyawan", {
    body: {
      nama: input.nama.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  });

  if (error) {
    throw await jelaskanError(error, "buat-karyawan", "Gagal mendaftarkan karyawan. Coba lagi.");
  }

  if (!data?.profil) {
    throw new Error("Respons server tidak lengkap. Muat ulang daftar untuk memastikan.");
  }
  // Respons server tidak memuat created_at; isi sementara agar tipe lengkap.
  return { created_at: new Date().toISOString(), ...data.profil } as Karyawan;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Ubah nama dan telepon langsung di profiles. Peran dan status tidak disentuh.
 * Telepon kosong disimpan sebagai null.
 */
export async function ubahAkun(
  id: string,
  peran: PeranAkun,
  input: UbahAkunInput,
): Promise<Akun> {
  const salahNama = validasiNama(input.nama);
  if (salahNama) throw new Error(salahNama);
  const salahTelp = validasiTelepon(input.phone);
  if (salahTelp) throw new Error(salahTelp);

  const phone = input.phone.trim();
  const { data, error } = await supabase
    .from("profiles")
    .update({ nama: input.nama.trim(), phone: phone === "" ? null : phone })
    .eq("id", id)
    .eq("peran", peran)
    .select(KOLOM_AKUN)
    .maybeSingle();

  if (error) {
    console.warn("[ubahAkun]", error.message);
    throw new Error("Gagal menyimpan perubahan. Periksa koneksi lalu coba lagi.");
  }
  // RLS atau filter peran yang tidak cocok membuat tidak ada baris yang berubah
  if (!data) throw new Error("Akun tidak ditemukan atau tidak dapat diubah.");
  return data as Akun;
}

/** Nonaktifkan / aktifkan akun lewat Edge Function. Mengembalikan status terbaru dari server. */
export async function setStatusAkun(
  id: string,
  status: StatusAkun,
): Promise<StatusAkun> {
  const { data, error } = await supabase.functions.invoke("kelola-akun", {
    body: { aksi: "set-status", id, status },
  });
  if (error) {
    throw await jelaskanError(error, "kelola-akun", "Gagal mengubah status akun. Coba lagi.");
  }
  const baru = data?.profil?.status;
  if (baru !== "Aktif" && baru !== "Nonaktif") {
    throw new Error("Respons server tidak lengkap. Muat ulang daftar untuk memastikan.");
  }
  return baru;
}

/** Reset password akun lewat Edge Function. Password tidak disimpan maupun dicatat. */
export async function resetPasswordAkun(id: string, password: string): Promise<void> {
  const salah = validasiPasswordBaru(password);
  if (salah) throw new Error(salah);

  const { data, error } = await supabase.functions.invoke("kelola-akun", {
    body: { aksi: "reset-password", id, password },
  });
  if (error) {
    throw await jelaskanError(error, "kelola-akun", "Gagal mereset password. Coba lagi.");
  }
  if (!data?.ok) {
    throw new Error("Respons server tidak lengkap. Coba ulangi reset password.");
  }
}
