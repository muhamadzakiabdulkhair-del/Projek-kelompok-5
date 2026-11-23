/**
 * notifikasiService.ts
 * Operasi notifikasi dalam aplikasi ke Supabase. Tabel: public.notifications
 * Kolom: id, user_id, tipe, judul, pesan, order_id, product_id, is_read, created_at
 *
 * Notifikasi HANYA dibuat oleh trigger database (lihat supabase/sql/004_notifikasi.sql).
 * Aplikasi hanya boleh membaca, menandai dibaca (kolom is_read), dan menghapus
 * milik sendiri. Pembatasan itu dijaga oleh RLS, bukan oleh kode ini.
 */

import { supabase } from "../../lib/supabase";

// ─── Tipe ─────────────────────────────────────────────────────────────────────

export type TipeNotifikasi = "pesanan_baru" | "status_pesanan" | "stok_menipis";

/** Baris mentah dari Supabase (juga bentuk payload Realtime). */
export type NotifikasiRow = {
  id: string;
  user_id: string;
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  order_id: string | null;
  product_id: string | null;
  is_read: boolean;
  created_at: string;
};

/** Bentuk yang dipakai layar dan komponen. */
export type Notifikasi = {
  id: string;
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  orderId: string | null;
  productId: string | null;
  dibaca: boolean;
  /** Waktu dibuat, format ISO. */
  dibuat: string;
};

/** Batas notifikasi yang dimuat sekaligus. */
const BATAS_MUAT = 100;

// ─── Konversi ─────────────────────────────────────────────────────────────────

export function rowToNotifikasi(row: NotifikasiRow): Notifikasi {
  return {
    id: row.id,
    tipe: row.tipe,
    judul: row.judul,
    pesan: row.pesan,
    orderId: row.order_id,
    productId: row.product_id,
    dibaca: row.is_read,
    dibuat: row.created_at,
  };
}

/** Waktu singkat untuk daftar: "Baru saja", "5 menit lalu", "2 jam lalu", "Kemarin", atau tanggal. */
export function formatWaktu(iso: string, sekarang: Date = new Date()): string {
  const waktu = new Date(iso);
  const selisihMs = sekarang.getTime() - waktu.getTime();
  if (Number.isNaN(selisihMs)) return "";

  const menit = Math.floor(selisihMs / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;

  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;

  const hari = Math.floor(jam / 24);
  if (hari === 1) return "Kemarin";
  if (hari < 7) return `${hari} hari lalu`;

  return waktu.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/** Ambil notifikasi milik pengguna yang login (terbaru di atas). RLS membatasi ke miliknya. */
export async function fetchNotifikasi(): Promise<Notifikasi[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(BATAS_MUAT);

  if (error) throw new Error(error.message);
  return (data as NotifikasiRow[]).map(rowToNotifikasi);
}

// ─── UPDATE (hanya kolom is_read) ─────────────────────────────────────────────

export async function tandaiDibaca(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/** Tandai semua notifikasi yang belum dibaca (milik sendiri) sebagai dibaca. */
export async function tandaiSemuaDibaca(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) throw new Error(error.message);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function hapusNotifikasi(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
