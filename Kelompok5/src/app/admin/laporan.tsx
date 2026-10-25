import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SectionList, StyleSheet, Text, View } from "react-native";
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
type StockRow = { kind: "stock"; id: string; name: string; stock: number };

// Data dummy laporan harian & stok akhir (sesuai kebutuhan owner dari hasil wawancara).
const SALES: SalesRow[] = [
  { kind: "sales", id: "s1", date: "25 Okt 2026", trx: 12, omzet: 3450000 },
  { kind: "sales", id: "s2", date: "24 Okt 2026", trx: 9, omzet: 2870000 },
  { kind: "sales", id: "s3", date: "23 Okt 2026", trx: 14, omzet: 4120000 },
  { kind: "sales", id: "s4", date: "22 Okt 2026", trx: 7, omzet: 1980000 },
];

const STOCKS: StockRow[] = PRODUCTS.map((p) => ({
  kind: "stock",
  id: "k" + p.id,
  name: p.name,
  stock: p.stock,
}));

const SECTIONS = [
  {
    title: "Penjualan Harian",
    icon: "calendar-outline" as const,
    data: SALES as (SalesRow | StockRow)[],
  },
  {
    title: "Stok Akhir",
    icon: "cube-outline" as const,
    data: STOCKS as (SalesRow | StockRow)[],
  },
];

const totalOmzet = SALES.reduce((n, r) => n + r.omzet, 0);
const totalTrx = SALES.reduce((n, r) => n + r.trx, 0);

export default function LaporanScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Laporan" subtitle="Penjualan harian & stok akhir" />

      <SectionList
        sections={SECTIONS}
        keyExtractor={(r) => r.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.summaryRow}>
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Omzet 4 hari</Text>
              <Text style={styles.summaryValue}>
                {formatRupiah(totalOmzet)}
              </Text>
            </View>
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>Transaksi</Text>
              <Text style={styles.summaryValue}>{totalTrx}</Text>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <Ionicons name={section.icon} size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) =>
          item.kind === "sales" ? (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{item.date}</Text>
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
                  item.stock > 0 &&
                    item.stock <= 5 && { color: colors.warning },
                ]}
              >
                {item.stock <= 0 ? "Habis" : `${item.stock} unit`}
              </Text>
            </View>
          )
        }
      />

      <BottomNav tabs={tabsForRole("owner")} active="laporan" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  summary: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  summaryLabel: { fontSize: 12, color: colors.muted },
  summaryValue: { fontSize: 17, fontWeight: "900", color: colors.primary },
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
  rowValue: { fontSize: 13, fontWeight: "800", color: colors.primary },
});
