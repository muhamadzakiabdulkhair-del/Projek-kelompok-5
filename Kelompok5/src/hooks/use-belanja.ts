import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useDialog } from "@/components/app-dialog";
import { LOGIN_HREF } from "@/constants/navigation";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import type { Product } from "@/data/products";
import { catatInteraksi } from "@/services/interactionService";

// Hanya pelanggan yang sudah masuk yang boleh memasukkan produk ke keranjang.
// Tamu (belum login) diarahkan ke /login, owner/karyawan diberi tahu.
export function useBelanja() {
  const router = useRouter();
  const { profil } = useAuth();
  const { add } = useCart();
  const dialog = useDialog();

  // Tombol keranjang ditampilkan untuk tamu dan pelanggan, disembunyikan untuk owner/karyawan
  const tampilkanTombol = !profil || profil.peran === "pelanggan";

  const tambah = useCallback(
    (product: Product, qty = 1): boolean => {
      if (!profil) {
        const pesan =
          "Untuk menambahkan ke keranjang dan membuat pesanan, kamu perlu masuk atau daftar sebagai pelanggan.";
        dialog.konfirmasi({
          judul: "Masuk dulu",
          pesan,
          tipe: "info",
          ikon: "log-in-outline",
          labelBatal: "Nanti",
          labelYa: "Masuk / Daftar",
          onYa: () => router.push(LOGIN_HREF),
        });
        return false;
      }

      if (profil.peran !== "pelanggan") {
        const pesan =
          "Akun owner dan karyawan tidak bisa berbelanja. Gunakan akun pelanggan.";
        dialog.info({
          judul: "Tidak bisa berbelanja",
          pesan,
          tipe: "peringatan",
        });
        return false;
      }

      add(product, qty);
      catatInteraksi(product.id, "cart");
      return true;
    },
    [profil, add, router, dialog],
  );

  return { tambah, tampilkanTombol };
}
