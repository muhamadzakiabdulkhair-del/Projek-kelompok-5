import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole, type Role } from "@/constants/navigation";
import { colors, spacing } from "@/constants/palette";
import { useAuth } from "@/context/auth";

const SYARAT: { judul: string; isi: string }[] = [
  {
    judul: "1. Ketentuan Usia",
    isi: "Aplikasi ini hanya diperuntukkan bagi pengguna berusia minimal 18 tahun. Dengan menggunakan aplikasi, Anda menyatakan telah memenuhi batas usia tersebut. VapeStore berhak membatalkan pesanan jika terbukti pembeli di bawah umur.",
  },
  {
    judul: "2. Akun Pengguna",
    isi: "Anda wajib memberikan data yang benar saat mendaftar dan menjaga kerahasiaan kata sandi. Segala aktivitas yang dilakukan melalui akun Anda menjadi tanggung jawab Anda. Akun yang disalahgunakan dapat dinonaktifkan oleh pihak toko.",
  },
  {
    judul: "3. Pemesanan dan Harga",
    isi: "Harga dan ketersediaan stok yang tampil di aplikasi dapat berubah sewaktu-waktu. Pesanan dianggap sah setelah berhasil dibuat di aplikasi dan dikonfirmasi oleh pihak toko. Pesanan dapat dibatalkan bila stok habis atau terjadi kesalahan harga.",
  },
  {
    judul: "4. Pembayaran",
    isi: "Pembayaran dapat dilakukan melalui Transfer Bank, QRIS, atau COD (bayar di tempat) sesuai pilihan yang tersedia saat checkout. Pesanan diproses setelah pembayaran diterima, kecuali untuk metode COD.",
  },
  {
    judul: "5. Pengiriman dan Penerimaan",
    isi: "Waktu pengiriman bergantung pada lokasi dan kebijakan ekspedisi. Pastikan alamat dan nomor telepon yang Anda isi sudah benar. Kesalahan data yang diisi pembeli menjadi tanggung jawab pembeli.",
  },
  {
    judul: "6. Pengembalian dan Penukaran",
    isi: "Pengajuan retur atau penukaran hanya dapat dilakukan bila produk rusak atau tidak sesuai pesanan, dengan menyertakan video unboxing paling lambat 2×24 jam setelah barang diterima. Produk liquid yang sudah dibuka tidak dapat dikembalikan.",
  },
  {
    judul: "7. Penggunaan Produk",
    isi: "Produk vape mengandung nikotin yang bersifat adiktif. Gunakan produk dengan bijak, jauhkan dari anak-anak, dan jangan digunakan oleh ibu hamil atau menyusui. Pengguna wajib mematuhi peraturan yang berlaku di wilayahnya.",
  },
  {
    judul: "8. Privasi Data",
    isi: "Data pribadi Anda, seperti nama, email, nomor telepon, dan riwayat pesanan, hanya digunakan untuk keperluan layanan toko dan tidak dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.",
  },
  {
    judul: "9. Perubahan Ketentuan",
    isi: "VapeStore dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Dengan tetap menggunakan aplikasi setelah perubahan, Anda dianggap menyetujui ketentuan yang berlaku.",
  },
];

export default function SyaratScreen() {
  const { profil } = useAuth();
  const role: Role = profil?.peran ?? "pelanggan";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Syarat & Ketentuan" back />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.catatan}>
          Harap baca syarat dan ketentuan berikut sebelum menggunakan aplikasi VapeStore.
        </Text>

        {SYARAT.map((s) => (
          <View key={s.judul} style={styles.bagian}>
            <Text style={styles.bagianJudul}>{s.judul}</Text>
            <Text style={styles.paragraf}>{s.isi}</Text>
          </View>
        ))}

        <Text style={styles.versi}>Terakhir diperbarui: November 2026</Text>
      </ScrollView>

      <BottomNav tabs={tabsForRole(role)} active="profil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl + 8 },
  catatan: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  bagian: { gap: 4 },
  bagianJudul: { fontSize: 14, fontWeight: "800", color: colors.ink },
  paragraf: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  versi: { fontSize: 11, color: colors.placeholder, textAlign: "center", paddingTop: spacing.sm },
});