import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { AuthLayout } from "@/components/auth-layout";
import { EMAIL_REGEX, LoginForm } from "@/components/login-form";
import { colors, radius } from "@/constants/palette";
import { mockRegister } from "@/mock/auth";

type Tab = "login" | "register";
type RegErrors = { name?: string; email?: string; password?: string; confirm?: string };

export default function PelangganLoginScreen() {
  const [tab, setTab] = useState<Tab>("login");
  const [justRegistered, setJustRegistered] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<RegErrors>({});
  const [formError, setFormError] = useState("");

  function register() {
    const e: RegErrors = {};
    if (!name.trim()) e.name = "Nama lengkap wajib diisi.";
    if (!email.trim()) e.email = "Email wajib diisi.";
    else if (!EMAIL_REGEX.test(email.trim())) e.email = "Format email belum benar.";
    if (!password) e.password = "Kata sandi wajib diisi.";
    else if (password.length < 8) e.password = "Minimal 8 karakter.";
    if (confirm !== password) e.confirm = "Konfirmasi kata sandi tidak cocok.";
    setErrors(e);
    setFormError("");
    if (Object.keys(e).length > 0) return;

    const result = mockRegister({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "pelanggan",
    });
    if (result.ok) {
      setJustRegistered(email.trim().toLowerCase());
      setPassword("");
      setConfirm("");
      setTab("login");
    } else {
      setFormError(result.message);
    }
  }

  return (
    <AuthLayout current="pelanggan">
      <View style={styles.tabs}>
        {(["login", "register"] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === "login" ? "Masuk" : "Daftar"}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "login" ? (
        <View>
          {justRegistered ? (
            <View style={styles.success}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.successText}>Pendaftaran berhasil. Silakan masuk.</Text>
            </View>
          ) : null}
          <LoginForm key={justRegistered} role="pelanggan" redirectTo="/dashboard" initialEmail={justRegistered} />
        </View>
      ) : (
        <View>
          {formError ? (
            <View style={styles.banner}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.bannerText}>{formError}</Text>
            </View>
          ) : null}
          <AppInput label="Nama lengkap" icon="person-outline" placeholder="Nama kamu" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} />
          <AppInput label="Email" icon="mail-outline" placeholder="nama@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <AppInput label="Kata sandi" icon="lock-closed-outline" placeholder="Minimal 8 karakter" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" error={errors.password} />
          <AppInput label="Konfirmasi kata sandi" icon="lock-closed-outline" placeholder="Ulangi kata sandi" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" error={errors.confirm} />
          <AppButton label="Daftar" icon="person-add-outline" onPress={register} />
        </View>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row", backgroundColor: colors.bg, borderRadius: radius.md,
    padding: 4, marginBottom: 18,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: colors.muted },
  tabTextActive: { color: colors.white },
  banner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: 10, marginBottom: 14,
  },
  bannerText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.danger },
  success: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 10, marginBottom: 14,
  },
  successText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.primary },
});
