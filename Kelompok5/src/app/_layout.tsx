  import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
  import { useColorScheme } from "react-native";
  import { AnimatedSplashOverlay } from "@/components/animated-icon";
  import { CartProvider } from "@/context/cart";

  export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <CartProvider>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            {/* Pelanggan */}
            <Stack.Screen name="index" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="produk/[id]" />
            <Stack.Screen name="keranjang" />
            <Stack.Screen name="pesanan" />
            <Stack.Screen name="profil" />

            {/* Owner & karyawan */}
            <Stack.Screen name="kelola-produk" />
            <Stack.Screen name="admin/dashboard" />
            <Stack.Screen name="admin/laporan" />

            {/* Login per role */}
            <Stack.Screen name="admin/login" />
            <Stack.Screen name="karyawan/login" />
            <Stack.Screen name="pelanggan/login" />
          </Stack>
        </CartProvider>
      </ThemeProvider>
    );
  }
