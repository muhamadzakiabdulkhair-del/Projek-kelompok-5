import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const GREEN = "#087F50";
const DARK = "#0F1F17";
const BG = "#F5F7F5";

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

const NAV_TABS = [
  { name: "Dashboard", icon: "📊" },
  { name: "Produk",    icon: "📦" },
  { name: "Laporan",   icon: "📈" },
  { name: "Profil",    icon: "👤" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const today = new Date();
  const def = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [period, setPeriod] = useState(def);
  const [activePeriod, setActivePeriod] = useState(def);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const data = statsData[activePeriod] ?? statsData["2026-10"];

  const statCards = [
    { label: "Saldo Kas Brangkas",      value: rupiah(data.saldoKas),          icon: "💰", bg: "#E8F5EE", iconBg: "#C2E8D2" },
    { label: "Omzet Penjualan Bulan Ini", value: rupiah(data.omzet),           icon: "💸", bg: "#EAF3FF", iconBg: "#BDD8FA" },
    { label: "Laba Bruto Bulan Ini",    value: rupiah(data.lababruto),          icon: "📈", bg: "#EEF9F2", iconBg: "#B8E8CA" },
    { label: "Biaya Operasional",       value: rupiah(data.biayaOperasional),   icon: "🧾", bg: "#FDFBEE", iconBg: "#F0E8A0" },
    { label: "Volume Terjual Bulan Ini",value: `${data.volumeTerjual.toLocaleString("id-ID")} unit`, icon: "📦", bg: "#F0EEF9", iconBg: "#D4C8F0" },
    { label: "Piutang Belum Lunas",     value: rupiah(data.piutang),            icon: "👥", bg: "#FFF0F0", iconBg: "#FAD0D0" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.brandRow}>
          <View style={s.logoBox}>
            <Text style={s.logoFire}>🔥</Text>
          </View>
          <View>
            <Text style={s.brandText}>Vape<Text style={s.brandGreen}>Store</Text></Text>
            <Text style={s.brandSub}>Owner Dashboard</Text>
          </View>
        </View>
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
                <Text style={s.statIcon}>{c.icon}</Text>
              </View>
              <Text style={s.statValue}>{c.value}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* QUICK NAV */}
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickBtn} onPress={() => router.push("/kelola-produk?role=owner")}>
            <Text style={s.quickIcon}>📦</Text>
            <Text style={s.quickText}>Kelola Produk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn} onPress={() => router.push("/dashboard")}>
            <Text style={s.quickIcon}>🛍</Text>
            <Text style={s.quickText}>Lihat Katalog</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickBtn}>
            <Text style={s.quickIcon}>📋</Text>
            <Text style={s.quickText}>Pesanan</Text>
          </TouchableOpacity>
        </View>

        {/* GRAFIK */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionIcon}>📊</Text>
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
            <Text style={s.sectionIcon}>📋</Text>
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

      {/* BOTTOM NAV */}
      <View style={s.bottomNav}>
        {NAV_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={s.navItem}
            onPress={() => {
              setActiveTab(tab.name);
              if (tab.name === "Produk") router.push("/kelola-produk?role=owner" as any);
              if (tab.name === "Laporan") router.push("/admin/laporan" as any);
            }}
          >
            <Text style={s.navIcon}>{tab.icon}</Text>
            <Text style={[s.navLabel, activeTab === tab.name && s.navLabelActive]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#E8EEE8",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#0F3D25", alignItems: "center", justifyContent: "center" },
  logoFire: { fontSize: 22 },
  brandText: { fontSize: 20, fontWeight: "900", color: DARK },
  brandGreen: { color: GREEN },
  brandSub: { fontSize: 10, color: "#7A9E8A", marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  logoutBtn: { backgroundColor: "#E8F5EE", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  logoutText: { color: GREEN, fontSize: 11, fontWeight: "700" },
  content: { padding: 14, paddingBottom: 20 },
  filterCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#E0EAE4" },
  filterLabel: { fontSize: 12, color: "#6A8A74", fontWeight: "700", marginBottom: 8 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  filterInput: {
    flex: 1, height: 42, borderWidth: 1, borderColor: "#DDE8E2",
    borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: DARK,
    backgroundColor: "#F8FBF9",
  },
  filterBtn: { backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  filterBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  filterInfo: { fontSize: 12, color: "#7A9E8A" },
  filterInfoBold: { fontWeight: "800", color: DARK },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard: { width: "48%" as any, flexGrow: 1, flexBasis: 140, borderRadius: 16, padding: 14, gap: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  statIconBox: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 16, fontWeight: "800", color: DARK },
  statLabel: { fontSize: 10, color: "#6A8A74", lineHeight: 14 },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  quickBtn: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#E0EAE4", gap: 6 },
  quickIcon: { fontSize: 24 },
  quickText: { fontSize: 11, fontWeight: "700", color: DARK },
  section: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#E0EAE4" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: DARK, flex: 1 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#7A9E8A" },
  table: { borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#E0EAE4" },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 10, alignItems: "center" },
  tableHead: { backgroundColor: "#E8F5EE" },
  tableAlt: { backgroundColor: "#F5FBF7" },
  headText: { fontWeight: "800", color: GREEN, fontSize: 10 },
  cell: { fontSize: 11, color: DARK },
  cellWide: { flex: 2 },
  cellNum: { flex: 1, textAlign: "right" },
  bold: { fontWeight: "800" },
  bottomNav: { flexDirection: "row", backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8EEE8", paddingVertical: 8, paddingHorizontal: 4 },
  navItem: { flex: 1, alignItems: "center", gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: "#9AAEA4", fontWeight: "600" },
  navLabelActive: { color: GREEN, fontWeight: "800" },
});
