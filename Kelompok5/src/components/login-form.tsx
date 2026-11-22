import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BERANDA } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { useAuth } from "@/context/auth";
import { AppButton } from "./app-button";
import { AppInput } from "./app-input";

type Props = {
  initialEmail?: string;
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Satu form login untuk semua peran. Tujuan setelah login ditentukan oleh peran akun.
export function LoginForm({ initialEmail = "" }: Props) {
  const router = useRouter();
  const { masuk, masukGoogle } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!EMAIL_REGEX.test(email.trim()))
      e.email = "Format email belum benar.";
    if (!password) e.password = "Kata sandi wajib diisi.";
    setErrors(e);
    setFormError("");
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const hasil = await masuk(email.trim().toLowerCase(), password);
      if (hasil.ok) router.replace(BERANDA[hasil.peran]);
      else setFormError(hasil.message);
    } catch {
      setFormError("Tidak dapat terhubung. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  }

  async function submitGoogle() {
    if (loading) return;
    setFormError("");
    setLoading(true);
    try {
      const hasil = await masukGoogle();
      if (hasil.ok) router.replace(BERANDA[hasil.peran]);
      else if (hasil.message) setFormError(hasil.message);
    } catch {
      setFormError("Tidak dapat terhubung. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
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

      <AppButton
        label="Masuk"
        icon="log-in-outline"
        onPress={submit}
        loading={loading}
      />

      <View style={styles.pemisah}>
        <View style={styles.garis} />
        <Text style={styles.pemisahText}>atau</Text>
        <View style={styles.garis} />
      </View>

      <AppButton
        label="Masuk dengan Google"
        icon="logo-google"
        variant="outline"
        onPress={submitGoogle}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900", color: colors.ink },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
  },
  pemisah: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 14,
  },
  garis: { flex: 1, height: 1, backgroundColor: colors.border },
  pemisahText: { fontSize: 12, color: colors.muted },
});
