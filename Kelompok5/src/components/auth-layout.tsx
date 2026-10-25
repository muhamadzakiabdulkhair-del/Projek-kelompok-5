import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LOGIN_HREF, type Role } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { BrandLogo } from "./brand-logo";

const PORTAL_LABEL: Record<Role, string> = {
  owner: "Owner / Admin",
  karyawan: "Karyawan",
  pelanggan: "Pelanggan",
};

type Props = { current: Role; children: ReactNode };

// Kerangka halaman login: hero merek + kartu form + pintasan ke portal role lain.
export function AuthLayout({ current, children }: Props) {
  const router = useRouter();
  const others = (Object.keys(PORTAL_LABEL) as Role[]).filter((r) => r !== current);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <BrandLogo size={72} light showText={false} />
            <Text style={styles.brand}>VapeStore</Text>
            <Text style={styles.tagline}>Your Vape, Our Priority</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.pill}>
              <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
              <Text style={styles.pillText}>{PORTAL_LABEL[current]}</Text>
            </View>
            {children}
          </View>

          <View style={styles.portals}>
            {others.map((r) => (
              <Pressable key={r} onPress={() => router.push(LOGIN_HREF[r])}>
                <Text style={styles.portalLink}>Masuk sebagai {PORTAL_LABEL[r]} →</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: { alignItems: "center", paddingTop: 40, paddingBottom: 28, gap: 6 },
  brand: { fontSize: 30, fontWeight: "900", color: colors.white, marginTop: 8 },
  tagline: { fontSize: 13, color: "#7DCCA4" },
  card: {
    marginHorizontal: 20, padding: 20,
    backgroundColor: colors.surface, borderRadius: 24,
  },
  pill: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: colors.primarySoft, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 16,
  },
  pillText: { fontSize: 11, fontWeight: "800", color: colors.primary },
  portals: { alignItems: "center", gap: 10, marginTop: 20 },
  portalLink: { color: "#7DCCA4", fontSize: 13, fontWeight: "700" },
});
