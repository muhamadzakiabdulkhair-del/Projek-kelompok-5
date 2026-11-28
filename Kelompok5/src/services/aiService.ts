/**
 * aiService.ts
 * Menyediakan data statistik model AI dan ringkasan rekomendasi
 * untuk halaman admin. Membaca dari:
 *   - assets/ai/metrics.json  (hasil latih train.py)
 *   - public.rekomendasi      (hasil buat_rekomendasi.py)
 *   - public.produk_populer   (cadangan cold-start)
 *   - public.interactions     (jumlah data latih)
 *   - public.pemetaan_user    (jumlah user yang punya rekomendasi)
 *
 * File ini TIDAK memuat model TFLite secara langsung — model dijalankan
 * offline via train.py + buat_rekomendasi.py, hasilnya disimpan ke Supabase.
 */

import { supabase } from "../../lib/supabase";

// ─── Tipe ─────────────────────────────────────────────────────────────────────

export type MetricsJson = {
  "precision@5": number;
  "recall@5": number;
  n_test_users: number;
  n_users: number;
  n_items: number;
  data_source: string;
};

export type StatistikAI = {
  /** Apakah metrics.json berhasil dibaca */
  metricsAda: boolean;
  metrics: MetricsJson | null;
  /** Jumlah baris di tabel interactions (data latih) */
  jumlahInteraksi: number;
  /** Jumlah user yang punya entri di tabel rekomendasi */
  jumlahUserDirekomendasikan: number;
  /** Jumlah baris produk_populer (cold-start) */
  jumlahProdukPopuler: number;
  /** true bila model terlatih dari data nyata (bukan sintetis) */
  dataReal: boolean;
};

// ─── Baca metrics.json ────────────────────────────────────────────────────────

let cachedMetrics: MetricsJson | null | undefined = undefined; // undefined = belum dicoba

function bacaMetrics(): MetricsJson | null {
  if (cachedMetrics !== undefined) return cachedMetrics;
  try {
    // require() aman di RN karena Metro membundel JSON sebagai modul statis.
    // Path naik 2 tingkat dari src/services/ ke root Kelompok5, lalu assets/ai/.
    const json = require("../../assets/ai/metrics.json");
    cachedMetrics = json as MetricsJson;
  } catch {
    cachedMetrics = null;
  }
  return cachedMetrics;
}

// ─── Query Supabase ───────────────────────────────────────────────────────────

/** Ambil semua statistik AI untuk ditampilkan di halaman admin. */
export async function fetchStatistikAI(): Promise<StatistikAI> {
  const metrics = bacaMetrics();

  // Jalankan semua query paralel agar cepat
  const [interaksiRes, rekRes, popRes] = await Promise.all([
    supabase.from("interactions").select("id", { count: "exact", head: true }),
    supabase
      .from("rekomendasi")
      .select("user_id", { count: "exact", head: true }),
    supabase
      .from("produk_populer")
      .select("item_id", { count: "exact", head: true }),
  ]);

  return {
    metricsAda: metrics !== null,
    metrics,
    jumlahInteraksi: interaksiRes.count ?? 0,
    jumlahUserDirekomendasikan: rekRes.count ?? 0,
    jumlahProdukPopuler: popRes.count ?? 0,
    dataReal:
      metrics !== null && metrics.data_source !== "sintetis",
  };
}

/** Ambil 10 rekomendasi terbaru di tabel (lintas user, untuk preview admin). */
export type PraviewRekomendasi = {
  userId: string;
  itemId: string;
  peringkat: number;
};

export async function fetchPraviewRekomendasi(): Promise<
  PraviewRekomendasi[]
> {
  const { data, error } = await supabase
    .from("rekomendasi")
    .select("user_id, item_id, peringkat")
    .order("peringkat", { ascending: true })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { user_id: string; item_id: string; peringkat: number }) => ({
    userId: r.user_id,
    itemId: r.item_id,
    peringkat: r.peringkat,
  }));
}

/** Ambil produk terpopuler (cold-start). */
export type ProdukPopuler = {
  itemId: string;
  peringkat: number;
  jumlahUser: number;
};

export async function fetchProdukPopuler(): Promise<ProdukPopuler[]> {
  const { data, error } = await supabase
    .from("produk_populer")
    .select("item_id, peringkat, jumlah_user")
    .order("peringkat", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { item_id: string; peringkat: number; jumlah_user: number }) => ({
    itemId: r.item_id,
    peringkat: r.peringkat,
    jumlahUser: r.jumlah_user,
  }));
}
