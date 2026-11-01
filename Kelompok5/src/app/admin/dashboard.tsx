
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { BrandLogo } from "@/components/brand-logo";
import { tabsForRole } from "@/constants/navigation";
import { colors, font, radius, spacing } from "@/constants/palette";

const GREEN = colors.primary;
const DARK = colors.ink;
const BG = colors.bg;

const namaBulan = [
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

// Data sementara dashboard
const statsData: Record<string, DashboardData> = {
  "2026-10": {
    saldoKas: 2200000,
    omzet: 59000000,
    lababruto: 8000000,
    biayaOperasional: 350000,
    volumeTerjual: 5000,
    piutang: 0,
    grafik: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 4800, 200, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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
      0, 0, 0, 0, 100, 0, 0, 0, 0, 0,
      0, 200, 0, 0, 0, 0, 0, 1200, 800, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
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
      {
        name: "Coil Replacement",
        volume: 800,
        omzet: 8000000,
        laba: 2000000,
      },
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

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function getPeriodKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getBulanLabel(period: string) {
  const [year, month] = period.split("-");
  return `${namaBulan[parseInt(month, 10) - 1]} ${year}`;
}

function getJumlahHari(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function BarChart({
  data,
  days,
}: {
  data: number[];
  days: number;
}) {
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
          .filter((day, index, arr) => arr.indexOf(day) === index)
          .map((day) => (
            <Text key={day} style={chart.axisLabel}>
              {day}
            </Text>
          ))}
      </View>

      <Text style={chart.axisTitle}>Tanggal</Text>
    </View>
  );
}

const chart = StyleSheet.create({
  wrap: {
    paddingTop: 8,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 88,
    gap: 1,
  },
  col: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 88,
  },
  bar: {
    width: "80%",
    borderRadius: 3,
  },
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 9,
    color: "#7A9E8A",
  },
  axisTitle: {
    textAlign: "center",
    fontSize: 10,
    color: "#7A9E8A",
    marginTop: 4,
  },
});

