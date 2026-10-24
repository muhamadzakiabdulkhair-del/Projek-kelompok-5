import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { mockRegister } from "@/mock/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function showMessage(title: string, message: string) {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      showMessage("Form belum lengkap", "Isi semua kolom terlebih dahulu.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showMessage("Email tidak valid", "Masukkan alamat email yang benar.");
      return;
    }

    if (password.length < 8) {
      showMessage("Kata sandi terlalu pendek", "Gunakan minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        "Kata sandi tidak cocok",
        "Periksa kembali konfirmasi kata sandi.",
      );
      return;
    }

    setLoading(true);
    try {
      const result = mockRegister({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.ok) {
        showMessage("Pendaftaran berhasil", "Akun kamu sudah dibuat. Silakan masuk.");
        router.replace("/login");
      } else {
        showMessage("Pendaftaran gagal", result.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.brand}>VapeStore</Text>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>
            Daftar untuk mulai menggunakan VapeStore.
          </Text>

          <Text style={styles.label}>Nama lengkap</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama lengkap"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Text style={styles.label}>Kata sandi</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimal 8 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <Text style={styles.label}>Konfirmasi kata sandi</Text>
          <TextInput
            style={styles.input}
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Daftar</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={styles.link}>Masuk di sini</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8F5",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E1EAE4",
  },
  brand: {
    color: "#087F50",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#16352A",
  },
  subtitle: {
    color: "#64746B",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    color: "#263B30",
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D5E1D9",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#16352A",
  },
  button: {
    backgroundColor: "#087F50",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },
  footerText: {
    color: "#64746B",
  },
  link: {
    color: "#087F50",
    fontWeight: "700",
  },
});
