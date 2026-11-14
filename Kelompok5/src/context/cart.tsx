import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/auth";
import type { Product } from "@/data/products";

export type CartLine = { product: Product; qty: number };

type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

// State keranjang sederhana (in-memory) supaya badge & halaman keranjang konsisten.
// Yang disimpan adalah produk lengkap (bukan hanya id), sehingga produk dari
// Supabase (id berbentuk uuid) ikut dikenali. Sebelumnya keranjang mencocokkan id
// ke data dummy PRODUCTS, sehingga produk dari database tidak pernah muncul.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, CartLine>>({});
  const { profil } = useAuth();

  // Keranjang hanya milik pelanggan yang sedang login: kosongkan saat keluar
  useEffect(() => {
    if (!profil) setItems({});
  }, [profil]);

  const value = useMemo<CartValue>(() => {
    const lines = Object.values(items).filter((l) => l.qty > 0);
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      add: (product, qty = 1) =>
        setItems((old) => ({
          ...old,
          [product.id]: { product, qty: (old[product.id]?.qty ?? 0) + qty },
        })),
      setQty: (id, qty) =>
        setItems((old) =>
          old[id] ? { ...old, [id]: { ...old[id], qty: Math.max(0, qty) } } : old,
        ),
      remove: (id) =>
        setItems((old) => {
          const next = { ...old };
          delete next[id];
          return next;
        }),
      clear: () => setItems({}),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}