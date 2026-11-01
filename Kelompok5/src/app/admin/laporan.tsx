
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Modal,
  ScrollView,
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

type SalesRow = {
  kind: "sales";
  id: string;
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
type PickerType = "date" | "month" | "year" | null;

const GREEN = colors.primary;

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

// Data dummy laporan penjualan
const SALES: SalesRow[] = [
  {
    kind: "sales",
    id: "s1",
    date: "2026-10-25",
    trx: 12,
    omzet: 3450000,
  },
  {
    kind: "sales",
    id: "s2",
    date: "2026-10-24",
    trx: 9,
    omzet: 2870000,
  },
  {
    kind: "sales",
    id: "s3",
    date: "2026-10-23",
    trx: 14,
    omzet: 4120000,
  },
  {
    kind: "sales",
    id: "s4",
    date: "2026-10-22",
    trx: 7,
    omzet: 1980000,
  },
];

// Data dummy stok akhir
const STOCKS: StockRow[] = PRODUCTS.map((p) => ({
  kind: "stock",
  id: "k" + p.id,
  name: p.name,
  stock: p.stock,
}));

function formatTanggal(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return `${day} ${namaBulan[month - 1]} ${year}`;
}

function getJumlahHari(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export default function LaporanScreen() {
  const today = new Date();

  // Filter yang sedang dipilih
  const [selectedDate, setSelectedDate] = useState(
    today.getDate()
  );

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth() + 1
  );

  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
  );

  // Filter yang sudah diterapkan
  const [activeDate, setActiveDate] = useState(
    today.getDate()
  );

  const [activeMonth, setActiveMonth] = useState(
    today.getMonth() + 1
  );

  const [activeYear, setActiveYear] = useState(
    today.getFullYear()
  );

  const [openPicker, setOpenPicker] =
    useState<PickerType>(null);

  const [filterApplied, setFilterApplied] = useState(false);

  // Filter data penjualan
  const filteredSales = filterApplied
    ? SALES.filter((item) => {
        const [year, month, date] = item.date
          .split("-")
          .map(Number);

        return (
          year === activeYear &&
          month === activeMonth &&
          date === activeDate
        );
      })
    : SALES;

  // Perhitungan ringkasan
  const totalOmzet = filteredSales.reduce(
    (total, item) => total + item.omzet,
    0
  );

  const totalTrx = filteredSales.reduce(
    (total, item) => total + item.trx,
    0
  );

  const periodLabel = filterApplied
    ? `${activeDate} ${namaBulan[activeMonth - 1]} ${activeYear}`
    : "Semua data tersedia";

  // Data SectionList
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

  // Pilihan tanggal menyesuaikan bulan dan tahun
  const dateOptions = Array.from(
    {
      length: getJumlahHari(selectedMonth, selectedYear),
    },
    (_, index) => index + 1
  );

  const yearOptions = [2025, 2026, 2027, 2028];

  // Terapkan filter
  function applyFilter() {
    setActiveDate(selectedDate);
    setActiveMonth(selectedMonth);
    setActiveYear(selectedYear);
    setFilterApplied(true);
  }

  // Reset filter
  function resetFilter() {
    setFilterApplied(false);

    setSelectedDate(today.getDate());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  }

  // Judul modal
  function getPickerTitle() {
    if (openPicker === "date") return "Pilih Tanggal";
    if (openPicker === "month") return "Pilih Bulan";
    return "Pilih Tahun";
  }

  // Isi pilihan modal
  function getPickerOptions() {
    if (openPicker === "date") {
      return dateOptions.map((value) => ({
        label: String(value),
        value,
      }));
    }

    if (openPicker === "month") {
      return namaBulan.map((label, index) => ({
        label,
        value: index + 1,
      }));
    }

    return yearOptions.map((value) => ({
      label: String(value),
      value,
    }));
  }

  // Nilai pilihan aktif
  function getSelectedValue() {
    if (openPicker === "date") return selectedDate;
    if (openPicker === "month") return selectedMonth;
    return selectedYear;
  }

  // Pilih tanggal, bulan, atau tahun
  function chooseOption(value: number) {
    if (openPicker === "date") {
      setSelectedDate(value);
    } else if (openPicker === "month") {
      setSelectedMonth(value);

      const maxDate = getJumlahHari(value, selectedYear);

      setSelectedDate((current) =>
        Math.min(current, maxDate)
      );
    } else if (openPicker === "year") {
      setSelectedYear(value);

      const maxDate = getJumlahHari(selectedMonth, value);

      setSelectedDate((current) =>
        Math.min(current, maxDate)
      );
    }

    setOpenPicker(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <ScreenHeader
        title="Laporan"
        subtitle="Penjualan harian & stok akhir"
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* FILTER LAPORAN */}
            <View style={styles.filterCard}>
              <View style={styles.filterTitleRow}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={GREEN}
                />

                <Text style={styles.filterTitle}>
                  Filter Laporan Penjualan
                </Text>
              </View>

              <View style={styles.filterRow}>
                {/* TANGGAL */}
                <View style={styles.filterColumn}>
                  <Text style={styles.inputLabel}>
                    Tanggal
                  </Text>

                  <TouchableOpacity
                    style={styles.selectWrapper}
                    onPress={() => setOpenPicker("date")}
                  >
                    <Text style={styles.selectText}>
                      {selectedDate}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>

                {/* BULAN */}
                <View style={styles.filterColumn}>
                  <Text style={styles.inputLabel}>
                    Bulan
                  </Text>

                  <TouchableOpacity
                    style={styles.selectWrapper}
                    onPress={() => setOpenPicker("month")}
                  >
                    <Text
                      style={styles.selectText}
                      numberOfLines={1}
                    >
                      {namaBulan[selectedMonth - 1]}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>

                {/* TAHUN */}
                <View style={styles.filterColumn}>
                  <Text style={styles.inputLabel}>
                    Tahun
                  </Text>

                  <TouchableOpacity
                    style={styles.selectWrapper}
                    onPress={() => setOpenPicker("year")}
                  >
                    <Text style={styles.selectText}>
                      {selectedYear}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TOMBOL FILTER */}
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={resetFilter}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={15}
                    color={GREEN}
                  />

                  <Text style={styles.resetText}>
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filterBtn}
                  onPress={applyFilter}
                >
                  <Ionicons
                    name="filter-outline"
                    size={15}
                    color={colors.white}
                  />

                  <Text style={styles.filterBtnText}>
                    Tampilkan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* INFORMASI PERIODE */}
              <View style={styles.filterInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={colors.muted}
                />

                <Text style={styles.filterInfoText}>
                  Periode: {periodLabel}
                </Text>
              </View>
            </View>

            {/* RINGKASAN PENJUALAN */}
            <View style={styles.summaryRow}>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>
                  Total Omzet
                </Text>

                <Text style={styles.summaryValue}>
                  {formatRupiah(totalOmzet)}
                </Text>
              </View>

              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>
                  Transaksi
                </Text>

                <Text style={styles.summaryValue}>
                  {totalTrx}
                </Text>
              </View>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <Ionicons
              name={section.icon}
              size={18}
              color={GREEN}
            />

            <Text style={styles.sectionTitle}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) =>
          item.kind === "sales" ? (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>
                  {formatTanggal(item.date)}
                </Text>

                <Text style={styles.rowSub}>
                  {item.trx} transaksi
                </Text>
              </View>

              <Text style={styles.rowValue}>
                {formatRupiah(item.omzet)}
              </Text>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>
                  {item.name}
                </Text>
              </View>

              <Text
                style={[
                  styles.rowValue,
                  item.stock <= 0 && {
                    color: colors.danger,
                  },
                  item.stock > 0 &&
                    item.stock <= 5 && {
                      color: colors.warning,
                    },
                ]}
              >
                {item.stock <= 0
                  ? "Habis"
                  : `${item.stock} unit`}
              </Text>
            </View>
          )
        }
        renderSectionFooter={({ section }) =>
          section.title === "Penjualan Harian" &&
          filteredSales.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons
                name="document-text-outline"
                size={28}
                color="#A8BDB0"
              />

              <Text style={styles.emptyText}>
                Belum ada data penjualan pada tanggal ini.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<View style={{ height: 10 }} />}
      />

      {/* MODAL PILIHAN TANGGAL, BULAN, TAHUN */}
      <Modal
        visible={openPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenPicker(null)}
      >
        <View style={styles.modalOverlay}>
          {/* AREA LUAR MODAL UNTUK MENUTUP */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setOpenPicker(null)}
          />

          {/* ISI MODAL */}
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getPickerTitle()}
              </Text>

              <TouchableOpacity
                onPress={() => setOpenPicker(null)}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.ink}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
            >
              {getPickerOptions().map((option) => {
                const active =
                  option.value === getSelectedValue();

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      active && styles.modalOptionActive,
                    ]}
                    onPress={() =>
                      chooseOption(option.value)
                    }
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        active &&
                          styles.modalOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color={GREEN}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NAVIGASI BAWAH */}
      <BottomNav
        tabs={tabsForRole("owner")}
        active="laporan"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    padding: 14,
    paddingBottom: 24,
  },

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
    marginBottom: 14,
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
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
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },

  selectText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },

  filterButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },

  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  resetText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: radius.sm,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  filterBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  filterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },

  filterInfoText: {
    fontSize: 11,
    color: colors.muted,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },

  summary: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },

  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
  },

  summaryValue: {
    fontSize: 17,
    fontWeight: "900",
    color: GREEN,
  },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },

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

  rowMain: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },

  rowSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },

  rowValue: {
    fontSize: 13,
    fontWeight: "800",
    color: GREEN,
  },

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

  emptyText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  modalCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "75%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },

  modalList: {
    maxHeight: 350,
  },

  modalOption: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalOptionActive: {
    backgroundColor: colors.primarySoft,
  },

  modalOptionText: {
    fontSize: 13,
    color: colors.ink,
  },

  modalOptionTextActive: {
    color: GREEN,
    fontWeight: "800",
  },
});
