import { KelolaAkunScreen } from "@/components/kelola-akun-screen";

// Halaman Kelola Pelanggan (khusus owner). Isinya ada di komponen bersama
// KelolaAkunScreen, dipakai juga oleh halaman Kelola Karyawan.
export default function KelolaPelangganScreen() {
  return <KelolaAkunScreen peran="pelanggan" />;
}
