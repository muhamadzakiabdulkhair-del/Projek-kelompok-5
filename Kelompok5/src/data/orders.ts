export type OrderStatus = "Menunggu Bayar" | "Diproses" | "Selesai";
export type PaymentMethod = "Tunai" | "Transfer" | "QRIS";

export type Order = {
  id: string;
  customer: string;
  date: string;
  items: string;
  total: number;
  method: PaymentMethod;
  status: OrderStatus;
};

export const ORDER_STATUSES: OrderStatus[] = ["Menunggu Bayar", "Diproses", "Selesai"];

// Data dummy pesanan.
export const ORDERS: Order[] = [
  { id: "INV-1024", customer: "Rina Putri", date: "25 Okt 2026", items: "Uwell Caliburn G2 ×1, Liquid Naked 100 ×2", total: 750000, method: "QRIS", status: "Menunggu Bayar" },
  { id: "INV-1023", customer: "Dimas Aji", date: "24 Okt 2026", items: "Voopoo Drag X ×1", total: 1200000, method: "Transfer", status: "Diproses" },
  { id: "INV-1022", customer: "Sari Wulandari", date: "24 Okt 2026", items: "Coil Geekvape ×2", total: 240000, method: "Tunai", status: "Selesai" },
  { id: "INV-1021", customer: "Bagas Pratama", date: "23 Okt 2026", items: "Vaporesso XROS 3 ×1, Cartridge Pod ×1", total: 610000, method: "Transfer", status: "Selesai" },
  { id: "INV-1020", customer: "Lia Amelia", date: "22 Okt 2026", items: "Liquid Naked 100 ×3", total: 450000, method: "QRIS", status: "Selesai" },
];
