import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useGlobalSearchParams,
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
import { LOGIN_HREF, parseRole, type Role } from "@/constants/navigation";
import { colors } from "@/constants/palette";
import { AuthProvider, useAuth } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { OrdersProvider } from "@/context/orders";

// Beranda masing-masing peran (tujuan bila salah masuk halaman)
const BERANDA: Record<Role, Href> = {
  owner: "/admin/dashboard",
  karyawan: "/kelola-produk?role=karyawan" as Href,
  pelanggan: "/dashboard",
};

// Mengembalikan tujuan pengalihan, atau null bila halaman boleh dibuka
function tentukanTujuan(
  pathname: string,
  peran: Role | null,
  roleParam: Role,
): Href | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const butuhOwner = p === "/admin/dashboard" || p === "/admin/laporan";
  const butuhStaf = p === "/kelola-produk";
  const butuhLogin = p === "/pesanan" || p === "/profil";

  // Halaman umum (katalog, detail produk, keranjang, login): bebas dibuka
  if (!butuhOwner && !butuhStaf && !butuhLogin) return null;

  // Belum login: arahkan ke halaman login yang sesuai
  if (!peran) {
    if (butuhOwner) return LOGIN_HREF.owner;
    if (butuhStaf)
      return LOGIN_HREF[roleParam === "owner" ? "owner" : "karyawan"];
    return LOGIN_HREF[roleParam];
  }

  // Sudah login tetapi peran tidak cocok: kembalikan ke beranda perannya
  if (butuhOwner && peran !== "owner") return BERANDA[peran];
  if (butuhStaf && peran === "pelanggan") return BERANDA[peran];

  return null;
}

// Penjaga halaman: menutup halaman sampai pemeriksaan sesi selesai
function PenjagaRute() {
  const { profil, memuat } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useGlobalSearchParams<{ role?: string }>();

  const tujuan = memuat
    ? null
    : tentukanTujuan(pathname, profil?.peran ?? null, parseRole(role));

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
              <Stack.Screen name="admin/login" />
              <Stack.Screen name="karyawan/login" />
              <Stack.Screen name="pelanggan/login" />
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
