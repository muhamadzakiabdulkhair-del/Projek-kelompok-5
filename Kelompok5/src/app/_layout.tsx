import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { OrdersProvider } from "@/context/orders";

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
      </CartProvider>
      </OrdersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
