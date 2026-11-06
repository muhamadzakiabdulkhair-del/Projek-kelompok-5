/**
 * productService.ts
 * Semua operasi CRUD produk ke Supabase.
 * Tabel: public.products
 * Kolom: id, nama, harga, harga_beli, deskripsi, kategori, stok, is_active, foto_url, created_at
 */

import { supabase } from "../../lib/supabase";
import type { Category, Product } from "@/data/products";
import { CATEGORY_IMAGES } from "@/data/products";

// ─── Tipe baris Supabase ──────────────────────────────────────────────────────

export type ProductRow = {
  id: string;
  nama: string;
  harga: number;
  harga_beli: number;
  deskripsi: string | null;
  kategori: string;
  stok: number;
  is_active: boolean;
  foto_url: string | null;
  created_at: string;
};

// ─── Konversi ─────────────────────────────────────────────────────────────────

/** Ubah baris Supabase → tipe Product yang dipakai komponen */
export function rowToProduct(row: ProductRow): Product {
  const category = (row.kategori as Category) ?? "Aksesori";
  return {
    id: row.id,
    name: row.nama,
    sub: row.deskripsi ?? category,
    category,
    price: Number(row.harga),
    purchasePrice: Number(row.harga_beli ?? 0),
    stock: row.stok,
    isActive: row.is_active ?? true,
    rating: 0,
    reviews: 0,
    description: row.deskripsi ?? "",
    image: CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Aksesori"],
  };
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(rowToProduct);
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export type CreateProductInput = {
  nama: string;
  harga: number;
  harga_beli: number;
  deskripsi?: string;
  kategori: string;
  stok: number;
  foto_url?: string | null;
};

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, is_active: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToProduct(data as ProductRow);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export type UpdateProductInput = Partial<CreateProductInput> & {
  is_active?: boolean;
};

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToProduct(data as ProductRow);
}

// ─── DELETE (soft: nonaktifkan) ───────────────────────────────────────────────

/** Nonaktifkan produk (is_active = false) alih-alih hapus permanen */
export async function deactivateProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/** Aktifkan kembali produk */
export async function activateProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
