
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

export default function RootLayout() {
  const colorScheme = useColorScheme();

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