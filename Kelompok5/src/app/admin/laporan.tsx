import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { PRODUCTS, formatRupiah } from "@/data/products";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesRow = {
  kind: "sales";
  id: string;
  date: string; // "YYYY-MM-DD"
  trx: number;
  omzet: number;
};

type StockRow = {
  kind: "stock";
  id: string;
  name: string;
  stock: number;
};

type ReportRow = SalesRow | StockRow;

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = colors.primary;

const NAMA_BULAN = [
  "Januari","Februari","Maret","April",
  "Mei","Juni","Juli","Agustus",
  "September","Oktober","November","Desember",
];

const NAMA_HARI = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

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
  kind: "stock",
  id: "k" + p.id,
  name: p.name,
  stock: p.stock,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

/** Kumpulan tanggal (angka) yang punya data di bulan/tahun tertentu */
function salesDatesSet(year: number, month: number): Set<number> {
  const s = new Set<number>();
  SALES.forEach((r) => {
    const [y, m, d] = r.date.split("-").map(Number);
    if (y === year && m === month) s.add(d);
  });
  return s;
}

function formatTanggal(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${NAMA_BULAN[month - 1]} ${year}`;
}

// ─── Calendar component ───────────────────────────────────────────────────────

type CalendarProps = {
  /** Tanggal yang terpilih, null = tidak ada pilihan (tampilkan semua bulan) */
  selected: string | null; // "YYYY-MM-DD"
  onSelect: (date: string | null) => void;
};

function Calendar({ selected, onSelect }: CalendarProps) {
  const today = new Date();

  const initYear  = selected ? Number(selected.split("-")[0]) : today.getFullYear();
  const initMonth = selected ? Number(selected.split("-")[1]) : today.getMonth() + 1;

  const [viewYear,  setViewYear]  = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay  = firstDayOfMonth(viewYear, viewMonth);
  const hasSales  = salesDatesSet(viewYear, viewMonth);

  const selectedDay = selected
    ? (() => {
        const [y, m, d] = selected.split("-").map(Number);
        return y === viewYear && m === viewMonth ? d : null;
      })()
    : null;

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayPress(day: number) {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    // tap tanggal yang sama → deselect (kembali ke semua)
    if (selected === dateStr) onSelect(null);
    else onSelect(dateStr);
  }

  // Build grid
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDay   = today.getDate();
  const isThisMonth = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;

  return (
    <View style={cal.wrap}>
      {/* ── Header navigasi bulan ── */}
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={18} color={GREEN} />
        </TouchableOpacity>

        <Text style={cal.headerTitle}>
          {NAMA_BULAN[viewMonth - 1]} {viewYear}
        </Text>

        <TouchableOpacity onPress={nextMonth} style={cal.navBtn} hitSlop={12}>
          <Ionicons name="chevron-forward" size={18} color={GREEN} />
        </TouchableOpacity>
      </View>

      {/* ── Label hari ── */}
      <View style={cal.row}>
        {NAMA_HARI.map((h) => (
          <View key={h} style={cal.cell}>
            <Text style={cal.dayLabel}>{h}</Text>
          </View>
        ))}
      </View>

      {/* ── Grid tanggal ── */}
      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={cal.row}>
          {cells.slice(week * 7, week * 7 + 7).map((day, idx) => {
            if (day === null) return <View key={`e-${idx}`} style={cal.cell} />;

            const isSelected = day === selectedDay;
            const isToday    = isThisMonth && day === todayDay;
            const hasDot     = hasSales.has(day);

            return (
              <TouchableOpacity
                key={day}
                style={[
                  cal.cell,
                  isToday    && !isSelected && cal.todayCell,
                  isSelected && cal.selectedCell,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    cal.dayText,
                    isToday    && !isSelected && cal.todayText,
                    isSelected && cal.selectedText,
                  ]}
                >
                  {day}
                </Text>
                {hasDot && (
                  <View style={[cal.dot, isSelected && cal.dotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* ── Keterangan ── */}
      <View style={cal.legend}>
        <View style={cal.legendItem}>
          <View style={[cal.dot, { position: "relative", marginTop: 0 }]} />
          <Text style={cal.legendText}>Ada transaksi</Text>
        </View>
        <Text style={cal.legendHint}>
          {selected ? "Tap tanggal lagi untuk reset" : "Tap tanggal untuk filter"}
        </Text>
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    marginVertical: 1,
    marginHorizontal: 1,
    borderRadius: 8,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.3,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.ink,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  todayText: {
    color: GREEN,
    fontWeight: "800",
  },
  selectedCell: {
    backgroundColor: GREEN,
  },
  selectedText: {
    color: colors.white,
    fontWeight: "900",
  },
  dot: {
    position: "absolute",
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 10,
    color: colors.muted,
  },
  legendHint: {
    fontSize: 10,
    color: colors.muted,
    fontStyle: "italic",
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LaporanScreen() {
  // selected = "YYYY-MM-DD" atau null (semua data)
  const [selected, setSelected] = useState<string | null>(null);

  const filteredSales = selected
    ? SALES.filter((r) => r.date === selected)
    : SALES;

  const totalOmzet = filteredSales.reduce((n, r) => n + r.omzet, 0);
  const totalTrx   = filteredSales.reduce((n, r) => n + r.trx, 0);

  const periodLabel = selected
    ? formatTanggal(selected)
    : "Semua data";

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
            {/* ── KALENDER FILTER ─── */}
            <View style={styles.calCard}>
              <View style={styles.calCardTitle}>
                <Ionicons name="calendar-outline" size={16} color={GREEN} />
                <Text style={styles.calCardTitleText}>Filter Laporan Penjualan</Text>
                {selected && (
                  <TouchableOpacity
                    onPress={() => setSelected(null)}
                    style={styles.resetChip}
                  >
                    <Ionicons name="close-circle" size={14} color={colors.danger} />
                    <Text style={styles.resetChipText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Calendar selected={selected} onSelect={setSelected} />
            </View>

            {/* ── RINGKASAN ─── */}
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

  calCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  calCardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  calCardTitleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  resetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
  },
  resetChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.danger,
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
