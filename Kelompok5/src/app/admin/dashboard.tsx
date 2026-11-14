import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { BrandLogo } from "@/components/brand-logo";
import { DatePickerInput } from "@/components/date-picker-input";
import { tabsForRole } from "@/constants/navigation";
import { colors, font, radius, spacing } from "@/constants/palette";
import { type Product } from "@/data/products";
import { fetchProducts } from "@/services/productService";
import { useAuth } from "@/context/auth";

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = colors.primary;
const DARK = colors.ink;
const BG = colors.bg;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Tahun tersedia: 2020 s/d tahun sekarang + 1 */
const YEAR_OPTIONS: number[] = (() => {
  const current = new Date().getFullYear();
  const arr: number[] = [];
  for (let y = 2020; y <= current + 1; y++) arr.push(y);
  return arr;
})();

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductSummary = {
  name: string;
  volume: number;
  omzet: number;
  laba: number;
};

type DashboardData = {
  saldoKas: number;
  omzet: number;
  lababruto: number;
  biayaOperasional: number;
  volumeTerjual: number;
  piutang: number;
  grafik: number[];
  produk: ProductSummary[];
};

// ─── Dummy data ───────────────────────────────────────────────────────────────

const statsData: Record<string, DashboardData> = {
  "2026-10": {
    saldoKas: 2200000,
    omzet: 59000000,
    lababruto: 8000000,
    biayaOperasional: 350000,
    volumeTerjual: 5000,
    piutang: 0,
    grafik: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4800, 200, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
    ],
    produk: [
      {
        name: "Uwell Caliburn G2",
        volume: 2000,
        omzet: 25000000,
        laba: 2000000,
      },
      {
        name: "Vaporesso XROS 3",
        volume: 2000,
        omzet: 24000000,
        laba: 4000000,
      },
      {
        name: "Liquid Strawberry",
        volume: 1000,
        omzet: 10000000,
        laba: 2000000,
      },
    ],
  },
  "2026-09": {
    saldoKas: 1800000,
    omzet: 42000000,
    lababruto: 6500000,
    biayaOperasional: 300000,
    volumeTerjual: 3800,
    piutang: 500000,
    grafik: [
      0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 200, 0, 0, 0, 0, 0, 1200, 800, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    produk: [
      {
        name: "Uwell Caliburn G2",
        volume: 1500,
        omzet: 18000000,
        laba: 1500000,
      },
      {
        name: "Vaporesso XROS 3",
        volume: 1500,
        omzet: 16000000,
        laba: 3000000,
      },
      { name: "Coil Replacement", volume: 800, omzet: 8000000, laba: 2000000 },
    ],
  },
};

