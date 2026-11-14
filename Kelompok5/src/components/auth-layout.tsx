import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/palette";
import { BrandLogo } from "./brand-logo";

type Props = { children: ReactNode };

// Kerangka halaman login: hero merek + kartu form.
export function AuthLayout({ children }: Props) {
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
            {children}
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
});
