import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/app-button";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { FilterChips } from "@/components/filter-chips";
import { ScreenHeader } from "@/components/screen-header";
import { parseRole, tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { useOrders } from "@/context/orders";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/data/orders";
import { formatRupiah } from "@/data/products";

const STATUS_COLOR: Record<OrderStatus, { fg: string; bg: string }> = {
  "Menunggu Bayar": { fg: colors.warning, bg: colors.warningSoft },
  Diproses: { fg: "#1D5FB8", bg: "#EAF3FF" },
  Selesai: { fg: colors.primary, bg: colors.primarySoft },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  "Menunggu Bayar": "Diproses",
  Diproses: "Selesai",
};

// Dipakai pelanggan (riwayat pesanan) dan karyawan (pengelolaan pesanan) — dibedakan oleh param `role`.
export default function PesananScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = parseRole(roleParam);
  const isStaff = role !== "pelanggan";

  const { orders, advanceStatus } = useOrders();
  const [filter, setFilter] = useState("Semua");

  const visible = useMemo(
    () => orders.filter((o) => filter === "Semua" || o.status === filter),
    [orders, filter],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader
        title={isStaff ? "Pengelolaan Pesanan" : "Pesanan Saya"}
        subtitle={`${visible.length} pesanan`}
      />
      <View style={styles.filter}>
        <FilterChips options={["Semua", ...ORDER_STATUSES]} value={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title="Belum ada pesanan" message="Pesanan dengan status ini akan tampil di sini." />
        }
        renderItem={({ item }: { item: Order }) => {
          const sc = STATUS_COLOR[item.status];
          const next = NEXT_STATUS[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.invoice}>{item.id}</Text>
                <View style={[styles.status, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.fg }]}>{item.status}</Text>
                </View>
              </View>
              {isStaff ? (
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color={colors.muted} />
                  <Text style={styles.meta}>{item.customer}</Text>
                </View>
              ) : null}
              <Text style={styles.items}>{item.items}</Text>
              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.meta}>{item.date} · {item.method}</Text>
                  <Text style={styles.total}>{formatRupiah(item.total)}</Text>
                </View>
                {isStaff && next ? (
                  <AppButton
                    compact
                    variant="soft"
                    icon="arrow-forward"
                    label={next === "Diproses" ? "Proses" : "Selesaikan"}
                    onPress={() => advanceStatus(item.id)}
                  />
                ) : null}
              </View>
            </View>
          );
        }}
      />

      <BottomNav tabs={tabsForRole(role)} active="pesanan" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  filter: { paddingHorizontal: 14, paddingTop: 10 },
  content: { padding: 14, gap: 10, flexGrow: 1 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  invoice: { fontSize: 14, fontWeight: "800", color: colors.ink },
  status: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontSize: 12, color: colors.muted },
  items: { fontSize: 13, color: colors.ink },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 },
  total: { fontSize: 16, fontWeight: "900", color: colors.primary },
});
