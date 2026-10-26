import { createContext, useContext, useState, type ReactNode } from "react";
import { ORDERS, type Order, type OrderStatus } from "@/data/orders";

type OrdersValue = {
  orders: Order[];
  addOrder: (order: Order) => void;
  advanceStatus: (id: string) => void;
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  "Menunggu Bayar": "Diproses",
  Diproses: "Selesai",
};

const OrdersContext = createContext<OrdersValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  function addOrder(order: Order) {
    setOrders((old) => [order, ...old]);
  }

  function advanceStatus(id: string) {
    setOrders((old) =>
      old.map((o) =>
        o.id === id && NEXT_STATUS[o.status]
          ? { ...o, status: NEXT_STATUS[o.status]! }
          : o,
      ),
    );
  }

  return (
    <OrdersContext.Provider value={{ orders, addOrder, advanceStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders harus dipakai di dalam OrdersProvider");
  return ctx;
}
