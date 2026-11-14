import type { Href } from "expo-router";
import type { IconName } from "@/types/icon";

export type Role = "owner" | "karyawan" | "pelanggan";

export type NavTab = {
  key: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
  href: Href;
};

const CUSTOMER_TABS: NavTab[] = [
  { key: "beranda", label: "Beranda", icon: "home-outline", iconActive: "home", href: "/dashboard" },
  { key: "keranjang", label: "Keranjang", icon: "cart-outline", iconActive: "cart", href: "/keranjang" },
  { key: "pesanan", label: "Pesanan", icon: "receipt-outline", iconActive: "receipt", href: "/pesanan" },
  { key: "profil", label: "Profil", icon: "person-outline", iconActive: "person", href: "/profil" },
];

const OWNER_TABS: NavTab[] = [
  { key: "dashboard", label: "Dashboard", icon: "stats-chart-outline", iconActive: "stats-chart", href: "/admin/dashboard" },
  { key: "produk", label: "Produk", icon: "cube-outline", iconActive: "cube", href: "/kelola-produk" },
  { key: "laporan", label: "Laporan", icon: "document-text-outline", iconActive: "document-text", href: "/admin/laporan" },
  { key: "profil", label: "Profil", icon: "person-outline", iconActive: "person", href: "/profil" },
];

const STAFF_TABS: NavTab[] = [
  { key: "produk", label: "Produk", icon: "cube-outline", iconActive: "cube", href: "/kelola-produk" },
  { key: "pesanan", label: "Pesanan", icon: "receipt-outline", iconActive: "receipt", href: "/pesanan" },
  { key: "profil", label: "Profil", icon: "person-outline", iconActive: "person", href: "/profil" },
];

export function tabsForRole(role: Role): NavTab[] {
  if (role === "owner") return OWNER_TABS;
  if (role === "karyawan") return STAFF_TABS;
  return CUSTOMER_TABS;
}

// Satu halaman login untuk semua peran
export const LOGIN_HREF: Href = "/login";

// Beranda tiap peran: tujuan setelah login, atau bila salah masuk halaman
export const BERANDA: Record<Role, Href> = {
  owner: "/admin/dashboard",
  karyawan: "/kelola-produk",
  pelanggan: "/dashboard",
};
