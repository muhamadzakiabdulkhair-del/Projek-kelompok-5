<<<<<<< HEAD

import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useColorScheme } from "react-native";
=======
  import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
  import { useColorScheme } from "react-native";
  import { AnimatedSplashOverlay } from "@/components/animated-icon";
  import { CartProvider } from "@/context/cart";
>>>>>>> 72d7c5b9be3827eae81b1c056b5934c4556770c8

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

<<<<<<< HEAD
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="kelola-produk" />
      </Stack>
    </ThemeProvider>
  );
}
'@ | Set-Content -Encoding utf8 .\Kelompok5\src\app\_layout.tsx'
=======
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
>>>>>>> 72d7c5b9be3827eae81b1c056b5934c4556770c8
