import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Order, OrderStatus } from '@/data/orders';
import {
  createOrder,
  fetchOrders,
  updateOrderStatus,
  type NewOrder,
} from '@/services/orderService';

type OrdersValue = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addOrder: (order: NewOrder) => Promise<Order>;
  advanceStatus: (id: string) => Promise<void>;
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  'Menunggu Bayar': 'Diproses',
  Diproses: 'Selesai',
};

const OrdersContext = createContext<OrdersValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil ulang seluruh pesanan dari Supabase
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await fetchOrders());
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Simpan pesanan baru. Melempar error kalau gagal, supaya layar bisa menampilkannya.
  const addOrder = useCallback(async (order: NewOrder) => {
    const saved = await createOrder(order);
    setOrders((old) => [saved, ...old]);
    return saved;
  }, []);

  // Naikkan status satu tahap: Menunggu Bayar -> Diproses -> Selesai
  const advanceStatus = useCallback(
    async (id: string) => {
      const current = orders.find((o) => o.id === id);
      const next = current ? NEXT_STATUS[current.status] : undefined;
      if (!current || !next) return;

      const saved = await updateOrderStatus(id, next);
      setOrders((old) => old.map((o) => (o.id === id ? saved : o)));
    },
    [orders],
  );

  return (
    <OrdersContext.Provider
      value={{ orders, loading, error, refresh, addOrder, advanceStatus }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders harus dipakai di dalam OrdersProvider');
  return ctx;
}