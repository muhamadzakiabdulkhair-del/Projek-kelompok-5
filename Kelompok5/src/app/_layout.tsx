import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  usePathname,
  useRouter,
  type Href,
} from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { BERANDA, LOGIN_HREF, type Role } from "@/constants/navigation";
import { colors } from "@/constants/palette";
import { AuthProvider, useAuth } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { OrdersProvider } from "@/context/orders";

// Mengembalikan tujuan pengalihan, atau null bila halaman boleh dibuka.
// Peran selalu diambil dari akun yang login (tabel profiles), bukan dari alamat halaman.
function tentukanTujuan(pathname: string, peran: Role | null): Href | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const butuhOwner =
    p === "/admin/dashboard" ||
    p === "/admin/laporan" ||
    p === "/admin/karyawan" ||
    p === "/admin/pelanggan";
  const butuhStaf = p === "/kelola-produk";
  const butuhLogin = p === "/pesanan" || p === "/profil";
  const butuhPelanggan = p === "/keranjang";

  // Belum login: halaman khusus akun diarahkan ke login, halaman umum bebas
  if (!peran) {
    return butuhOwner || butuhStaf || butuhLogin || butuhPelanggan ? LOGIN_HREF : null;
  }

  // Sudah login: tidak perlu melihat halaman login lagi
  if (p === "/login") return BERANDA[peran];

  // Peran tidak cocok: kembalikan ke beranda perannya
  if (butuhOwner && peran !== "owner") return BERANDA[peran];
  if (butuhStaf && peran === "pelanggan") return BERANDA[peran];
  if (butuhPelanggan && peran !== "pelanggan") return BERANDA[peran];

  return null;
}

// Penjaga halaman: menutup halaman sampai pemeriksaan sesi selesai
function PenjagaRute() {
  const { profil, memuat } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const tujuan = memuat ? null : tentukanTujuan(pathname, profil?.peran ?? null);

  useEffect(() => {
    if (tujuan) router.replace(tujuan);
  }, [tujuan, router]);

  // Selama memeriksa sesi atau sedang mengalihkan, tampilkan layar tunggu
  if (!memuat && !tujuan) return null;
  return (
    <View style={styles.tunggu}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <OrdersProvider>
          <CartProvider>
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="produk/[id]" />
              <Stack.Screen name="keranjang" />
              <Stack.Screen name="pesanan" />
              <Stack.Screen name="profil" />
              <Stack.Screen name="kelola-produk" />
              <Stack.Screen name="admin/dashboard" />
              <Stack.Screen name="admin/laporan" />
              <Stack.Screen name="admin/karyawan" />
              <Stack.Screen name="admin/pelanggan" />
              <Stack.Screen name="login" />
            </Stack>
            <PenjagaRute />
          </CartProvider>
        </OrdersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tunggu: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
});
