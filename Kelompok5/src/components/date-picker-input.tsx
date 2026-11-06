/**
 * DatePickerInput
 * Kotak input kecil dengan icon kalender di kanan.
 * Dipencet → dropdown kalender muncul tepat di bawah kotak.
 * Mirip seperti date-picker di website.
 */

import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type LayoutRectangle,
} from "react-native";

import { colors, radius } from "@/constants/palette";

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = colors.primary;

const NAMA_BULAN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const NAMA_HARI = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function firstDay(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** Label di atas kotak, e.g. "Dari" */
  label?: string;
  /** Placeholder di dalam kotak, e.g. "MM/DD/YYYY" */
  placeholder?: string;
  /** Tanggal terpilih format "YYYY-MM-DD", atau null */
  value: string | null;
  onChange: (v: string | null) => void;
  /** Set tanggal mana saja yang punya dot indikator */
  markedDates?: Set<number>; // tanggal (1-31) di bulan+tahun yang sedang ditampilkan
  onViewChange?: (year: number, month: number) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DatePickerInput({
  label,
  placeholder = "MM/DD/YYYY",
  value,
  onChange,
  markedDates,
  onViewChange,
}: Props) {
  const today    = new Date();
  const initYear  = value ? Number(value.split("-")[0]) : today.getFullYear();
  const initMonth = value ? Number(value.split("-")[1]) : today.getMonth() + 1;

  const [open,      setOpen]      = useState(false);
  const [viewYear,  setViewYear]  = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);
  const [anchor,    setAnchor]    = useState<LayoutRectangle | null>(null);
  const fieldRef = useRef<View>(null);

  // Tanggal terpilih di bulan yang sedang ditampilkan
  const selectedDay = value
    ? (() => {
        const [y, m, d] = value.split("-").map(Number);
        return y === viewYear && m === viewMonth ? d : null;
      })()
    : null;

  function handleOpen() {
    fieldRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, width: w, height: h });
      setOpen(true);
    });
  }

  function goMonth(dir: -1 | 1) {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 1)  { m = 12; y -= 1; }
    if (m > 12) { m = 1;  y += 1; }
    setViewMonth(m);
    setViewYear(y);
    onViewChange?.(y, m);
  }

  function pickDay(day: number) {
    const ds = `${viewYear}-${String(viewMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(value === ds ? null : ds); // tap lagi = reset
    setOpen(false);
  }

  // Build calendar grid
  const total    = daysInMonth(viewYear, viewMonth);
  const startCol = firstDay(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startCol).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Display value in the box
  const displayValue = value
    ? (() => {
        const [y, m, d] = value.split("-").map(Number);
        return `${String(m).padStart(2,"0")}/${String(d).padStart(2,"0")}/${y}`;
      })()
    : "";

  const isThisMonth = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;

  // Popover position — tepat di bawah field
  const popTop  = anchor ? anchor.y + anchor.height + 4 : 0;
  const popLeft = anchor ? anchor.x : 0;
  const popW    = Math.max(anchor?.width ?? 0, 240);

  return (
    <>
      {/* ── Kotak input ─────────────────────────────── */}
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View ref={fieldRef} collapsable={false}>
        <TouchableOpacity
          style={[s.box, open && s.boxFocused]}
          onPress={handleOpen}
          activeOpacity={0.85}
        >
          <Text style={[s.boxText, !value && s.placeholder]} numberOfLines={1}>
            {displayValue || placeholder}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              if (value) { e.stopPropagation(); onChange(null); }
              else handleOpen();
            }}
            hitSlop={10}
          >
            <Ionicons
              name="calendar-outline"
              size={17}
              color={open || value ? GREEN : colors.muted}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* ── Dropdown kalender ───────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        {/* Tap di luar = tutup */}
        <Pressable style={s.backdrop} onPress={() => setOpen(false)} />

        {/* Popover card */}
        <View style={[s.card, { top: popTop, left: popLeft, width: popW }]}>

          {/* Header: bulan navigasi */}
          <View style={s.navRow}>
            <TouchableOpacity style={s.navBtn} onPress={() => goMonth(-1)} hitSlop={10}>
              <Ionicons name="chevron-back" size={15} color={colors.ink} />
            </TouchableOpacity>
            <Text style={s.navTitle}>{NAMA_BULAN[viewMonth - 1]} {viewYear}</Text>
            <TouchableOpacity style={s.navBtn} onPress={() => goMonth(1)} hitSlop={10}>
              <Ionicons name="chevron-forward" size={15} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* Nama hari */}
          <View style={s.gridRow}>
            {NAMA_HARI.map((h) => (
              <View key={h} style={s.gridCell}>
                <Text style={s.dayLabel}>{h}</Text>
              </View>
            ))}
          </View>

          {/* Tanggal */}
          {Array.from({ length: cells.length / 7 }, (_, w) => (
            <View key={w} style={s.gridRow}>
              {cells.slice(w * 7, w * 7 + 7).map((day, i) => {
                if (!day) return <View key={`_${i}`} style={s.gridCell} />;
                const isSel   = day === selectedDay;
                const isToday = isThisMonth && day === today.getDate();
                const isDot   = markedDates?.has(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      s.gridCell,
                      isToday && !isSel && s.todayCell,
                      isSel && s.selCell,
                    ]}
                    onPress={() => pickDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      s.dayNum,
                      isToday && !isSel && s.todayNum,
                      isSel && s.selNum,
                    ]}>
                      {day}
                    </Text>
                    {isDot && <View style={[s.dot, isSel && s.dotSel]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 5,
  },

  // Kotak input
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: colors.surface,
    gap: 8,
  },
  boxFocused: {
    borderColor: GREEN,
    borderWidth: 1.5,
  },
  boxText: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    fontWeight: "500",
  },
  placeholder: {
    color: colors.placeholder,
  },

  // Backdrop
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },

  // Popover card — persis seperti di gambar
  card: {
    position: "absolute",
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D0D8D4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },

  // Nav row
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  navBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 0.1,
  },

  // Grid
  gridRow:  { flexDirection: "row" },
  gridCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    marginVertical: 1,
    borderRadius: 5,
  },
  dayLabel: { fontSize: 10, fontWeight: "600", color: colors.muted },
  dayNum:   { fontSize: 12, color: colors.ink },

  // Today
  todayCell: { borderWidth: 1.5, borderColor: GREEN },
  todayNum:  { color: GREEN, fontWeight: "800" },

  // Selected
  selCell: { backgroundColor: GREEN },
  selNum:  { color: colors.white, fontWeight: "800" },

  // Dot
  dot: {
    position: "absolute",
    bottom: 2,
    width: 3, height: 3,
    borderRadius: 2,
    backgroundColor: GREEN,
  },
  dotSel: { backgroundColor: colors.white },
});
