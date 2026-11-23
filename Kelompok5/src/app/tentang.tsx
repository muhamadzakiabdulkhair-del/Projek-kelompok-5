import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { BrandLogo } from "@/components/brand-logo";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole, type Role } from "@/constants/navigation";
import { colors, radius, spacing } from "@/constants/palette";
import { useAuth } from "@/context/auth";

const PARAGRAF = [
  "VapeStore adalah toko vape yang hadir untuk memudahkan perokok dewasa menemukan perangkat dan liquid berkualitas dalam satu tempat. Berawal dari toko kecil yang melayani pelanggan sekitar, kini VapeStore hadir dalam aplikasi agar belanja lebih praktis kapan saja.",
  "Kami menyediakan berbagai pilihan produk, mulai dari mod, pod, coil, hingga liquid dari berbagai merek. Setiap produk kami pilih dengan teliti dan dijual dengan harga yang jelas, sehingga pelanggan dapat berbelanja dengan tenang.",
];

const NILAI: { icon: keyof typeof Ionicons.glyphMap; judul: string; isi: string }[] = [
  {
    icon: "shield-checkmark-outline",
    judul: "Produk Terjamin",
    isi: "Kami menjual produk yang diperoleh dari pemasok terpercaya.",
  },
  {
    icon: "pricetag-outline",
    judul: "Harga Transparan",
    isi: "Harga dan stok yang tampil di aplikasi selalu diperbarui.",
  },
  {
    icon: "chatbubbles-outline",
    judul: "Layanan Ramah",
    isi: "Tim kami siap membantu memilih produk yang sesuai kebutuhan Anda.",
  },
];

export default function TentangScreen() {
  const { profil } = useAuth();
  const role: Role = profil?.peran ?? "pelanggan";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Tentang VapeStore" back />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoBox}>
          <BrandLogo />
        </View>

        {PARAGRAF.map((p) => (
          <Text key={p} style={styles.paragraf}>
            {p}
          </Text>
        ))}

        {NILAI.map((n) => (
          <View key={n.judul} style={styles.nilaiRow}>
            <View style={styles.nilaiIcon}>
              <Ionicons name={n.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.nilaiText}>
              <Text style={styles.nilaiJudul}>{n.judul}</Text>
              <Text style={styles.nilaiIsi}>{n.isi}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.versi}>VapeStore v1.0.0</Text>
      </ScrollView>

      <BottomNav tabs={tabsForRole(role)} active="profil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl + 8 },
  logoBox: { alignItems: "center", paddingVertical: spacing.md },
  paragraf: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  nilaiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  nilaiIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  nilaiText: { flex: 1, gap: 2 },
  nilaiJudul: { fontSize: 13, fontWeight: "800", color: colors.ink },
  nilaiIsi: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  versi: { fontSize: 11, color: colors.placeholder, textAlign: "center", paddingTop: spacing.sm },
});