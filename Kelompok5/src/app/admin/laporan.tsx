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

// ─── Types ───────────────────────────────────────────────────────────────────

type SalesRow = {
  kind: "sales";
  id: string;
  /** ISO date string: "YYYY-MM-DD" */
  date: string;
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

/** "semua" | "bulan" | "tanggal" */
type FilterMode = "semua" | "bulan" | "tanggal";

// ─── Constants ───────────────────────────────────────────────────────────────

const GREEN = colors.primary;

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

const NAMA_HARI_PENDEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// ─── Dummy data ───────────────────────────────────────────────────────────────

const SALES: SalesRow[] = [
  { kind: "sales", id: "s1",  date: "2026-10-25", trx: 12, omzet: 3450000 },
  { kind: "sales", id: "s2",  date: "2026-10-24", trx: 9,  omzet: 2870000 },
  { kind: "sales", id: "s3",  date: "2026-10-23", trx: 14, omzet: 4120000 },
  { kind: "sales", id: "s4",  date: "2026-10-22", trx: 7,  omzet: 1980000 },
  { kind: "sales", id: "s5",  date: "2026-09-15", trx: 11, omzet: 3100000 },
  { kind: "sales", id: "s6",  date: "2026-09-10", trx: 8,  omzet: 2400000 },
  { kind: "sales", id: "s7",  date: "2026-08-20", trx: 6,  omzet: 1750000 },
];

const STOCKS: StockRow[] = PRODUCTS.map((p) => ({
  kind: "stock",
  id: "k" + p.id,
  name: p.name,
  stock: p.stock,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTanggal(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${NAMA_BULAN[month - 1]} ${year}`;
}

/** Jumlah hari dalam bulan (1-indexed month). */
function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** Hari pertama bulan (0 = Minggu). */
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

/** Set tanggal yang punya data penjualan di bulan/tahun tertentu. */
function salesDatesInMonth(year: number, month: number): Set<number> {
  const s = new Set<number>();
  SALES.forEach((row) => {
    const [y, m, d] = row.date.split("-").map(Number);
    if (y === year && m === month) s.add(d);
  });
  return s;
}

// ─── CalendarPicker ───────────────────────────────────────────────────────────

type CalendarPickerProps = {
  year: number;
  month: number;
  selectedDate: number | null;
  onChangeMonth: (year: number, month: number) => void;
  onSelectDate: (day: number) => void;
};

function CalendarPicker({
  year,
  month,
  selectedDate,
  onChangeMonth,
  onSelectDate,
}: CalendarPickerProps) {
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const hasSales = salesDatesInMonth(year, month);

  function prevMonth() {
    if (month === 1) onChangeMonth(year - 1, 12);
    else onChangeMonth(year, month - 1);
  }

  function nextMonth() {
    if (month === 12) onChangeMonth(year + 1, 1);
    else onChangeMonth(year, month + 1);
  }

  // Build grid: padding blanks + days
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={cal.wrapper}>
      {/* Month/Year navigation */}
      <View style={cal.nav}>
        <Pressable onPress={prevMonth} style={cal.navBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={GREEN} />
        </Pressable>

        <Text style={cal.navTitle}>
          {NAMA_BULAN[month - 1]} {year}
        </Text>

        <Pressable onPress={nextMonth} style={cal.navBtn} hitSlop={10}>
          <Ionicons name="chevron-forward" size={20} color={GREEN} />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View style={cal.row}>
        {NAMA_HARI_PENDEK.map((h) => (
          <View key={h} style={cal.cell}>
            <Text style={cal.dayHeader}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Date cells */}
      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={cal.row}>
          {cells.slice(week * 7, week * 7 + 7).map((day, idx) => {
            if (day === null) {
              return <View key={idx} style={cal.cell} />;
            }
            const isSelected = day === selectedDate;
            const hasData = hasSales.has(day);

            return (
              <Pressable
                key={day}
                style={[
                  cal.cell,
                  isSelected && cal.cellSelected,
                ]}
                onPress={() => onSelectDate(day)}
              >
                <Text
                  style={[
                    cal.dayText,
                    isSelected && cal.dayTextSelected,
                  ]}
                >
                  {day}
                </Text>
                {/* Dot indicator: ada data penjualan */}
                {hasData && !isSelected && (
                  <View style={cal.dot} />
                )}
                {hasData && isSelected && (
                  <View style={[cal.dot, cal.dotSelected]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const cal = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  cellSelected: {
    backgroundColor: GREEN,
  },
  dayHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  dayTextSelected: {
    color: colors.white,
    fontWeight: "900",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LaporanScreen() {
  const today = new Date();

  // Calendar navigation state (bulan yang sedang ditampilkan di kalender)
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);

  // Filter yang sedang dipilih
  const [filterMode, setFilterMode] = useState<FilterMode>("semua");
  const [pickedDate,  setPickedDate]  = useState<number>(today.getDate());
  const [pickedMonth, setPickedMonth] = useState<number>(today.getMonth() + 1);
  const [pickedYear,  setPickedYear]  = useState<number>(today.getFullYear());

  // Filter yang sudah diterapkan (setelah tekan "Tampilkan")
  const [activeMode,  setActiveMode]  = useState<FilterMode>("semua");
  const [activeDate,  setActiveDate]  = useState<number>(today.getDate());
  const [activeMonth, setActiveMonth] = useState<number>(today.getMonth() + 1);
  const [activeYear,  setActiveYear]  = useState<number>(today.getFullYear());

  // Apakah kalender terbuka
  const [calOpen, setCalOpen] = useState(false);

  // ── Filter logic ──────────────────────────────────────────────────────────

  const filteredSales = (() => {
    if (activeMode === "semua") return SALES;
    if (activeMode === "bulan") {
      return SALES.filter((r) => {
        const [y, m] = r.date.split("-").map(Number);
        return y === activeYear && m === activeMonth;
      });
    }
    // tanggal
    return SALES.filter((r) => {
      const [y, m, d] = r.date.split("-").map(Number);
      return y === activeYear && m === activeMonth && d === activeDate;
    });
  })();

  const totalOmzet = filteredSales.reduce((n, r) => n + r.omzet, 0);
  const totalTrx   = filteredSales.reduce((n, r) => n + r.trx, 0);

  const periodLabel = (() => {
    if (activeMode === "semua") return "Semua data";
    if (activeMode === "bulan") return `${NAMA_BULAN[activeMonth - 1]} ${activeYear}`;
    return `${activeDate} ${NAMA_BULAN[activeMonth - 1]} ${activeYear}`;
  })();

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleSelectDate(day: number) {
    setPickedDate(day);
    setPickedMonth(calMonth);
    setPickedYear(calYear);
    // Otomatis set mode ke "tanggal" saat user klik tanggal spesifik
    setFilterMode("tanggal");
  }

  function handleChangeMonth(y: number, m: number) {
    setCalYear(y);
    setCalMonth(m);
    // Saat navigasi bulan, set mode ke "bulan" secara otomatis
    setFilterMode("bulan");
    setPickedMonth(m);
    setPickedYear(y);
  }

  function applyFilter() {
    setActiveMode(filterMode);
    setActiveDate(pickedDate);
    setActiveMonth(pickedMonth);
    setActiveYear(pickedYear);
    setCalOpen(false);
  }

  function resetFilter() {
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();

    setCalYear(y);
    setCalMonth(m);
    setPickedDate(d);
    setPickedMonth(m);
    setPickedYear(y);
    setFilterMode("semua");
    setActiveMode("semua");
    setActiveDate(d);
    setActiveMonth(m);
    setActiveYear(y);
    setCalOpen(false);
  }

  // ── Section data ──────────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

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
            {/* ── FILTER CARD ─────────────────────────────── */}
            <View style={styles.filterCard}>
              {/* Title row */}
              <View style={styles.filterTitleRow}>
                <Ionicons name="calendar-outline" size={19} color={GREEN} />
                <Text style={styles.filterTitle}>Filter Laporan Penjualan</Text>
              </View>

              {/* Mode chips */}
              <View style={styles.modeRow}>
                {(["semua", "bulan", "tanggal"] as FilterMode[]).map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.modeChip, filterMode === m && styles.modeChipActive]}
                    onPress={() => {
                      setFilterMode(m);
                      if (m !== "semua") setCalOpen(true);
                      else setCalOpen(false);
                    }}
                  >
                    <Text style={[styles.modeChipText, filterMode === m && styles.modeChipTextActive]}>
                      {m === "semua" ? "Semua" : m === "bulan" ? "Per Bulan" : "Per Tanggal"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Calendar toggle button */}
              {filterMode !== "semua" && (
                <TouchableOpacity
                  style={styles.calToggleBtn}
                  onPress={() => setCalOpen((v) => !v)}
                >
                  <Ionicons
                    name={calOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={GREEN}
                  />
                  <Text style={styles.calToggleText}>
                    {filterMode === "bulan"
                      ? `${NAMA_BULAN[pickedMonth - 1]} ${pickedYear}`
                      : `${pickedDate} ${NAMA_BULAN[pickedMonth - 1]} ${pickedYear}`}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Inline calendar */}
              {calOpen && filterMode !== "semua" && (
                <CalendarPicker
                  year={calYear}
                  month={calMonth}
                  selectedDate={filterMode === "tanggal" ? pickedDate : null}
                  onChangeMonth={handleChangeMonth}
                  onSelectDate={handleSelectDate}
                />
              )}

              {/* Action buttons */}
              <View style={styles.filterButtons}>
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilter}>
                  <Ionicons name="refresh-outline" size={15} color={GREEN} />
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.filterBtn} onPress={applyFilter}>
                  <Ionicons name="filter-outline" size={15} color={colors.white} />
                  <Text style={styles.filterBtnText}>Tampilkan</Text>
                </TouchableOpacity>
              </View>

              {/* Active period info */}
              <View style={styles.filterInfo}>
                <Ionicons name="information-circle-outline" size={15} color={colors.muted} />
                <Text style={styles.filterInfoText}>Periode: {periodLabel}</Text>
              </View>
            </View>

            {/* ── RINGKASAN ───────────────────────────────── */}
            <View style={styles.summaryRow}>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Total Omzet</Text>
                <Text style={styles.summaryValue}>{formatRupiah(totalOmzet)}</Text>
              </View>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Transaksi</Text>
                <Text style={styles.summaryValue}>{totalTrx}</Text>
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
              <Text style={styles.emptyText}>Belum ada data penjualan pada periode ini.</Text>
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

  // Filter card
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: { fontSize: 14, fontWeight: "800", color: colors.ink },

  // Mode chips
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  modeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  modeChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  modeChipText: { fontSize: 11, fontWeight: "700", color: colors.muted },
  modeChipTextActive: { color: colors.white },

  // Calendar toggle
  calToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.bg,
    marginBottom: 12,
  },
  calToggleText: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.ink },

  // Buttons
  filterButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  resetText: { color: GREEN, fontSize: 12, fontWeight: "700" },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: radius.sm,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterBtnText: { color: colors.white, fontSize: 12, fontWeight: "700" },

  // Info
  filterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  filterInfoText: { fontSize: 11, color: colors.muted },

  // Summary
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  summary: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  summaryLabel: { fontSize: 12, color: colors.muted },
  summaryValue: { fontSize: 17, fontWeight: "900", color: GREEN },

  // Section list
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
  rowSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
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
