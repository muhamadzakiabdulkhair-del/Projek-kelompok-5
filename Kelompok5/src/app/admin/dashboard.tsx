import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "@/components/bottom-nav";
import { BrandLogo } from "@/components/brand-logo";
import { tabsForRole } from "@/constants/navigation";
import { colors, font, radius, spacing } from "@/constants/palette";

const GREEN = colors.primary;
const DARK = colors.ink;
const BG = colors.bg;

const statsData: Record<string, {
  saldoKas: number; omzet: number; lababruto: number;
  biayaOperasional: number; volumeTerjual: number; piutang: number;
  grafik: number[];
  produk: { name: string; volume: number; omzet: number; laba: number }[];
}> = {
  "2026-10": {
    saldoKas: 2200000, omzet: 59000000, lababruto: 8000000,
    biayaOperasional: 350000, volumeTerjual: 5000, piutang: 0,
    grafik: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4800,200,0,0,0,0,0,0,0,0,0,0,0,0],
    produk: [
      { name: "Uwell Caliburn G2",  volume: 2000, omzet: 25000000, laba: 2000000 },
      { name: "Vaporesso XROS 3",   volume: 2000, omzet: 24000000, laba: 4000000 },
      { name: "Liquid Strawberry",  volume: 1000, omzet: 10000000, laba: 2000000 },
    ],
  },
  "2026-09": {
    saldoKas: 1800000, omzet: 42000000, lababruto: 6500000,
    biayaOperasional: 300000, volumeTerjual: 3800, piutang: 500000,
    grafik: [0,0,0,0,100,0,0,0,0,0,0,200,0,0,0,0,0,1200,800,0,0,0,0,0,0,0,0,0,0,0,0],
    produk: [
      { name: "Uwell Caliburn G2", volume: 1500, omzet: 18000000, laba: 1500000 },
      { name: "Vaporesso XROS 3",  volume: 1500, omzet: 16000000, laba: 3000000 },
      { name: "Coil Replacement",  volume: 800,  omzet: 8000000,  laba: 2000000 },
    ],
  },
};

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function getBulanLabel(period: string) {
  const [year, month] = period.split("-");
  const bulan = ["","Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"];
  return `${bulan[parseInt(month)]} ${year}`;
}

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={chart.wrap}>
      <View style={chart.bars}>
        {data.map((v, i) => (
          <View key={i} style={chart.col}>
            <View style={[chart.bar, { height: Math.max(2, (v / max) * 80), backgroundColor: v > 0 ? GREEN : "#D8E8DE" }]} />
          </View>
        ))}
      </View>
      <View style={chart.axis}>
        {[1,5,10,15,20,25,31].map((d) => (
          <Text key={d} style={chart.axisLabel}>{d}</Text>
        ))}
      </View>
      <Text style={chart.axisTitle}>Tanggal</Text>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: { paddingTop: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 88, gap: 1 },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: 88 },
  bar: { width: "80%", borderRadius: 3 },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  axisLabel: { fontSize: 9, color: "#7A9E8A" },
  axisTitle: { textAlign: "center", fontSize: 10, color: "#7A9E8A", marginTop: 4 },
});

