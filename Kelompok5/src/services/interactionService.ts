/**
 * interactionService.ts
 * Mencatat interaksi pelanggan dengan produk, sebagai data latih model rekomendasi.
 * Tabel: public.interactions
 * Kolom: id, user_id (otomatis dari akun yang login), item_id, aksi, created_at
 */

import { supabase } from "../../lib/supabase";

export type AksiInteraksi = "view" | "cart" | "beli";

/**
 * Catat satu interaksi. Hanya dipanggil untuk pelanggan yang sudah login.
 * Tidak pernah melempar error, agar kegagalan pencatatan tidak mengganggu belanja.
 */
export function catatInteraksi(itemId: string, aksi: AksiInteraksi): void {
  supabase
    .from("interactions")
    .insert({ item_id: itemId, aksi })
    .then(
      ({ error }) => {
        if (error && __DEV__)
          console.warn("Gagal mencatat interaksi:", error.message);
      },
      () => {},
    );
}