const emptyData: DashboardData = {
  saldoKas: 0,
  omzet: 0,
  lababruto: 0,
  biayaOperasional: 0,
  volumeTerjual: 0,
  piutang: 0,
  grafik: [],
  produk: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function getPeriodKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getBulanLabel(period: string) {
  const [year, month] = period.split("-");
  return `${NAMA_BULAN[parseInt(month, 10) - 1]} ${year}`;
}

function getJumlahHari(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
// Komponen dropdown sederhana — tampil sebagai modal list di tengah layar

type DropdownProps = {
  label: string;
  value: string;
  options: { label: string; value: number }[];
  onSelect: (v: number) => void;
};

function Dropdown({ label, value, options, onSelect }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <View style={dd.wrap}>
        <Text style={dd.label}>{label}</Text>
        <TouchableOpacity
          style={dd.btn}
          onPress={() => setOpen(true)}
          activeOpacity={0.75}
        >
          <Text style={dd.btnText} numberOfLines={1}>
            {value}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={dd.overlay} onPress={() => setOpen(false)}>
          <View style={dd.sheet}>
            <Text style={dd.sheetTitle}>{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const active = opt.label === value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[dd.option, active && dd.optionActive]}
                    onPress={() => {
                      onSelect(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[dd.optionText, active && dd.optionTextActive]}
                    >
                      {opt.label}
                    </Text>
                    {active && (
                      <Ionicons name="checkmark" size={16} color={GREEN} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const dd = StyleSheet.create({
  wrap: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 5,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: BG,
    gap: 6,
  },
  btnText: { flex: 1, fontSize: 13, fontWeight: "700", color: DARK },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sheet: {
    width: "100%",
    maxHeight: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: DARK,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionActive: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
  },
  optionText: { fontSize: 13, color: DARK },
  optionTextActive: { fontWeight: "800", color: GREEN },
});

// ─── BarChart ─────────────────────────────────────────────────────────────────

function BarChart({ data, days }: { data: number[]; days: number }) {
  const max = Math.max(...data, 1);
  return (
    <View style={chart.wrap}>
      <View style={chart.bars}>
        {Array.from({ length: days }, (_, i) => {
          const value = data[i] ?? 0;
          return (
            <View key={i} style={chart.col}>
              <View
                style={[
                  chart.bar,
                  {
                    height: Math.max(2, (value / max) * 80),
                    backgroundColor: value > 0 ? GREEN : "#D8E8DE",
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={chart.axis}>
        {[1, 5, 10, 15, 20, 25, days]
          .filter((d, i, arr) => arr.indexOf(d) === i)
          .map((d) => (
            <Text key={d} style={chart.axisLabel}>
              {d}
            </Text>
          ))}
      </View>
      <Text style={chart.axisTitle}>Tanggal</Text>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: { paddingTop: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 88, gap: 1 },
  col: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 88,
  },
  bar: { width: "80%", borderRadius: 3 },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  axisLabel: { fontSize: 9, color: "#7A9E8A" },
  axisTitle: {
    textAlign: "center",
    fontSize: 10,
    color: "#7A9E8A",
    marginTop: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const { keluar } = useAuth();
  const today = new Date();

  // ── Data stok realtime dari Supabase ──────────────────────────────────────
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setDbProducts)
      .catch(() => setDbProducts([]))
      .finally(() => setLoadingDb(false));
  }, []);

  // Statistik stok dihitung dari Supabase
  const aktif = dbProducts.filter((p) => p.isActive !== false);
  const stokHabis = aktif.filter((p) => p.stock <= 0).length;
  const stokMenipis = aktif.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const stokAman = aktif.filter((p) => p.stock > 5).length;
  const nilaiStok = aktif.reduce((s, p) => s + p.price * p.stock, 0);
  const modalStok = aktif.reduce((s, p) => s + p.purchasePrice * p.stock, 0);
  const potensiLaba = nilaiStok - modalStok;

  // Periode aktif: "YYYY-MM-DD" format tapi kita cuma pakai year+month
  // Simpan sebagai "YYYY-MM-01" supaya bisa pakai DatePickerInput
  const initDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const [pickedDate, setPickedDate] = useState<string | null>(initDate);

  // Derive period key dari pickedDate
  const activePeriod = pickedDate
    ? getPeriodKey(
        Number(pickedDate.split("-")[1]),
        Number(pickedDate.split("-")[0]),
      )
    : getPeriodKey(today.getMonth() + 1, today.getFullYear());

  const data = statsData[activePeriod] ?? emptyData;
  const hasData = Boolean(statsData[activePeriod]);
  const days = getJumlahHari(activePeriod);

  type StatCard = {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    bg: string;
    iconBg: string;
    iconColor: string;
  };

  const statCards: StatCard[] = [
    {
      label: "Saldo Kas Brangkas",
      value: rupiah(data.saldoKas),
      icon: "wallet-outline",
      bg: "#E8F5EE",
      iconBg: "#C2E8D2",
      iconColor: GREEN,
    },
    {
      label: "Omzet Penjualan Bulan Ini",
      value: rupiah(data.omzet),
      icon: "trending-up-outline",
      bg: "#EAF3FF",
      iconBg: "#BDD8FA",
      iconColor: "#1D5FB8",
    },
    {
      label: "Laba Bruto Bulan Ini",
      value: rupiah(data.lababruto),
      icon: "bar-chart-outline",
      bg: "#EEF9F2",
      iconBg: "#B8E8CA",
      iconColor: GREEN,
    },
    {
      label: "Biaya Operasional",
      value: rupiah(data.biayaOperasional),
      icon: "receipt-outline",
      bg: "#FDFBEE",
      iconBg: "#F0E8A0",
      iconColor: colors.warning,
    },
    {
      label: "Volume Terjual Bulan Ini",
      value: `${data.volumeTerjual.toLocaleString("id-ID")} unit`,
      icon: "cube-outline",
      bg: "#F0EEF9",
      iconBg: "#D4C8F0",
      iconColor: "#7B5EA7",
    },
    {
      label: "Piutang Belum Lunas",
      value: rupiah(data.piutang),
      icon: "people-outline",
      bg: "#FFF0F0",
      iconBg: "#FAD0D0",
      iconColor: colors.danger,
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <BrandLogo />
        <View style={s.headerRight}>
          <View style={s.avatarBox}>
            <Text style={s.avatarText}>A</Text>
          </View>
          <TouchableOpacity
            style={s.logoutBtn}
            onPress={async () => {
              await keluar();
              router.replace("/login");
            }}
          >
            <Text style={s.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── FILTER PERIODE ── */}
        <View style={s.filterBar}>
          <View style={{ flex: 1 }}>
            <DatePickerInput
              label="Periode"
              placeholder="Pilih bulan"
              value={pickedDate}
              onChange={(v) => setPickedDate(v ?? initDate)}
            />
          </View>
        </View>

        {/* Badge periode aktif */}
        <View style={s.periodBadge}>
          <Text style={s.periodBadgeText}>
            {hasData
              ? `📊 ${getBulanLabel(activePeriod)}`
              : `Tidak ada data · ${getBulanLabel(activePeriod)}`}
          </Text>
        </View>

        {/* ── KARTU STOK REALTIME (Supabase) ── */}
        <View style={s.stokSectionHeader}>
          <Ionicons name="cube-outline" size={16} color={GREEN} />
          <Text style={s.sectionTitle}>Statistik Stok Saat Ini</Text>
          {loadingDb && (
            <ActivityIndicator
              size="small"
              color={GREEN}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>

        {/* 3 kartu status stok */}
        <View style={s.stokRow}>
          <View style={[s.stokCard, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={20} color={GREEN} />
            <Text style={[s.stokNum, { color: GREEN }]}>{stokAman}</Text>
            <Text style={s.stokLabel}>Stok Aman</Text>
          </View>
          <View style={[s.stokCard, { backgroundColor: colors.warningSoft }]}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={[s.stokNum, { color: colors.warning }]}>
              {stokMenipis}
            </Text>
            <Text style={s.stokLabel}>Menipis</Text>
          </View>
          <View style={[s.stokCard, { backgroundColor: colors.dangerSoft }]}>
            <Ionicons name="close-circle" size={20} color={colors.danger} />
            <Text style={[s.stokNum, { color: colors.danger }]}>
              {stokHabis}
            </Text>
            <Text style={s.stokLabel}>Habis</Text>
          </View>
        </View>

        {/* 3 kartu finansial stok */}
        <View style={s.stokRow}>
          <View style={[s.stokFinCard, { backgroundColor: "#EAF3FF" }]}>
            <Text style={s.stokFinLabel}>Nilai Stok</Text>
            <Text style={[s.stokFinValue, { color: "#1D5FB8" }]}>
              {rupiah(nilaiStok)}
            </Text>
          </View>
          <View style={[s.stokFinCard, { backgroundColor: "#FFF0F0" }]}>
            <Text style={s.stokFinLabel}>Modal Stok</Text>
            <Text style={[s.stokFinValue, { color: colors.danger }]}>
              {rupiah(modalStok)}
            </Text>
          </View>
          <View style={[s.stokFinCard, { backgroundColor: "#EEF9F2" }]}>
            <Text style={s.stokFinLabel}>Potensi Laba</Text>
            <Text style={[s.stokFinValue, { color: GREEN }]}>
              {rupiah(potensiLaba)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* ── KARTU STATISTIK PENJUALAN (dummy) ── */}
        <View style={[s.stokSectionHeader, { marginBottom: 10 }]}>
          <Ionicons name="trending-up-outline" size={16} color={GREEN} />
          <Text style={s.sectionTitle}>
            Statistik Penjualan · {getBulanLabel(activePeriod)}
          </Text>
        </View>
        <View style={s.grid}>
          {statCards.map((c) => (
            <View key={c.label} style={[s.statCard, { backgroundColor: c.bg }]}>
              <View style={[s.statIconBox, { backgroundColor: c.iconBg }]}>
                <Ionicons name={c.icon} size={22} color={c.iconColor} />
              </View>
              <Text style={s.statValue}>{c.value}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* ── GRAFIK ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={GREEN} />
            <Text style={s.sectionTitle}>
              Statistik Penjualan · {getBulanLabel(activePeriod)}
            </Text>
          </View>
          <View style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: GREEN }]} />
            <Text style={s.legendText}>Volume Terjual (unit)</Text>
          </View>
          {hasData ? (
            <BarChart data={data.grafik} days={days} />
          ) : (
            <View style={s.emptyChart}>
              <Ionicons name="bar-chart-outline" size={30} color="#A8BDB0" />
              <Text style={s.emptyText}>
                Belum ada data penjualan pada periode ini.
              </Text>
            </View>
          )}
        </View>

        {/* ── TABEL RINGKASAN PRODUK ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="list-outline" size={18} color={GREEN} />
            <Text style={s.sectionTitle}>Ringkasan per Produk</Text>
          </View>
          {data.produk.length > 0 ? (
            <View style={s.table}>
              <View style={[s.tableRow, s.tableHead]}>
                <Text style={[s.cell, s.cellWide, s.headText]}>PRODUK</Text>
                <Text style={[s.cell, s.cellNum, s.headText]}>VOL</Text>
                <Text style={[s.cell, s.cellNum, s.headText]}>OMZET</Text>
                <Text style={[s.cell, s.cellNum, s.headText]}>LABA</Text>
              </View>
              {data.produk.map((p, i) => (
                <View
                  key={p.name}
                  style={[s.tableRow, i % 2 === 1 && s.tableAlt]}
                >
                  <Text style={[s.cell, s.cellWide]} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={[s.cell, s.cellNum]}>
                    {p.volume.toLocaleString("id-ID")}
                  </Text>
                  <Text style={[s.cell, s.cellNum]}>{rupiah(p.omzet)}</Text>
                  <Text style={[s.cell, s.cellNum, s.bold]}>
                    {rupiah(p.laba)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.emptyTable}>
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#A8BDB0"
              />
              <Text style={s.emptyText}>
                Belum ada ringkasan produk untuk periode ini.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav tabs={tabsForRole("owner")} active="dashboard" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  logoutBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoutText: { color: GREEN, fontSize: 11, fontWeight: "700" },

  content: { padding: spacing.lg, paddingBottom: spacing.md },

  // ── Filter bar ──
  filterBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  applyBtn: {
    backgroundColor: GREEN,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 0,
    alignSelf: "flex-end",
  },
  applyBtnText: { color: colors.white, fontSize: 12, fontWeight: "800" },

  periodBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  periodBadgeText: { fontSize: 11, fontWeight: "700", color: GREEN },

  // ── Stat grid ──
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  // ── Stok realtime ──
  stokSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  stokRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  stokCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stokNum: { fontSize: 22, fontWeight: "900" },
  stokLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: "600",
    textAlign: "center",
  },
  stokFinCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stokFinLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },
  stokFinValue: { fontSize: 13, fontWeight: "900", marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  statCard: {
    width: "48%" as any,
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  statIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 16, fontWeight: "800", color: DARK },
  statLabel: { fontSize: 10, color: colors.muted, lineHeight: 14 },

  // ── Sections ──
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: DARK, flex: 1 },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.muted },
  emptyChart: {
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTable: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: { fontSize: 11, color: colors.muted, textAlign: "center" },

  // ── Table ──
  table: {
    borderRadius: radius.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  tableHead: { backgroundColor: colors.primarySoft },
  tableAlt: { backgroundColor: colors.tint },
  headText: { fontWeight: "800", color: GREEN, fontSize: 10 },
  cell: { fontSize: 11, color: DARK },
  cellWide: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right" },
  bold: { fontWeight: "800" },
});
