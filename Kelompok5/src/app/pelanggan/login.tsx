import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { mockLogin, mockRegister } from "@/mock/auth";

type Tab = "login" | "register";

const GREEN = "#087F50";
const DARK_BG = "#0A2218";

export default function PelangganLoginScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  function showMessage(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      showMessage("Login", "Email dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const result = mockLogin({ email: email.trim().toLowerCase(), password, role: "pelanggan" });
      if (result.ok) {
        router.replace("/dashboard");
      } else {
        showMessage("Login gagal", result.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
      showMessage("Form belum lengkap", "Isi semua kolom terlebih dahulu.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      showMessage("Email tidak valid", "Masukkan alamat email yang benar.");
      return;
    }
    if (regPassword.length < 8) {
      showMessage("Kata sandi terlalu pendek", "Gunakan minimal 8 karakter.");
      return;
    }
    if (regPassword !== regConfirm) {
      showMessage("Kata sandi tidak cocok", "Periksa kembali konfirmasi kata sandi.");
      return;
    }
    setLoading(true);
    try {
      const result = mockRegister({ name: regName.trim(), email: regEmail.trim().toLowerCase(), password: regPassword, role: "pelanggan" });
      if (result.ok) {
        showMessage("Pendaftaran berhasil", "Silakan masuk dengan akun baru kamu.");
        setTab("login");
        setEmail(regEmail.trim().toLowerCase());
        setPassword("");
      } else {
        showMessage("Pendaftaran gagal", result.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Hero atas */}
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>🔥</Text>
            </View>
            <Text style={styles.brand}>VapeStore</Text>
            <Text style={styles.tagline}>Your Vape, Our Priority</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <View style={styles.tabs}>
              <Pressable style={[styles.tab, tab === "login" && styles.tabActive]} onPress={() => setTab("login")}>
                <Text style={[styles.tabText, tab === "login" && styles.tabTextActive]}>Login</Text>
              </Pressable>
              <Pressable style={[styles.tab, tab === "register" && styles.tabActive]} onPress={() => setTab("register")}>
                <Text style={[styles.tabText, tab === "register" && styles.tabTextActive]}>Register</Text>
              </Pressable>
            </View>

            {tab === "login" ? (
              <>
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

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.orText}>atau</Text>
                  <View style={styles.divider} />
                </View>

                <Pressable style={styles.socialBtn}>
                  <Text style={styles.socialIcon}>G</Text>
                  <Text style={styles.socialText}>Lanjut dengan Google</Text>
                </Pressable>

                <Pressable style={styles.socialBtn}>
                  <Text style={styles.socialIcon}></Text>
                  <Text style={styles.socialText}>Lanjut dengan Apple</Text>
                </Pressable>

                <View style={styles.bottomRow}>
                  <Text style={styles.bottomText}>Belum punya akun? </Text>
                  <Pressable onPress={() => setTab("register")}>
                    <Text style={styles.bottomLink}>Daftar di sini</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput style={styles.input} placeholder="Nama Lengkap" placeholderTextColor="#8A9E94" value={regName} onChangeText={setRegName} autoCapitalize="words" />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>✉</Text>
                  <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8A9E94" value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput style={styles.input} placeholder="Kata Sandi (min. 8 karakter)" placeholderTextColor="#8A9E94" value={regPassword} onChangeText={setRegPassword} secureTextEntry />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput style={styles.input} placeholder="Konfirmasi Kata Sandi" placeholderTextColor="#8A9E94" value={regConfirm} onChangeText={setRegConfirm} secureTextEntry />
                </View>

                <Pressable style={[styles.mainBtn, loading && styles.mainBtnDisabled]} onPress={handleRegister} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Daftar</Text>}
                </Pressable>

                <View style={styles.bottomRow}>
                  <Text style={styles.bottomText}>Sudah punya akun? </Text>
                  <Pressable onPress={() => setTab("login")}>
                    <Text style={styles.bottomLink}>Masuk di sini</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN_BTN = "#087F50";

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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EDE8",
    marginBottom: 22,
  },
  tab: { flex: 1, alignItems: "center", paddingBottom: 12 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: GREEN_BTN },
  tabText: { fontSize: 15, color: "#8A9E94", fontWeight: "600" },
  tabTextActive: { color: GREEN_BTN, fontWeight: "800" },
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
  forgotText: { fontSize: 12, color: GREEN_BTN, fontWeight: "700" },
  mainBtn: {
    backgroundColor: GREEN_BTN,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  mainBtnDisabled: { opacity: 0.6 },
  mainBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  divider: { flex: 1, height: 1, backgroundColor: "#E5EDE8" },
  orText: { fontSize: 12, color: "#9AAEA4" },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDE8E2",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  socialIcon: { fontSize: 16, fontWeight: "800", width: 22, textAlign: "center", color: "#16352A" },
  socialText: { fontSize: 14, color: "#16352A", fontWeight: "600" },
  bottomRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", marginTop: 8 },
  bottomText: { fontSize: 13, color: "#7A8E82" },
  bottomLink: { fontSize: 13, color: GREEN_BTN, fontWeight: "800" },
  otherPortals: { alignItems: "center", gap: 10, marginTop: 24 },
  portalLink: { fontSize: 12, color: "#5A9E7A", fontWeight: "600" },
});
