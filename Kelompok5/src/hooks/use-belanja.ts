import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import { LOGIN_HREF } from "@/constants/navigation";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import type { Product } from "@/data/products";

// Hanya pelanggan yang sudah masuk yang boleh memasukkan produk ke keranjang.
// Tamu (belum login) diarahkan ke /login, owner/karyawan diberi tahu.
export function useBelanja() {
  const router = useRouter();
  const { profil } = useAuth();
  const { add } = useCart();

  // Tombol keranjang ditampilkan untuk tamu dan pelanggan, disembunyikan untuk owner/karyawan
  const tampilkanTombol = !profil || profil.peran === "pelanggan";

  const tambah = useCallback(
    (product: Product, qty = 1): boolean => {
      if (!profil) {
        const pesan =
          "Untuk menambahkan ke keranjang dan membuat pesanan, kamu perlu masuk atau daftar sebagai pelanggan.";
        if (Platform.OS === "web") {
          if (window.confirm(`Masuk dulu\n\n${pesan}\n\nMasuk sekarang?`)) {
            router.push(LOGIN_HREF);
          }
        } else {
          Alert.alert("Masuk dulu", pesan, [
            { text: "Nanti", style: "cancel" },
            { text: "Masuk / Daftar", onPress: () => router.push(LOGIN_HREF) },
          ]);
        }
        return false;
      }

      if (profil.peran !== "pelanggan") {
        const pesan = "Akun owner dan karyawan tidak bisa berbelanja. Gunakan akun pelanggan.";
        if (Platform.OS === "web") window.alert(pesan);
        else Alert.alert("Tidak bisa berbelanja", pesan);
        return false;
      }

      add(product, qty);
      return true;
    },
    [profil, add, router],
  );

  return { tambah, tampilkanTombol };
}
