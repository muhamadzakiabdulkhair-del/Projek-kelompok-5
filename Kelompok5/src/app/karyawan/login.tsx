import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockLogin } from "@/mock/auth";

const GREEN = "#087F50";
const DARK_BG = "#0A2218";

export default function KaryawanLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function showMessage(title: string, message: string) {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      showMessage("Login", "Email dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const result = mockLogin({ email: email.trim().toLowerCase(), password, role: "karyawan" });
      if (result.ok) {
        router.replace("/kelola-produk?role=karyawan");
      } else {
        showMessage("Login gagal", result.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>🔥</Text>
            </View>
            <Text style={styles.brand}>VapeStore</Text>
            <Text style={styles.tagline}>Your Vape, Our Priority</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Login</Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>Karyawan</Text>
              </View>
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Email atau Username"
                placeholderTextColor="#8A9E94"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Kata Sandi"
                placeholderTextColor="#8A9E94"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁"}</Text>
              </Pressable>
            </View>

            <View style={styles.rememberRow}>
              <Text style={styles.rememberText}>Ingat saya</Text>
              <Pressable>
                <Text style={styles.forgotText}>Lupa kata sandi?</Text>
              </Pressable>
            </View>

            <Pressable style={[styles.mainBtn, loading && styles.mainBtnDisabled]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Masuk</Text>}
            </Pressable>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Akun default (testing)</Text>
              <Text style={styles.infoText}>karyawan@vapestore.com  ·  karyawan123</Text>
            </View>
          </View>

          <View style={styles.otherPortals}>
            <Pressable onPress={() => router.push("/admin/login")}>
              <Text style={styles.portalLink}>Masuk sebagai Owner →</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/pelanggan/login")}>
              <Text style={styles.portalLink}>Masuk sebagai Pelanggan →</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_BG },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  hero: { alignItems: "center", paddingTop: 48, paddingBottom: 32 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: "#0F3D25",
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1, borderColor: "#1A5C38",
  },
  logoIcon: { fontSize: 36 },
  brand: { fontSize: 36, fontWeight: "900", color: "#FFFFFF", letterSpacing: -1 },
  tagline: { fontSize: 13, color: "#7AAE90", marginTop: 4 },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
  },
  tabHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EDE8",
    paddingBottom: 14,
    marginBottom: 22,
  },
  tabTitle: { fontSize: 18, fontWeight: "800", color: GREEN, borderBottomWidth: 3, borderBottomColor: GREEN, paddingBottom: 2 },
  rolePill: { backgroundColor: "#E5F4EC", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  rolePillText: { fontSize: 11, color: GREEN, fontWeight: "700" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE8E2",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    minHeight: 52,
    backgroundColor: "#F8FBF9",
  },
  inputIcon: { fontSize: 16, marginRight: 10, width: 22 },
  input: { flex: 1, fontSize: 14, color: "#16352A", paddingVertical: 13 },
  eyeIcon: { fontSize: 16, paddingLeft: 8 },
  rememberRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  rememberText: { fontSize: 12, color: "#7A8E82" },
  forgotText: { fontSize: 12, color: GREEN, fontWeight: "700" },
  mainBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mainBtnDisabled: { opacity: 0.6 },
  mainBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  infoBox: {
    backgroundColor: "#F0FAF5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C8E8D8",
    alignItems: "center",
  },
  infoTitle: { fontSize: 11, color: GREEN, fontWeight: "700", marginBottom: 3 },
  infoText: { fontSize: 12, color: "#3A6E52" },
  otherPortals: { alignItems: "center", gap: 10, marginTop: 24 },
  portalLink: { fontSize: 12, color: "#5A9E7A", fontWeight: "600" },
});
