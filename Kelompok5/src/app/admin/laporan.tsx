import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav }        from "@/components/bottom-nav";
import { DatePickerInput }  from "@/components/date-picker-input";
import { ScreenHeader }     from "@/components/screen-header";
import { tabsForRole }      from "@/constants/navigation";
import { colors, radius }   from "@/constants/palette";
import { PRODUCTS, formatRupiah, type Product } from "@/data/products";
import { fetchProducts }    from "@/services/productService";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesRow = { kind: "sales"; id: string; date: string; trx: number; omzet: number };
type StockRow = { kind: "stock"; id: string; name: string; stock: number; purchasePrice: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = colors.primary;

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

// ─── Dummy data penjualan (belum ada tabel orders di Supabase) ────────────────

const SALES: SalesRow[] = [
  { kind: "sales", id: "s1", date: "2026-10-25", trx: 12, omzet: 3450000 },
  { kind: "sales", id: "s2", date: "2026-10-24", trx: 9,  omzet: 2870000 },
  { kind: "sales", id: "s3", date: "2026-10-23", trx: 14, omzet: 4120000 },
  { kind: "sales", id: "s4", date: "2026-10-22", trx: 7,  omzet: 1980000 },
  { kind: "sales", id: "s5", date: "2026-09-15", trx: 11, omzet: 3100000 },
  { kind: "sales", id: "s6", date: "2026-09-10", trx: 8,  omzet: 2400000 },
  { kind: "sales", id: "s7", date: "2026-08-20", trx: 6,  omzet: 1750000 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTanggal(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${NAMA_BULAN[month - 1]} ${year}`;
}

function markedInMonth(year: number, month: number): Set<number> {
  const s = new Set<number>();
  SALES.forEach((r) => {
    const [y, m] = r.date.split("-").map(Number);
    if (y === year && m === month) s.add(Number(r.date.split("-")[2]));
  });
  return s;
}

/**
 * Hitung rata-rata margin dari semua produk Supabase.
 * Dipakai untuk estimasi laba dari data penjualan dummy
 * (karena SALES tidak punya breakdown per produk).
 */
function hitungRataMargin(products: Product[]): number {
  const valid = products.filter((p) => p.price > 0 && p.purchasePrice >= 0);
  if (valid.length === 0) return 0.3; // fallback 30%
  const totalMargin = valid.reduce(
    (sum, p) => sum + (p.price - p.purchasePrice) / p.price,
    0,
  );
  return totalMargin / valid.length;
}

/** Hitung nilai & modal total stok dari Supabase */
function hitungStokFinansial(products: Product[]) {
  return products
    .filter((p) => p.isActive !== false)
    .reduce(
      (acc, p) => ({
        nilaiStok: acc.nilaiStok + p.price * p.stock,
        modalStok: acc.modalStok + p.purchasePrice * p.stock,
      }),
      { nilaiStok: 0, modalStok: 0 },
    );
}

function persen(n: number) {
  return n.toFixed(1) + "%";
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string; sub?: string;
  color?: string; icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={sc.card}>
      <View style={[sc.iconBox, { backgroundColor: color ? color + "22" : colors.primarySoft }]}>
        <Ionicons name={icon} size={18} color={color ?? GREEN} />
      </View>
      <View style={sc.text}>
        <Text style={sc.label}>{label}</Text>
        <Text style={[sc.value, color ? { color } : {}]}>{value}</Text>
        {sub ? <Text style={sc.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, marginBottom: 8,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  text: { flex: 1 },
  label: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  value: { fontSize: 16, fontWeight: "900", color: GREEN, marginTop: 1 },
  sub:   { fontSize: 10, color: colors.muted, marginTop: 1 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LaporanScreen() {
  // ── Supabase: data produk (untuk harga_beli & stok) ──────────────────────
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingDb,  setLoadingDb]  = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setDbProducts)
      .catch(() => setDbProducts(PRODUCTS)) // fallback ke dummy jika gagal
      .finally(() => setLoadingDb(false));
  }, []);

  // ── Filter tanggal ────────────────────────────────────────────────────────
  const [selected,   setSelected]  = useState<string | null>(null);
  const today = new Date();
  const [viewYear,   setViewYear]  = useState(today.getFullYear());
  const [viewMonth,  setViewMonth] = useState(today.getMonth() + 1);
  const marked = markedInMonth(viewYear, viewMonth);

  // ── Data yang difilter ────────────────────────────────────────────────────
  const filteredSales = selected
    ? SALES.filter((r) => r.date === selected)
    : SALES;

  const totalOmzet = filteredSales.reduce((n, r) => n + r.omzet, 0);
  const totalTrx   = filteredSales.reduce((n, r) => n + r.trx, 0);

  // ── Kalkulasi laba pakai margin rata-rata dari harga_beli Supabase ────────
  const avgMargin  = hitungRataMargin(dbProducts.length > 0 ? dbProducts : PRODUCTS);
  const estimasiModal = Math.round(totalOmzet * (1 - avgMargin));
  const estimasiLaba  = totalOmzet - estimasiModal;
  const marginPct     = totalOmzet > 0 ? (estimasiLaba / totalOmzet) * 100 : 0;

  // ── Statistik stok dari Supabase ──────────────────────────────────────────
  const stockSource = dbProducts.length > 0 ? dbProducts : PRODUCTS;
  const { nilaiStok, modalStok } = hitungStokFinansial(stockSource);
  const potensiLaba = nilaiStok - modalStok;

  const stokHabis   = stockSource.filter((p) => p.stock <= 0).length;
  const stokMenipis = stockSource.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const stokAman    = stockSource.filter((p) => p.stock > 5).length;

  // ── Stocks untuk tabel ────────────────────────────────────────────────────
  const stockRows: StockRow[] = stockSource.map((p) => ({
    kind: "stock", id: "k" + p.id,
    name: p.name, stock: p.stock,
    purchasePrice: p.purchasePrice,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Laporan" subtitle="Penjualan & Keuangan" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── FILTER TANGGAL ── */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filter Laporan Penjualan</Text>
          <DatePickerInput
            label="Tanggal"
            placeholder="Semua tanggal"
            value={selected}
            onChange={setSelected}
            markedDates={marked}
            onViewChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
          />
        </View>

        {/* ══════════════════════════════════════════════
            SECTION 1 — PENJUALAN HARIAN
        ══════════════════════════════════════════════ */}
        <View style={styles.sectionHead}>
          <Ionicons name="calendar-outline" size={18} color={GREEN} />
          <Text style={styles.sectionTitle}>Penjualan Harian</Text>
        </View>

        {/* Ringkasan omzet */}
        <View style={styles.omzetCard}>
          <Text style={styles.omzetLabel}>
            {selected ? formatTanggal(selected) : "Semua periode"}
          </Text>
          <Text style={styles.omzetValue}>{formatRupiah(totalOmzet)}</Text>
          <Text style={styles.omzetMeta}>Total omzet · {totalTrx} transaksi</Text>
        </View>

        {/* Baris penjualan */}
        {filteredSales.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={28} color="#A8BDB0" />
            <Text style={styles.emptyText}>
              Belum ada data penjualan{selected ? ` pada ${formatTanggal(selected)}` : ""}.
            </Text>
          </View>
        ) : (
          filteredSales.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{formatTanggal(item.date)}</Text>
                <Text style={styles.rowSub}>{item.trx} transaksi</Text>
              </View>
              <Text style={styles.rowValue}>{formatRupiah(item.omzet)}</Text>
            </View>
          ))
        )}

        {/* ══════════════════════════════════════════════
            SECTION 2 — LAPORAN KEUANGAN (dari Supabase)
        ══════════════════════════════════════════════ */}
        <View style={[styles.sectionHead, { marginTop: 20 }]}>
          <Ionicons name="cash-outline" size={18} color={GREEN} />
          <Text style={styles.sectionTitle}>Laporan Keuangan</Text>
          {loadingDb && (
            <ActivityIndicator size="small" color={GREEN} style={{ marginLeft: 8 }} />
          )}
        </View>

        <Text style={styles.sectionNote}>
          Margin dihitung dari harga beli produk di database Supabase.
        </Text>

        <SummaryCard
          icon="trending-up-outline"
          label="Total Omzet"
          value={formatRupiah(totalOmzet)}
          sub={`${totalTrx} transaksi`}
        />
        <SummaryCard
          icon="arrow-down-circle-outline"
          label="Estimasi Modal (HPP)"
          value={formatRupiah(estimasiModal)}
          sub={`Margin rata-rata: ${persen(avgMargin * 100)}`}
          color={colors.warning}
        />
        <SummaryCard
          icon="bar-chart-outline"
          label="Estimasi Laba Bruto"
          value={formatRupiah(estimasiLaba)}
          sub={`Margin: ${persen(marginPct)}`}
          color={estimasiLaba >= 0 ? GREEN : colors.danger}
        />

        {/* ══════════════════════════════════════════════
            SECTION 3 — STOK AKHIR (dari Supabase)
        ══════════════════════════════════════════════ */}
        <View style={[styles.sectionHead, { marginTop: 20 }]}>
          <Ionicons name="cube-outline" size={18} color={GREEN} />
          <Text style={styles.sectionTitle}>Stok Akhir</Text>
          {loadingDb && (
            <ActivityIndicator size="small" color={GREEN} style={{ marginLeft: 8 }} />
          )}
        </View>

        {/* Statistik stok finansial */}
        <View style={styles.stokFinRow}>
          <View style={[styles.stokFinCard, { backgroundColor: "#E8F5EE" }]}>
            <Text style={styles.stokFinLabel}>Nilai Stok</Text>
            <Text style={[styles.stokFinValue, { color: GREEN }]}>{formatRupiah(nilaiStok)}</Text>
            <Text style={styles.stokFinSub}>Harga jual × stok</Text>
          </View>
          <View style={[styles.stokFinCard, { backgroundColor: "#FFF0F0" }]}>
            <Text style={styles.stokFinLabel}>Modal Stok</Text>
            <Text style={[styles.stokFinValue, { color: colors.danger }]}>{formatRupiah(modalStok)}</Text>
            <Text style={styles.stokFinSub}>Harga beli × stok</Text>
          </View>
          <View style={[styles.stokFinCard, { backgroundColor: "#EEF9F2" }]}>
            <Text style={styles.stokFinLabel}>Potensi Laba</Text>
            <Text style={[styles.stokFinValue, { color: GREEN }]}>{formatRupiah(potensiLaba)}</Text>
            <Text style={styles.stokFinSub}>Jika semua terjual</Text>
          </View>
        </View>

        {/* Badge status stok */}
        <View style={styles.stokBadgeRow}>
          <View style={[styles.stokBadge, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={14} color={GREEN} />
            <Text style={[styles.stokBadgeText, { color: GREEN }]}>{stokAman} aman</Text>
          </View>
          <View style={[styles.stokBadge, { backgroundColor: colors.warningSoft }]}>
            <Ionicons name="warning" size={14} color={colors.warning} />
            <Text style={[styles.stokBadgeText, { color: colors.warning }]}>{stokMenipis} menipis</Text>
          </View>
          <View style={[styles.stokBadge, { backgroundColor: colors.dangerSoft }]}>
            <Ionicons name="close-circle" size={14} color={colors.danger} />
            <Text style={[styles.stokBadgeText, { color: colors.danger }]}>{stokHabis} habis</Text>
          </View>
        </View>

        {/* Tabel stok per produk */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.cell, styles.cellWide, styles.headText]}>PRODUK</Text>
            <Text style={[styles.cell, styles.cellNum, styles.headText]}>STOK</Text>
            <Text style={[styles.cell, styles.cellNum, styles.headText]}>MODAL/unit</Text>
            <Text style={[styles.cell, styles.cellNum, styles.headText]}>NILAI</Text>
          </View>
          {stockRows.map((item, i) => {
            const stockColor =
              item.stock <= 0 ? colors.danger
              : item.stock <= 5 ? colors.warning
              : colors.ink;
            return (
              <View key={item.id} style={[styles.tableRow, i % 2 === 1 && styles.tableAlt]}>
                <Text style={[styles.cell, styles.cellWide]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.cell, styles.cellNum, { color: stockColor }]}>
                  {item.stock <= 0 ? "Habis" : item.stock}
                </Text>
                <Text style={[styles.cell, styles.cellNum]}>
                  {formatRupiah(item.purchasePrice)}
                </Text>
                <Text style={[styles.cell, styles.cellNum, styles.bold]}>
                  {formatRupiah(item.purchasePrice * item.stock)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav tabs={tabsForRole("owner")} active="laporan" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24 },

  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: 14, marginBottom: 16, gap: 10,
  },
  filterTitle: { fontSize: 13, fontWeight: "800", color: colors.ink },

  sectionHead: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, flex: 1 },
  sectionNote:  { fontSize: 11, color: colors.muted, marginBottom: 10, marginTop: -4 },

  // Omzet summary
  omzetCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg, padding: 14,
    gap: 2, marginBottom: 10,
  },
  omzetLabel: { fontSize: 11, color: colors.muted },
  omzetValue: { fontSize: 20, fontWeight: "900", color: GREEN },
  omzetMeta:  { fontSize: 11, color: colors.muted },

  // Baris penjualan
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 12, marginBottom: 8,
  },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
  rowSub:   { fontSize: 12, color: colors.muted, marginTop: 2 },
  rowValue: { fontSize: 13, fontWeight: "800", color: GREEN },

  emptyBox: {
    minHeight: 100, alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: 14, marginBottom: 8,
  },
  emptyText: { fontSize: 11, color: colors.muted, textAlign: "center" },

  // Stok finansial
  stokFinRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  stokFinCard: {
    flex: 1, borderRadius: radius.md, padding: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  stokFinLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },
  stokFinValue: { fontSize: 13, fontWeight: "900", marginTop: 2 },
  stokFinSub:   { fontSize: 9, color: colors.muted, marginTop: 2 },

  stokBadgeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stokBadge: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 4, paddingVertical: 6, borderRadius: radius.md,
  },
  stokBadgeText: { fontSize: 11, fontWeight: "700" },

  // Tabel
  table:     { borderRadius: radius.sm, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  tableRow:  { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 10, alignItems: "center" },
  tableHead: { backgroundColor: colors.primarySoft },
  tableAlt:  { backgroundColor: colors.tint },
  headText:  { fontWeight: "800", color: GREEN, fontSize: 10 },
  cell:      { fontSize: 10, color: colors.ink },
  cellWide:  { flex: 2 },
  cellNum:   { flex: 1, textAlign: "right" },
  bold:      { fontWeight: "800" },
});
