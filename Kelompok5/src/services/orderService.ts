/**
 * orderService.ts
 * Operasi CRUD pesanan ke Supabase. Tabel: public.orders
 * Kolom: id (INV-xxxx, dibuat database), customer, items, total, method, status, created_at
 */

import { supabase } from '../../lib/supabase';
import type { Order, OrderStatus, PaymentMethod } from '@/data/orders';

// ─── Tipe baris Supabase ──────────────────────────────────────────────────────

export type OrderRow = {
  id: string;
  customer: string;
  items: string;
  total: number;
  method: string;
  status: string;
  created_at: string;
};

/** Data pesanan baru. Kolom id dan tanggal dibuat oleh database. */
export type NewOrder = Omit<Order, 'id' | 'date'>;

// ─── Konversi ─────────────────────────────────────────────────────────────────

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Ubah baris Supabase menjadi tipe Order yang dipakai komponen */
export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customer: row.customer,
    date: formatTanggal(row.created_at),
    items: row.items,
    total: Number(row.total),
    method: row.method as PaymentMethod,
    status: row.status as OrderStatus,
  };
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(rowToOrder);
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createOrder(order: NewOrder): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer: order.customer,
      items: order.items,
      total: order.total,
      method: order.method,
      status: order.status,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToOrder(data as OrderRow);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToOrder(data as OrderRow);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
}