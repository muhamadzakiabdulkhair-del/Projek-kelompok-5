// Edge Function: buat-karyawan
// Owner membuat akun karyawan. Semua pemeriksaan hak akses dilakukan DI SINI
// (server), bukan di aplikasi.
//
// Alur: cek token -> cek pemanggil = owner Aktif -> validasi data
//       -> auth.admin.createUser -> cek profil -> kembalikan hasil.
//
// Kunci rahasia (service role) hanya dibaca dari environment server,
// tidak pernah ditulis di kode ini maupun di aplikasi.

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Kunci server: pakai SUPABASE_SERVICE_ROLE_KEY bila ada,
// jika tidak ada pakai secret key "default" dari SUPABASE_SECRET_KEYS.
function ambilKunciServer(): string {
  const lama = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (lama) return lama;
  const mentah = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (mentah) {
    try {
      const obj = JSON.parse(mentah) as Record<string, unknown>;
      if (typeof obj.default === "string") return obj.default;
      const pertama = Object.values(obj)[0];
      if (typeof pertama === "string") return pertama;
    } catch {
      // abaikan, lanjut ke hasil kosong
    }
  }
  return "";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "Metode tidak diizinkan." }, 405);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const kunci = ambilKunciServer();
  if (!url || !kunci) {
    console.error("Konfigurasi server belum lengkap (URL/kunci).");
    return json({ error: "Server belum dikonfigurasi dengan benar." }, 500);
  }

  const admin = createClient(url, kunci, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Verifikasi token pemanggil
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return json({ error: "Anda belum login." }, 401);

  const { data: dataUser, error: errUser } = await admin.auth.getUser(token);
  if (errUser || !dataUser?.user) {
    return json({ error: "Sesi tidak valid. Silakan login ulang." }, 401);
  }

  // 2. Pemanggil harus owner dan berstatus Aktif (dibaca dari database)
  const { data: pemanggil, error: errProfil } = await admin
    .from("profiles")
    .select("peran, status")
    .eq("id", dataUser.user.id)
    .maybeSingle();
  if (errProfil) {
    console.error("Gagal membaca profil pemanggil:", errProfil.message);
    return json({ error: "Terjadi kesalahan pada server." }, 500);
  }
  if (!pemanggil || pemanggil.peran !== "owner" || pemanggil.status !== "Aktif") {
    return json({ error: "Hanya owner yang boleh mendaftarkan karyawan." }, 403);
  }

  // 3. Baca dan validasi data (validasi ulang, tidak percaya frontend)
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Data yang dikirim tidak valid." }, 400);
  }
  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!nama) return json({ error: "Nama lengkap wajib diisi." }, 400);
  if (nama.length > 100) return json({ error: "Nama terlalu panjang (maksimal 100 karakter)." }, 400);
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return json({ error: "Format email tidak valid." }, 400);
  }
  if (password.length < 8) return json({ error: "Password minimal 8 karakter." }, 400);
  if (password.length > 72) return json({ error: "Password maksimal 72 karakter." }, 400);

  // 4. Buat akun lewat Admin API.
  //    app_metadata.peran dibaca trigger handle_new_user() -> profil langsung 'karyawan'.
  const { data: dibuat, error: errBuat } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama },
    app_metadata: { peran: "karyawan" },
  });

  if (errBuat || !dibuat?.user) {
    const pesan = (errBuat?.message ?? "").toLowerCase();
    const kode = (errBuat as { code?: string } | null)?.code ?? "";
    if (kode === "email_exists" || pesan.includes("already") || pesan.includes("registered")) {
      return json({ error: "Email sudah terdaftar." }, 409);
    }
    if (kode === "weak_password" || pesan.includes("password")) {
      return json({ error: "Password terlalu lemah. Gunakan kombinasi yang lebih kuat." }, 400);
    }
    console.error("Gagal membuat akun:", errBuat?.message);
    return json({ error: "Gagal membuat akun. Coba lagi." }, 500);
  }

  const idBaru = dibuat.user.id;

  // 5. Pastikan profil benar-benar terbentuk dengan peran karyawan.
  //    Jika tidak, batalkan akun supaya tidak ada akun dengan peran salah.
  const { data: profil, error: errCek } = await admin
    .from("profiles")
    .select("id, email, nama, peran, status")
    .eq("id", idBaru)
    .maybeSingle();

  if (errCek || !profil || profil.peran !== "karyawan" || profil.status !== "Aktif") {
    console.error("Profil karyawan tidak sesuai, akun dibatalkan:", errCek?.message ?? profil);
    const { error: errHapus } = await admin.auth.admin.deleteUser(idBaru);
    if (errHapus) console.error("Rollback gagal:", errHapus.message);
    return json({ error: "Gagal menyimpan profil karyawan. Akun dibatalkan." }, 500);
  }

  // 6. Kembalikan data aman (tanpa password/token)
  return json({ profil }, 201);
});
