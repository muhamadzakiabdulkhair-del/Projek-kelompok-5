import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "@/data/products";

export type CartLine = { product: Product; qty: number };

type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

// State keranjang sederhana (in-memory) supaya badge & halaman keranjang konsisten.
export function CartProvider({ children }: { children: ReactNode }) {
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const value = useMemo<CartValue>(() => {
    const lines = PRODUCTS.filter((p) => qtyById[p.id] > 0).map((p) => ({
      product: p,
      qty: qtyById[p.id],
    }));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      add: (id, qty = 1) => setQtyById((old) => ({ ...old, [id]: (old[id] ?? 0) + qty })),
      setQty: (id, qty) => setQtyById((old) => ({ ...old, [id]: Math.max(0, qty) })),
      remove: (id) => setQtyById((old) => ({ ...old, [id]: 0 })),
      clear: () => setQtyById({}),
    };
  }, [qtyById]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
