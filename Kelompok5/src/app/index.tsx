import { Redirect } from "expo-router";

// Halaman utama langsung ke katalog publik
export default function Index() {
  return <Redirect href="/dashboard" />;
}
