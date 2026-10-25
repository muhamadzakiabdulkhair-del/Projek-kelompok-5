import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Role } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { mockLogin } from "@/mock/auth";
import { AppButton } from "./app-button";
import { AppInput } from "./app-input";

type Props = {
  role: Role;
  redirectTo: Href;
  initialEmail?: string;
  hint?: string; // info akun testing
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form login dipakai bersama oleh portal Owner, Karyawan, dan Pelanggan.
export function LoginForm({ role, redirectTo, initialEmail = "", hint }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!EMAIL_REGEX.test(email.trim())) e.email = "Format email belum benar.";
    if (!password) e.password = "Kata sandi wajib diisi.";
    setErrors(e);
    setFormError("");
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const result = mockLogin({ email: email.trim().toLowerCase(), password, role });
    setLoading(false);
    if (result.ok) router.replace(redirectTo);
    else setFormError(result.message);
  }

  return (
    <View>
      <Text style={styles.title}>Masuk</Text>
      <Text style={styles.subtitle}>Silakan masuk untuk melanjutkan.</Text>

      {formError ? (
        <View style={styles.banner}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.bannerText}>{formError}</Text>
        </View>
      ) : null}

      <AppInput
        label="Email"
        icon="mail-outline"
        placeholder="nama@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <AppInput
        label="Kata sandi"
        icon="lock-closed-outline"
        placeholder="Masukkan kata sandi"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        onSubmitEditing={submit}
        error={errors.password}
      />

      <AppButton label="Masuk" icon="log-in-outline" onPress={submit} loading={loading} />

      {hint ? (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Akun default (testing)</Text>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: 16 },
  banner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: 10, marginBottom: 14,
  },
  bannerText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.danger },
  hint: { marginTop: 16, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12 },
  hintTitle: { fontSize: 11, fontWeight: "800", color: colors.primary, marginBottom: 2 },
  hintText: { fontSize: 12, color: colors.muted },
});