export default function AdminDashboard() {
  const router = useRouter();
  const today = new Date();
  const def = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [period, setPeriod] = useState(def);
  const [activePeriod, setActivePeriod] = useState(def);

  const data = statsData[activePeriod] ?? statsData["2026-10"];

    type StatCard = {
    label: string; value: string;
    icon: keyof typeof Ionicons.glyphMap;
    bg: string; iconBg: string; iconColor: string;
  };
  const statCards: StatCard[] = [
    { label: "Saldo Kas Brangkas",        value: rupiah(data.saldoKas),       icon: "wallet-outline",        bg: "#E8F5EE", iconBg: "#C2E8D2", iconColor: GREEN },
    { label: "Omzet Penjualan Bulan Ini", value: rupiah(data.omzet),          icon: "trending-up-outline",   bg: "#EAF3FF", iconBg: "#BDD8FA", iconColor: "#1D5FB8" },
    { label: "Laba Bruto Bulan Ini",      value: rupiah(data.lababruto),      icon: "bar-chart-outline",     bg: "#EEF9F2", iconBg: "#B8E8CA", iconColor: GREEN },
    { label: "Biaya Operasional",         value: rupiah(data.biayaOperasional), icon: "receipt-outline",     bg: "#FDFBEE", iconBg: "#F0E8A0", iconColor: colors.warning },
    { label: "Volume Terjual Bulan Ini",  value: `${data.volumeTerjual.toLocaleString("id-ID")} unit`, icon: "cube-outline", bg: "#F0EEF9", iconBg: "#D4C8F0", iconColor: "#7B5EA7" },
    { label: "Piutang Belum Lunas",       value: rupiah(data.piutang),        icon: "people-outline",        bg: "#FFF0F0", iconBg: "#FAD0D0", iconColor: colors.danger },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={s.header}>
        <BrandLogo />
        <View style={s.headerRight}>
          <View style={s.avatarBox}>
            <Text style={s.avatarText}>A</Text>
          </View>
          <TouchableOpacity style={s.logoutBtn} onPress={() => router.replace("/admin/login")}>
            <Text style={s.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* FILTER PERIODE */}
        <View style={s.filterCard}>
          <Text style={s.filterLabel}>Periode</Text>
          <View style={s.filterRow}>
            <TextInput
              style={s.filterInput}
              value={period}
              onChangeText={setPeriod}
              placeholder="YYYY-MM"
              placeholderTextColor="#9AAEA4"
            />
            <TouchableOpacity style={s.filterBtn} onPress={() => setActivePeriod(period)}>
              <Text style={s.filterBtnText}>▼ Tampilkan</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.filterInfo}>
            Data bulan <Text style={s.filterInfoBold}>{getBulanLabel(activePeriod)}</Text>
          </Text>
        </View>

        {/* KARTU STATISTIK */}
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

        {/* QUICK NAV */}
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickBtn} onPress={() => router.push("/kelola-produk?role=owner")}>
            <Ionicons name="cube-outline" size={24} color={GREEN} />
            <Text style={s.quickText}>Kelola Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => router.push("/dashboard")}>
            <Ionicons name="storefront-outline" size={24} color={GREEN} />
            <Text style={s.quickText}>Lihat Katalog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => router.push("/pesanan?role=owner" as any)}>
            <Ionicons name="receipt-outline" size={24} color={GREEN} />
            <Text style={s.quickText}>Pesanan</Text>
          </TouchableOpacity>
        </View>

        {/* GRAFIK */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={18} color={GREEN} />
            <Text style={s.sectionTitle}>Statistik Penjualan · {getBulanLabel(activePeriod)}</Text>
          </View>
          <View style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: GREEN }]} />
            <Text style={s.legendText}>Volume Terjual (unit)</Text>
          </View>
          <BarChart data={data.grafik} />
        </View>

        {/* TABEL */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="list-outline" size={18} color={GREEN} />
            <Text style={s.sectionTitle}>Ringkasan per Produk</Text>
          </View>
          <View style={s.table}>
            <View style={[s.tableRow, s.tableHead]}>
              <Text style={[s.cell, s.cellWide, s.headText]}>PRODUK</Text>
              <Text style={[s.cell, s.cellNum, s.headText]}>VOL</Text>
              <Text style={[s.cell, s.cellNum, s.headText]}>OMZET</Text>
              <Text style={[s.cell, s.cellNum, s.headText]}>LABA</Text>
            </View>
            {data.produk.map((p, i) => (
              <View key={p.name} style={[s.tableRow, i % 2 === 1 && s.tableAlt]}>
                <Text style={[s.cell, s.cellWide]} numberOfLines={1}>{p.name}</Text>
                <Text style={[s.cell, s.cellNum]}>{p.volume.toLocaleString("id-ID")}</Text>
                <Text style={[s.cell, s.cellNum]}>{rupiah(p.omzet)}</Text>
                <Text style={[s.cell, s.cellNum, s.bold]}>{rupiah(p.laba)}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      <BottomNav tabs={tabsForRole("owner")} active="dashboard" />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  logoutBtn: { backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  logoutText: { color: GREEN, fontSize: 11, fontWeight: "700" },
  content: { padding: spacing.lg, paddingBottom: spacing.md },
  filterCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  filterLabel: { fontSize: font.small, color: colors.muted, fontWeight: "700", marginBottom: 8 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  filterInput: {
    flex: 1, height: 42, borderWidth: 1, borderColor: colors.borderInput,
    borderRadius: radius.sm, paddingHorizontal: 12, fontSize: 13, color: DARK,
    backgroundColor: colors.bg,
  },
  filterBtn: { backgroundColor: GREEN, borderRadius: radius.sm, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  filterBtnText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  filterInfo: { fontSize: 12, color: colors.muted },
  filterInfoBold: { fontWeight: "800", color: DARK },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard: { width: "48%" as any, flexGrow: 1, flexBasis: 140, borderRadius: radius.lg, padding: 14, gap: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  statIconBox: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: DARK },
  statLabel: { fontSize: 10, color: colors.muted, lineHeight: 14 },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  quickBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border, gap: 6 },
  quickText: { fontSize: 11, fontWeight: "700", color: DARK },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: DARK, flex: 1 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: colors.muted },
  table: { borderRadius: radius.sm, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 10, alignItems: "center" },
  tableHead: { backgroundColor: colors.primarySoft },
  tableAlt: { backgroundColor: colors.tint },
  headText: { fontWeight: "800", color: GREEN, fontSize: 10 },
  cell: { fontSize: 11, color: DARK },
  cellWide: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right" },
  bold: { fontWeight: "800" },
});