export default function AdminDashboard() {
  const router = useRouter();

  const today = new Date();

  // Periode yang dipilih pada Picker
  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth() + 1
  );

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
  );

  // Periode yang sedang ditampilkan
  const [activePeriod, setActivePeriod] = useState(
    getPeriodKey(today.getMonth() + 1, today.getFullYear())
  );

  // Mengambil data sesuai periode
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

  // Terapkan filter setelah tombol ditekan
  function applyFilter() {
    setActivePeriod(
      getPeriodKey(selectedMonth, selectedYear)
    );
  }

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

          <TouchableOpacity
            style={s.logoutBtn}
            onPress={() => router.replace("/admin/login")}
          >
            <Text style={s.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FILTER PERIODE */}
        <View style={s.filterCard}>
          <View style={s.filterTitleRow}>
            <Ionicons
              name="calendar-outline"
              size={19}
              color={GREEN}
            />
            <Text style={s.filterLabel}>
              Filter Periode Dashboard
            </Text>
          </View>

          <View style={s.filterRow}>
            {/* PILIH BULAN */}
            <View style={s.filterColumn}>
              <Text style={s.inputLabel}>Bulan</Text>

              <View style={s.selectWrapper}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(value) =>
                    setSelectedMonth(Number(value))
                  }
                  style={s.picker}
                  mode="dropdown"
                >
                  {namaBulan.map((bulan, index) => (
                    <Picker.Item
                      key={bulan}
                      label={bulan}
                      value={index + 1}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* PILIH TAHUN */}
            <View style={s.filterColumn}>
              <Text style={s.inputLabel}>Tahun</Text>

              <View style={s.selectWrapper}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={(value) =>
                    setSelectedYear(Number(value))
                  }
                  style={s.picker}
                  mode="dropdown"
                >
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <Picker.Item
                      key={year}
                      label={String(year)}
                      value={year}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={s.filterControls}>
            <TouchableOpacity
              style={s.filterBtn}
              onPress={applyFilter}
            >
              <Ionicons
                name="filter-outline"
                size={16}
                color={colors.white}
              />
              <Text style={s.filterBtnText}>Tampilkan</Text>
            </TouchableOpacity>
          </View>

          <View style={s.filterInfoRow}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={colors.muted}
            />
            <Text style={s.filterInfo}>
              Data periode{" "}
              <Text style={s.filterInfoBold}>
                {getBulanLabel(activePeriod)}
              </Text>
            </Text>
          </View>
        </View>

        {/* KARTU STATISTIK */}
        <View style={s.grid}>
          {statCards.map((c) => (
            <View
              key={c.label}
              style={[s.statCard, { backgroundColor: c.bg }]}
            >
              <View
                style={[
                  s.statIconBox,
                  { backgroundColor: c.iconBg },
                ]}
              >
                <Ionicons
                  name={c.icon}
                  size={22}
                  color={c.iconColor}
                />
              </View>

              <Text style={s.statValue}>{c.value}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* GRAFIK */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons
              name="bar-chart-outline"
              size={18}
              color={GREEN}
            />
            <Text style={s.sectionTitle}>
              Statistik Penjualan · {getBulanLabel(activePeriod)}
            </Text>
          </View>

          <View style={s.legendRow}>
            <View
              style={[s.legendDot, { backgroundColor: GREEN }]}
            />
            <Text style={s.legendText}>
              Volume Terjual (unit)
            </Text>
          </View>

          {hasData ? (
            <BarChart data={data.grafik} days={days} />
          ) : (
            <View style={s.emptyChart}>
              <Ionicons
                name="bar-chart-outline"
                size={30}
                color="#A8BDB0"
              />
              <Text style={s.emptyText}>
                Belum ada data penjualan pada periode ini.
              </Text>
            </View>
          )}
        </View>

        {/* TABEL RINGKASAN PRODUK */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons
              name="list-outline"
              size={18}
              color={GREEN}
            />
            <Text style={s.sectionTitle}>
              Ringkasan per Produk
            </Text>
          </View>

          {data.produk.length > 0 ? (
            <View style={s.table}>
              <View style={[s.tableRow, s.tableHead]}>
                <Text
                  style={[s.cell, s.cellWide, s.headText]}
                >
                  PRODUK
                </Text>
                <Text
                  style={[s.cell, s.cellNum, s.headText]}
                >
                  VOL
                </Text>
                <Text
                  style={[s.cell, s.cellNum, s.headText]}
                >
                  OMZET
                </Text>
                <Text
                  style={[s.cell, s.cellNum, s.headText]}
                >
                  LABA
                </Text>
              </View>

              {data.produk.map((p, i) => (
                <View
                  key={p.name}
                  style={[
                    s.tableRow,
                    i % 2 === 1 && s.tableAlt,
                  ]}
                >
                  <Text
                    style={[s.cell, s.cellWide]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>

                  <Text style={[s.cell, s.cellNum]}>
                    {p.volume.toLocaleString("id-ID")}
                  </Text>

                  <Text style={[s.cell, s.cellNum]}>
                    {rupiah(p.omzet)}
                  </Text>

                  <Text
                    style={[s.cell, s.cellNum, s.bold]}
                  >
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

      <BottomNav
        tabs={tabsForRole("owner")}
        active="dashboard"
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

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

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  avatarBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
  },

  logoutBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  logoutText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "700",
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },

  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  filterLabel: {
    fontSize: font.small,
    color: DARK,
    fontWeight: "800",
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
  },

  filterColumn: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: 6,
  },

  selectWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.bg,
  },

  picker: {
    width: "100%",
    height: 48,
    color: DARK,
  },

  filterControls: {
    marginTop: 12,
    alignItems: "flex-end",
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  filterBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  filterInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },

  filterInfo: {
    fontSize: 11,
    color: colors.muted,
  },

  filterInfoBold: {
    fontWeight: "800",
    color: DARK,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
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

  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },

  statLabel: {
    fontSize: 10,
    color: colors.muted,
    lineHeight: 14,
  },


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

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: DARK,
    flex: 1,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    fontSize: 11,
    color: colors.muted,
  },

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

  emptyText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },

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

  tableHead: {
    backgroundColor: colors.primarySoft,
  },

  tableAlt: {
    backgroundColor: colors.tint,
  },

  headText: {
    fontWeight: "800",
    color: GREEN,
    fontSize: 10,
  },

  cell: {
    fontSize: 11,
    color: DARK,
  },

  cellWide: {
    flex: 2,
  },

  cellNum: {
    flex: 1,
    textAlign: "right",
  },

  bold: {
    fontWeight: "800",
  },
});
