import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { DatePickerInput } from "@/components/date-picker-input";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { PRODUCTS, formatRupiah } from "@/data/products";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesRow = { kind: "sales"; id: string; date: string; trx: number; omzet: number };
type StockRow = { kind: "stock"; id: string; name: string; stock: number };
type ReportRow = SalesRow | StockRow;

const GREEN = colors.primary;

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

// ─── Dummy data ───────────────────────────────────────────────────────────────

const SALES: SalesRow[] = [
  { kind: "sales", id: "s1", date: "2026-10-25", trx: 12, omzet: 3450000 },
  { kind: "sales", id: "s2", date: "2026-10-24", trx: 9,  omzet: 2870000 },
  { kind: "sales", id: "s3", date: "2026-10-23", trx: 14, omzet: 4120000 },
  { kind: "sales", id: "s4", date: "2026-10-22", trx: 7,  omzet: 1980000 },
  { kind: "sales", id: "s5", date: "2026-09-15", trx: 11, omzet: 3100000 },
  { kind: "sales", id: "s6", date: "2026-09-10", trx: 8,  omzet: 2400000 },
  { kind: "sales", id: "s7", date: "2026-08-20", trx: 6,  omzet: 1750000 },
];

const STOCKS: StockRow[] = PRODUCTS.map((p) => ({
  kind: "stock", id: "k" + p.id, name: p.name, stock: p.stock,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTanggal(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${NAMA_BULAN[month - 1]} ${year}`;
}

/** Kumpulkan tanggal yang ada data penjualan di bulan/tahun tertentu */
function markedInMonth(year: number, month: number): Set<number> {
  const s = new Set<number>();
  SALES.forEach((r) => {
    const [y, m, d] = r.date.split("-").map(Number);
    if (y === year && m === month) s.add(d);
  });
  return s;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LaporanScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  // Ikuti navigasi bulan di kalender supaya dot selalu update
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const marked = markedInMonth(viewYear, viewMonth);

  const filteredSales = selected
    ? SALES.filter((r) => r.date === selected)
    : SALES;

  const totalOmzet = filteredSales.reduce((n, r) => n + r.omzet, 0);
  const totalTrx   = filteredSales.reduce((n, r) => n + r.trx, 0);

  const sections = [
    {
      title: "Penjualan Harian",
      icon: "calendar-outline" as const,
      data: filteredSales as ReportRow[],
    },
    {
      title: "Stok Akhir",
      icon: "cube-outline" as const,
      data: STOCKS as ReportRow[],
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Laporan" subtitle="Penjualan harian & stok akhir" />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
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

            {/* ── RINGKASAN ── */}
            <View style={styles.summaryRow}>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>
                  {selected ? formatTanggal(selected) : "Semua periode"}
                </Text>
                <Text style={styles.summaryValue}>{formatRupiah(totalOmzet)}</Text>
                <Text style={styles.summaryMeta}>Total omzet · {totalTrx} transaksi</Text>
              </View>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <Ionicons name={section.icon} size={18} color={GREEN} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) =>
          item.kind === "sales" ? (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{formatTanggal(item.date)}</Text>
                <Text style={styles.rowSub}>{item.trx} transaksi</Text>
              </View>
              <Text style={styles.rowValue}>{formatRupiah(item.omzet)}</Text>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{item.name}</Text>
              </View>
              <Text
                style={[
                  styles.rowValue,
                  item.stock <= 0 && { color: colors.danger },
                  item.stock > 0 && item.stock <= 5 && { color: colors.warning },
                ]}
              >
                {item.stock <= 0 ? "Habis" : `${item.stock} unit`}
              </Text>
            </View>
          )
        }
        renderSectionFooter={({ section }) =>
          section.title === "Penjualan Harian" && filteredSales.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={28} color="#A8BDB0" />
              <Text style={styles.emptyText}>
                Belum ada data penjualan{selected ? ` pada ${formatTanggal(selected)}` : ""}.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 10 }} />}
      />

      <BottomNav tabs={tabsForRole("owner")} active="laporan" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24 },

  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },

  summaryRow: { marginBottom: 6 },
  summary: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 14,
    gap: 2,
  },
  summaryLabel: { fontSize: 11, color: colors.muted },
  summaryValue: { fontSize: 20, fontWeight: "900", color: GREEN },
  summaryMeta:  { fontSize: 11, color: colors.muted },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
  rowSub:   { fontSize: 12, color: colors.muted, marginTop: 2 },
  rowValue: { fontSize: 13, fontWeight: "800", color: GREEN },

  emptyBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
  },
  emptyText: { fontSize: 11, color: colors.muted, textAlign: "center" },
});
