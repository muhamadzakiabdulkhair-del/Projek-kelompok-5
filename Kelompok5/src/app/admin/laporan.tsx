import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutRectangle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { PRODUCTS, formatRupiah } from "@/data/products";

// ─── Types ────────────────────────────────────────────────────────────────────

type SalesRow = { kind: "sales"; id: string; date: string; trx: number; omzet: number };
type StockRow = { kind: "stock"; id: string; name: string; stock: number };
type ReportRow = SalesRow | StockRow;

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = colors.primary;

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const NAMA_BULAN_PENDEK = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
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
  kind: "stock", id: "k" + p.id, name: p.name, stock: p.stock,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}
function salesDatesSet(year: number, month: number): Set<number> {
  const s = new Set<number>();
  SALES.forEach((r) => {
    const [y, m, d] = r.date.split("-").map(Number);
    if (y === year && m === month) s.add(d);
  });
  return s;
}
function formatLabel(date: string | null): string {
  if (!date) return "Semua tanggal";
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${NAMA_BULAN_PENDEK[month - 1]} ${year}`;
}
function formatTanggal(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${NAMA_BULAN[month - 1]} ${year}`;
}

// ─── DatePickerField ──────────────────────────────────────────────────────────
// Input field + popover kalender kecil yang muncul tepat di bawahnya

type DatePickerFieldProps = {
  value: string | null;          // "YYYY-MM-DD" | null
  onChange: (v: string | null) => void;
};

function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const today     = new Date();
  const initYear  = value ? Number(value.split("-")[0]) : today.getFullYear();
  const initMonth = value ? Number(value.split("-")[1]) : today.getMonth() + 1;

  const [open,       setOpen]       = useState(false);
  const [viewYear,   setViewYear]   = useState(initYear);
  const [viewMonth,  setViewMonth]  = useState(initMonth);
  // anchor: posisi absolut dari field (untuk posisi popover)
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const fieldRef = useRef<View>(null);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay  = firstDayOfMonth(viewYear, viewMonth);
  const hasSales  = salesDatesSet(viewYear, viewMonth);

  const selectedDay = value
    ? (() => {
        const [y, m, d] = value.split("-").map(Number);
        return y === viewYear && m === viewMonth ? d : null;
      })()
    : null;

  function handleOpen() {
    fieldRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  }

  function handleDay(day: number) {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    if (value === dateStr) {
      onChange(null); // deselect = reset
    } else {
      onChange(dateStr);
    }
    setOpen(false);
  }

  // Build grid
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isThisMonth = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;

  // Popover top = anchor.y + anchor.height + 4 (tepat di bawah field)
  const popoverTop = anchor ? anchor.y + anchor.height + 4 : 0;
  const popoverLeft = anchor ? anchor.x : 0;
  const popoverWidth = anchor ? anchor.width : 280;

  return (
    <>
      {/* ── Input field ── */}
      <View ref={fieldRef} collapsable={false}>
        <TouchableOpacity
          style={[pf.field, open && pf.fieldOpen]}
          onPress={handleOpen}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={16} color={open ? GREEN : colors.muted} />
          <Text style={[pf.fieldText, !value && pf.fieldPlaceholder]}>
            {formatLabel(value)}
          </Text>
          {value
            ? <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); onChange(null); }}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={16} color={colors.muted} />
              </TouchableOpacity>
            : <Ionicons name="chevron-down" size={14} color={colors.muted} />
          }
        </TouchableOpacity>
      </View>

      {/* ── Popover kalender ── */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop tipis — tap di luar untuk tutup */}
        <Pressable style={pf.backdrop} onPress={() => setOpen(false)} />

        {/* Popover card, posisi tepat di bawah field */}
        <View style={[pf.popover, { top: popoverTop, left: popoverLeft, width: popoverWidth }]}>

          {/* Nav bulan */}
          <View style={pf.calNav}>
            <TouchableOpacity onPress={prevMonth} style={pf.navBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={16} color={GREEN} />
            </TouchableOpacity>
            <Text style={pf.calNavTitle}>
              {NAMA_BULAN[viewMonth - 1]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={pf.navBtn} hitSlop={8}>
              <Ionicons name="chevron-forward" size={16} color={GREEN} />
            </TouchableOpacity>
          </View>

          {/* Header hari */}
          <View style={pf.calRow}>
            {NAMA_HARI.map((h) => (
              <View key={h} style={pf.calCell}>
                <Text style={pf.calDayLabel}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Grid tanggal */}
          {Array.from({ length: cells.length / 7 }, (_, week) => (
            <View key={week} style={pf.calRow}>
              {cells.slice(week * 7, week * 7 + 7).map((day, idx) => {
                if (day === null) return <View key={`e-${idx}`} style={pf.calCell} />;
                const isSel   = day === selectedDay;
                const isToday = isThisMonth && day === today.getDate();
                const hasDot  = hasSales.has(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      pf.calCell,
                      isToday && !isSel && pf.todayCell,
                      isSel && pf.selectedCell,
                    ]}
                    onPress={() => handleDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[pf.calDayText, isToday && !isSel && pf.todayText, isSel && pf.selectedText]}>
                      {day}
                    </Text>
                    {hasDot && <View style={[pf.dot, isSel && pf.dotSel]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Footer hint */}
          <View style={pf.calFooter}>
            <View style={[pf.dot, { position: "relative", marginTop: 0 }]} />
            <Text style={pf.calFooterText}>Ada data · Tap tanggal yang sama untuk reset</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Styles untuk DatePickerField
const pf = StyleSheet.create({
  // Field
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  fieldOpen: {
    borderColor: GREEN,
    borderWidth: 1.5,
  },
  fieldText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink,
  },
  fieldPlaceholder: {
    color: colors.placeholder,
    fontWeight: "400",
  },

  // Backdrop
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },

  // Popover card
  popover: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // Shadow Android
    elevation: 8,
    zIndex: 999,
  },

  // Calendar nav
  calNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  calNavTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },

  // Grid
  calRow:     { flexDirection: "row" },
  calCell:    { flex: 1, alignItems: "center", paddingVertical: 5, borderRadius: 6, marginVertical: 1, marginHorizontal: 1 },
  calDayLabel:{ fontSize: 9,  fontWeight: "700", color: colors.muted },
  calDayText: { fontSize: 12, fontWeight: "500", color: colors.ink },
  todayCell:  { borderWidth: 1.5, borderColor: GREEN },
  todayText:  { color: GREEN, fontWeight: "800" },
  selectedCell: { backgroundColor: GREEN },
  selectedText: { color: colors.white, fontWeight: "900" },
  dot: {
    position: "absolute", bottom: 2,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: GREEN,
  },
  dotSel: { backgroundColor: colors.white },

  // Footer
  calFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calFooterText: { fontSize: 9, color: colors.muted },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LaporanScreen() {
  // selected = "YYYY-MM-DD" | null (semua data)
  const [selected, setSelected] = useState<string | null>(null);

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
            {/* ── FILTER ── */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Tanggal</Text>
              <DatePickerField value={selected} onChange={setSelected} />
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

  filterRow: {
    marginBottom: 12,
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
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
