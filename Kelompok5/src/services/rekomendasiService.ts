/**
 * rekomendasiService.ts
 * Mengambil rekomendasi produk untuk pelanggan yang sedang login.
 *
 * Sumber data:
 *   1) public.rekomendasi     -> hasil model, khusus pelanggan ini (dijaga RLS)
 *   2) public.produk_populer  -> cadangan jika pelanggan belum punya rekomendasi
 */

import { supabase } from "../../lib/supabase";

export type SumberRekomendasi = "model" | "populer";

export type HasilRekomendasi = {
  sumber: SumberRekomendasi;
  itemIds: string[];
};

type BarisItem = { item_id: string; peringkat: number };

export async function fetchRekomendasi(): Promise<HasilRekomendasi | null> {
  // 1) Hasil model untuk pelanggan ini. RLS hanya mengembalikan baris miliknya.
  const mine = await supabase
    .from("rekomendasi")
    .select("item_id, peringkat")
    .order("peringkat", { ascending: true })
    .limit(5);
  const mineRows = (mine.data ?? []) as BarisItem[];
  if (!mine.error && mineRows.length > 0) {
    return { sumber: "model", itemIds: mineRows.map((r) => r.item_id) };
  }

  // 2) Cadangan: produk terpopuler.
  const pop = await supabase
    .from("produk_populer")
    .select("item_id, peringkat")
    .order("peringkat", { ascending: true })
    .limit(5);
  const popRows = (pop.data ?? []) as BarisItem[];
  if (!pop.error && popRows.length > 0) {
    return { sumber: "populer", itemIds: popRows.map((r) => r.item_id) };
  }

  return null;
}
