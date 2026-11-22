import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/app-button";
import { BERANDA, LOGIN_HREF } from "@/constants/navigation";
import { colors } from "@/constants/palette";
import { useAuth } from "@/context/auth";
import { bacaParamAuth, pesanErrorOAuth, tukarKode } from "@/services/authService";

const BATAS_WAKTU_MS = 15000;

// Halaman tujuan Google setelah login (redirectTo = <alamat-app>/auth/callback).
//  - Web : supabase-js menukar ?code=... otomatis; layar ini tinggal menunggu sesi.
//  - HP  : layar ini muncul bila sistem membuka aplikasi lewat tautan balikan.
//          Kode ditukar di sini (aman dipanggil dua kali, lihat tukarKode).
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const { profil, memuat } = useAuth();
  const [pesanError, setPesanError] = useState<string | null>(null);

  // 1. Periksa error dari Google/Supabase dan (di HP) tukar kodenya.
  useEffect(() => {
    // Error bisa ada di ?query maupun #fragment, jadi baca dari alamat lengkap.
    const param = Platform.OS === "web" ? bacaParamAuth(window.location.href) : {};
    if (param.error || param.error_description) {
      setPesanError(pesanErrorOAuth(param));
      return;
    }
    if (Platform.OS !== "web" && params.code) {
      tukarKode(params.code).then((hasil) => {
        if (!hasil.ok) setPesanError(hasil.message);
      });
    }
  }, [params.code]);

  // 2. Sesi dan profil siap -> pindah ke beranda sesuai peran.
  useEffect(() => {
    if (!memuat && profil) router.replace(BERANDA[profil.peran]);
  }, [memuat, profil, router]);

  // 3. Batas waktu supaya pengguna tidak menunggu tanpa akhir.
  useEffect(() => {
    const t = setTimeout(
      () => setPesanError((lama) => lama ?? "Login memakan waktu terlalu lama. Coba lagi."),
      BATAS_WAKTU_MS,
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.wrap}>
      {pesanError ? (
        <>
          <Text style={styles.judul}>Login belum berhasil</Text>
          <Text style={styles.pesan}>{pesanError}</Text>
          <AppButton label="Kembali ke halaman masuk" onPress={() => router.replace(LOGIN_HREF)} />
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.pesan}>Menyelesaikan login...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
  },
  judul: { fontSize: 18, fontWeight: "900", color: colors.ink },
  pesan: { fontSize: 13, color: colors.muted, textAlign: "center" },
});