import { KelolaAkunScreen } from "@/components/kelola-akun-screen";

// Halaman Kelola Karyawan (khusus owner). Isinya ada di komponen bersama
// KelolaAkunScreen, dipakai juga oleh halaman Kelola Pelanggan.
export default function KelolaKaryawanScreen() {
  return <KelolaAkunScreen peran="karyawan" />;
}
