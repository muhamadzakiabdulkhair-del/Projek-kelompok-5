import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
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

export default function HomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      setNotification({
        visible: true,
        title,
        message,
      });
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    if (!notification.visible) return;

    const timer = setTimeout(() => {
      setNotification({
        visible: false,
        title: "",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleLogin = () => {
    if (!email.trim() || !password) {
      showMessage("Login", "Email dan kata sandi wajib diisi.");
      return;
    }

    showMessage(
      "Belum terhubung",
      "Tampilan login sudah siap. Autentikasi akun akan kita buat pada tahap backend.",
    );
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {notification.visible && Platform.OS === "web" && (
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationCard}>
            <View style={styles.notificationIcon}>
              <Text style={styles.notificationIconText}>✓</Text>
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setNotification({ visible: false, title: "", message: "" })
              }
              accessibilityRole="button"
              accessibilityLabel="Tutup notifikasi"
            >
              <Text style={styles.notificationClose}>×</Text>
            </Pressable>
          </View>
        </View>
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>♨</Text>
            </View>

            <Text style={styles.brand}>
              Vape<Text style={styles.brandGreen}>Store</Text>
            </Text>

            <Text style={styles.tagline}>Your Vape, Our Priority</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.tabs}>
              <View style={styles.activeTab}>
                <Text style={styles.activeTabText}>Login</Text>
                <View style={styles.tabUnderline} />
              </View>

              <Pressable style={styles.inactiveTab} onPress={handleRegister}>
                <Text style={styles.inactiveTabText}>Register</Text>
              </Pressable>
            </View>

            <Text style={styles.heading}>Selamat datang!</Text>
            <Text style={styles.subtitle}>Masuk ke akun VapeStore kamu.</Text>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan email"
                placeholderTextColor="#9299A3"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                accessibilityLabel="Email"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Kata sandi</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>♙</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan kata sandi"
                placeholderTextColor="#9299A3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                accessibilityLabel="Kata sandi"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "Sembunyi" : "Lihat"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.forgotButton}
              onPress={() =>
                Alert.alert(
                  "Lupa kata sandi",
                  "Fitur pemulihan akun akan dibuat pada tahap berikutnya.",
                )
              }
            >
              <Text style={styles.forgotText}>Lupa kata sandi?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              accessibilityRole="button"
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>atau</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.socialNote}>
              Login sosial akan ditambahkan jika diperlukan.
            </Text>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <Pressable onPress={handleRegister}>
                <Text style={styles.registerLink}>Daftar di sini</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>VapeStore © 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  notificationOverlay: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  notificationCard: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderLeftWidth: 5,
    borderLeftColor: "#047857",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationIconText: {
    color: "#047857",
    fontSize: 22,
    fontWeight: "700",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: "#064E3B",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  notificationMessage: {
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 19,
  },
  notificationClose: {
    color: "#6B7280",
    fontSize: 25,
    paddingHorizontal: 4,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#E1F4EB",
    borderWidth: 1,
    borderColor: "#B8E5D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 36,
    color: "#087F54",
    transform: [{ rotate: "-20deg" }],
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: "#17221D",
    letterSpacing: -1,
  },
  brandGreen: {
    color: "#07865A",
  },
  tagline: {
    fontSize: 13,
    color: "#69756F",
    marginTop: 5,
  },
  formCard: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E7ECE9",
    shadowColor: "#183D2E",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECEA",
    marginBottom: 24,
  },
  activeTab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 13,
    borderBottomWidth: 3,
    borderBottomColor: "#07865A",
  },
  activeTabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#07865A",
  },
  inactiveTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 13,
  },
  inactiveTabText: {
    fontSize: 15,
    color: "#68746E",
  },
  heading: {
    fontSize: 23,
    fontWeight: "800",
    color: "#19241F",
  },
  subtitle: {
    fontSize: 13,
    color: "#7A847E",
    marginTop: 6,
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#35443B",
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DFE6E1",
    borderRadius: 11,
    paddingHorizontal: 13,
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    width: 28,
    fontSize: 18,
    color: "#718078",
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 13,
    fontSize: 14,
    color: "#202923",
  },
  showPassword: {
    fontSize: 12,
    fontWeight: "600",
    color: "#07865A",
    paddingLeft: 8,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -5,
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#07865A",
  },
  loginButton: {
    minHeight: 51,
    backgroundColor: "#07865A",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
    marginBottom: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E6EBE7",
  },
  orText: {
    fontSize: 12,
    color: "#8A948E",
  },
  socialNote: {
    fontSize: 12,
    textAlign: "center",
    color: "#7B857F",
    lineHeight: 19,
  },
  registerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  registerText: {
    color: "#65716A",
    fontSize: 13,
  },
  registerLink: {
    color: "#07865A",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 11,
    color: "#929B95",
  },
});
