import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Halaman publik */}
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="explore" />

        {/* Auth lama (tidak dipakai tapi tetap ada) */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Kelola produk (karyawan & owner) */}
        <Stack.Screen name="kelola-produk" />

        {/* Portal Owner */}
        <Stack.Screen name="admin/login" />
        <Stack.Screen name="admin/dashboard" />

        {/* Portal Karyawan */}
        <Stack.Screen name="karyawan/login" />

        {/* Portal Pelanggan */}
        <Stack.Screen name="pelanggan/login" />
      </Stack>
    </ThemeProvider>
  );
}
