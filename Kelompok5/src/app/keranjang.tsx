import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/app-button";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { QtyStepper } from "@/components/qty-stepper";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole } from "@/constants/navigation";
import { colors, font, radius, spacing } from "@/constants/palette";
import { useCart, type CartLine } from "@/context/cart";
import { formatRupiah } from "@/data/products";

const ONGKOS_KIRIM = 15_000;

type PaymentMethod = "TRANSFER_BANK" | "QRIS" | "COD";

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "TRANSFER_BANK", label: "Transfer Bank", icon: "card-outline" },
  { key: "QRIS", label: "QRIS", icon: "qr-code-outline" },
  { key: "COD", label: "COD (Bayar di Tempat)", icon: "cash-outline" },
];

// ─── Item baris keranjang ──────────────────────────────────────────────────
function CartItemRow({ line, onSetQty, onRemove }: {
  line: CartLine;
  onSetQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const { product, qty } = line;
  const soldOut = product.stock <= 0;

  return (
    <View style={styles.card}>
      {/* Gambar produk */}
      <View style={styles.thumb}>
        <Image source={product.image} style={styles.thumbImg} resizeMode="contain" />
      </View>

      {/* Info produk */}
      <View style={styles.info}>
        <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.itemSub}>{product.sub}</Text>
        <Text style={styles.itemPrice}>{formatRupiah(product.price)}</Text>

        {soldOut && (
          <Text style={styles.soldOutBadge}>Stok habis</Text>
        )}
      </View>

      {/* Kontrol kanan */}
      <View style={styles.rightCol}>
        <Pressable
          style={styles.removeBtn}
          onPress={onRemove}
          hitSlop={8}
          accessibilityLabel={`Hapus ${product.name}`}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>

        <QtyStepper
          value={qty}
          onChange={onSetQty}
          min={1}
          max={Math.max(1, product.stock)}
        />
      </View>
    </View>
  );
}

// ─── Baris metode pembayaran ───────────────────────────────────────────────
function PaymentRow({
  opt,
  selected,
  onSelect,
}: {
  opt: (typeof PAYMENT_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      style={[styles.payRow, selected && styles.payRowActive]}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.payIconBox, selected && styles.payIconBoxActive]}>
        <Ionicons
          name={opt.icon}
          size={20}
          color={selected ? colors.white : colors.primary}
        />
      </View>
      <Text style={[styles.payLabel, selected && styles.payLabelActive]}>
        {opt.label}
      </Text>
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

// ─── Screen utama ──────────────────────────────────────────────────────────
export default function KeranjangScreen() {
  const router = useRouter();
  const { lines, total, count, setQty, remove, clear } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("TRANSFER_BANK");
  const [loading, setLoading] = useState(false);

  const ongkir = lines.length > 0 ? ONGKOS_KIRIM : 0;
  const grandTotal = total + ongkir;

  const handleCheckout = () => {
    if (lines.length === 0) return;

    const payLabel = PAYMENT_OPTIONS.find((p) => p.key === payment)?.label ?? payment;

    const msg = `Total: ${formatRupiah(grandTotal)}\nMetode: ${payLabel}\n\nPesanan berhasil dibuat!`;

    if (Platform.OS === "web") {
      window.alert(msg);
      clear();
      router.replace("/pesanan");
      return;
    }

    setLoading(true);
    // Simulasi proses checkout (UTS: tanpa backend)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Pesanan Dibuat ✓",
        `Total: ${formatRupiah(grandTotal)}\nMetode: ${payLabel}`,
        [
          {
            text: "Lihat Pesanan",
            onPress: () => {
              clear();
              router.replace("/pesanan");
            },
          },
          {
            text: "Lanjut Belanja",
            style: "cancel",
            onPress: () => clear(),
          },
        ]
      );
    }, 600);
  };

  // ── Header kanan: jumlah item ──
  const headerRight =
    count > 0 ? (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count} item</Text>
      </View>
    ) : null;

  // ── Footer ringkasan ──
  const listFooter = (
    <View style={styles.footerWrap}>
      {/* Metode pembayaran */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        {PAYMENT_OPTIONS.map((opt) => (
          <PaymentRow
            key={opt.key}
            opt={opt}
            selected={payment === opt.key}
            onSelect={() => setPayment(opt.key)}
          />
        ))}
      </View>

      {/* Ringkasan harga */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ringkasan Belanja</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({count} barang)</Text>
          <Text style={styles.summaryValue}>{formatRupiah(total)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ongkos Kirim</Text>
          <Text style={styles.summaryValue}>{formatRupiah(ongkir)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{formatRupiah(grandTotal)}</Text>
        </View>
      </View>

      {/* Tombol checkout */}
      <AppButton
        label="Buat Pesanan"
        icon="checkmark-circle"
        loading={loading}
        disabled={lines.length === 0 || loading}
        onPress={handleCheckout}
        style={styles.checkoutBtn}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Keranjang"
        back
        right={headerRight}
      />

      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="Keranjang masih kosong"
            message="Yuk, tambahkan produk dari katalog."
            actionLabel="Lihat Katalog"
            onAction={() => router.replace("/dashboard")}
          />
        }
        ListFooterComponent={lines.length > 0 ? listFooter : null}
        renderItem={({ item }) => (
          <CartItemRow
            line={item}
            onSetQty={(qty) => setQty(item.product.id, qty)}
            onRemove={() => remove(item.product.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />

      <BottomNav tabs={tabsForRole("pelanggan")} active="keranjang" />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl + 8, flexGrow: 1 },
  sep: { height: spacing.sm },

  // Header badge
  countBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: { fontSize: font.small, fontWeight: "700", color: colors.primary },

  // Item card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%" },
  info: { flex: 1, gap: 3 },
  itemName: { fontSize: font.body, fontWeight: "800", color: colors.ink },
  itemSub: { fontSize: font.small, color: colors.placeholder },
  itemPrice: { fontSize: font.body, fontWeight: "800", color: colors.primary, marginTop: 4 },
  soldOutBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 72,
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer (metode bayar + ringkasan)
  footerWrap: { gap: spacing.lg, marginTop: spacing.lg },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: { fontSize: font.heading, fontWeight: "800", color: colors.ink, marginBottom: 4 },

  // Metode pembayaran
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.bg,
  },
  payRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  payIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  payIconBoxActive: { backgroundColor: colors.primary },
  payLabel: { flex: 1, fontSize: font.body, color: colors.muted, fontWeight: "600" },
  payLabelActive: { color: colors.primary, fontWeight: "800" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderInput,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },

  // Ringkasan harga
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: font.body, color: colors.muted },
  summaryValue: { fontSize: font.body, color: colors.muted, fontWeight: "600" },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: font.heading, fontWeight: "900", color: colors.ink },
  totalValue: { fontSize: font.heading, fontWeight: "900", color: colors.primary },

  // Tombol
  checkoutBtn: { marginBottom: spacing.sm },
});
