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
  { key: "produk", label: "Produk", icon: "cube-outline", iconActive: "cube", href: "/kelola-produk?role=owner" as Href },
  { key: "laporan", label: "Laporan", icon: "document-text-outline", iconActive: "document-text", href: "/admin/laporan" },
  { key: "profil", label: "Profil", icon: "person-outline", iconActive: "person", href: "/profil?role=owner" as Href },
];

const STAFF_TABS: NavTab[] = [
  { key: "produk", label: "Produk", icon: "cube-outline", iconActive: "cube", href: "/kelola-produk?role=karyawan" as Href },
  { key: "pesanan", label: "Pesanan", icon: "receipt-outline", iconActive: "receipt", href: "/pesanan?role=karyawan" as Href },
  { key: "profil", label: "Profil", icon: "person-outline", iconActive: "person", href: "/profil?role=karyawan" as Href },
];

export function tabsForRole(role: Role): NavTab[] {
  if (role === "owner") return OWNER_TABS;
  if (role === "karyawan") return STAFF_TABS;
  return CUSTOMER_TABS;
}

export function parseRole(value?: string): Role {
  return value === "owner" || value === "karyawan" ? value : "pelanggan";
}

export const LOGIN_HREF: Record<Role, Href> = {
  owner: "/admin/login",
  karyawan: "/karyawan/login",
  pelanggan: "/pelanggan/login",
};
