import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "@/constants/palette";

// Penanda usia: strip kecil di bagian atas beranda
export function PenandaUsia() {
  return (
    <View style={styles.strip}>
      <View style={styles.lencana}>
        <Text style={styles.lencanaText}>18+</Text>
      </View>
      <Text style={styles.stripText}>
        Produk vape hanya untuk pengguna berusia 18 tahun ke atas.
      </Text>
    </View>
  );
}

// Disclaimer di keranjang, tepat sebelum tombol Buat Pesanan
export function DisclaimerUsia() {
  return (
    <View style={styles.kotak}>
      <Ionicons name="information-circle" size={16} color={colors.warning} />
      <Text style={styles.kotakText}>
        Dengan membuat pesanan, kamu menyatakan berusia minimal 18 tahun.
        Aplikasi ini adalah simulasi untuk tugas kuliah: tidak ada penjualan
        atau pembayaran sungguhan.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  lencana: {
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lencanaText: { color: colors.white, fontSize: font.small, fontWeight: "900" },
  stripText: {
    flex: 1,
    fontSize: font.small,
    color: colors.warning,
    fontWeight: "600",
  },
  kotak: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  kotakText: {
    flex: 1,
    fontSize: font.small,
    lineHeight: 18,
    color: colors.warning,
  },
});
