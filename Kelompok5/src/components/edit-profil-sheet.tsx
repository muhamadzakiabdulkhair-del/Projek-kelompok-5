import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { ModalTengah } from "@/components/modal-tengah";
import { colors, radius, spacing } from "@/constants/palette";
import { useAuth } from "@/context/auth";
import { validasiNama, validasiTelepon } from "@/services/karyawanService";
import { supabase } from "../../lib/supabase";

// Pop-up "Edit Profil" untuk akun yang sedang login (semua peran).
// Yang bisa diubah: foto profil (opsional), nama, dan nomor telepon.
// Email dan peran tidak bisa diubah dari sini.
//
// Penyimpanan langsung ke tabel profiles, diizinkan policy RLS
// "profiles update sendiri". Kolom peran/status tidak pernah dikirim
// (dijaga juga oleh trigger jaga_ubah_profil).
// Foto disimpan di bucket 'avatars' pada folder milik sendiri: <uid>/<waktu>.jpg
// (lihat supabase/sql/003_bucket_avatars.sql).

const BUCKET = "avatars";
const MAKS_BYTE = 2 * 1024 * 1024; // 2 MB, sama dengan batas bucket
const EKSTENSI: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type FotoDipilih = { uri: string; base64: string; mime: string };

type Props = {
  visible: boolean;
  onTutup: () => void;
  /** Dipanggil setelah berhasil disimpan; layar induk yang menutup pop-up. */
  onSukses: () => void;
};

// ─── Bantuan foto ─────────────────────────────────────────────────────────────

/** Ambil path file di dalam bucket dari URL publik. null = bukan URL storage kita. */
function pathDariUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}

async function hapusFile(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn("[editProfil] gagal menghapus foto:", error.message);
}

/** Unggah foto; melempar Error dengan pesan yang mudah dipahami. */
async function unggahFoto(uid: string, foto: FotoDipilih) {
  const path = `${uid}/${Date.now()}.${EKSTENSI[foto.mime] ?? "jpg"}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(foto.base64), { contentType: foto.mime, upsert: false });

  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    console.warn("[editProfil] gagal mengunggah foto:", error.message);
    if (msg.includes("maximum allowed size") || msg.includes("too large")) {
      throw new Error("Foto terlalu besar. Pilih foto di bawah 2 MB.");
    }
    if (msg.includes("bucket not found") || msg.includes("row-level security") || msg.includes("unauthorized")) {
      throw new Error("Penyimpanan foto belum siap. Hubungi pengembang aplikasi.");
    }
    throw new Error("Gagal mengunggah foto. Periksa koneksi lalu coba lagi.");
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// ─── Komponen ─────────────────────────────────────────────────────────────────

export function EditProfilSheet({ visible, onTutup, onSukses }: Props) {
  // Dipasang ulang setiap dibuka, jadi isian selalu mulai dari data terbaru
  if (!visible) return null;
  return <Isi onTutup={onTutup} onSukses={onSukses} />;
}

function Isi({ onTutup, onSukses }: Omit<Props, "visible">) {
  const { profil, muatUlangProfil } = useAuth();

  const [nama, setNama] = useState(profil?.nama ?? "");
  const [phone, setPhone] = useState(profil?.phone ?? "");
  const [foto, setFoto] = useState<FotoDipilih | null>(null); // foto baru yang dipilih
  const [hapusFotoLama, setHapusFotoLama] = useState(false);
  const [errNama, setErrNama] = useState<string | undefined>();
  const [errPhone, setErrPhone] = useState<string | undefined>();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!profil) return null;

  // Foto yang ditampilkan: pilihan baru > foto tersimpan (kecuali akan dihapus)
  const uriTampil = foto?.uri ?? (hapusFotoLama ? null : profil.avatar_url);
  const inisial = (profil.nama.trim()[0] ?? profil.email[0] ?? "?").toUpperCase();

  function tutup() {
    if (busy) return; // jangan ditutup saat proses berjalan
    onTutup();
  }

  async function pilihFoto() {
    if (busy) return;
    setPesanError(null);

    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      setPesanError("Izinkan akses galeri untuk memilih foto.");
      return;
    }
    const hasil = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (hasil.canceled) return;

    const aset = hasil.assets[0];
    if (!aset?.base64) {
      setPesanError("Foto tidak dapat dibaca. Coba pilih foto lain.");
      return;
    }
    // Di HP, picker mengirim data JPEG; di web jenis aslinya dipakai
    const mime = Platform.OS === "web" ? (aset.mimeType ?? "image/jpeg") : "image/jpeg";
    if (!EKSTENSI[mime]) {
      setPesanError("Format foto harus JPG, PNG, atau WebP.");
      return;
    }
    if (Math.floor((aset.base64.length * 3) / 4) > MAKS_BYTE) {
      setPesanError("Foto terlalu besar. Pilih foto di bawah 2 MB.");
      return;
    }
    setFoto({ uri: aset.uri, base64: aset.base64, mime });
    setHapusFotoLama(false);
  }

  function hapusFoto() {
    if (busy) return;
    setFoto(null);
    setHapusFotoLama(true);
  }

  async function simpan() {
    if (busy || !profil) return; // cegah klik berulang
    setPesanError(null);

    const eNama = validasiNama(nama);
    const ePhone = validasiTelepon(phone);
    setErrNama(eNama);
    setErrPhone(ePhone);
    if (eNama || ePhone) return;

    const namaBaru = nama.trim();
    const phoneBaru = phone.trim() === "" ? null : phone.trim();
    const fotoBerubah = !!foto || (hapusFotoLama && !!profil.avatar_url);

    // Tidak ada yang berubah: cukup tutup
    if (
      !fotoBerubah &&
      namaBaru === profil.nama &&
      phoneBaru === (profil.phone ?? null)
    ) {
      onTutup();
      return;
    }

    setBusy(true);
    let fileBaru: string | null = null; // untuk dibersihkan bila penyimpanan ke DB gagal
    try {
      const perubahan: { nama: string; phone: string | null; avatar_url?: string | null } = {
        nama: namaBaru,
        phone: phoneBaru,
      };
      if (foto) {
        const hasil = await unggahFoto(profil.id, foto);
        fileBaru = hasil.path;
        perubahan.avatar_url = hasil.url;
      } else if (hapusFotoLama) {
        perubahan.avatar_url = null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(perubahan)
        .eq("id", profil.id)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn("[editProfil]", error.code, error.message);
        if (fileBaru) await hapusFile(fileBaru); // jangan tinggalkan file yatim
        setPesanError(
          error
            ? "Gagal menyimpan perubahan. Periksa koneksi lalu coba lagi."
            : "Profil tidak dapat diperbarui. Coba keluar lalu login ulang.",
        );
        return;
      }

      // Foto lama dihapus dari penyimpanan setelah data tersimpan (kalau diganti/dihapus)
      if ("avatar_url" in perubahan) {
        const pathLama = pathDariUrl(profil.avatar_url);
        if (pathLama) await hapusFile(pathLama);
      }

      await muatUlangProfil(); // tampilan profil ikut ter-update
      onSukses();
    } catch (e) {
      setPesanError(
        e instanceof Error && e.message
          ? e.message
          : "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalTengah
      judul="Edit Profil"
      onTutup={tutup}
      tutupSaatKetukLuar={!busy}
      footer={
        <View style={styles.tombolBaris}>
          <AppButton
            style={styles.tombolBagi}
            variant="outline"
            label="Batal"
            disabled={busy}
            onPress={tutup}
          />
          <AppButton
            style={styles.tombolBagi}
            label="Simpan"
            icon="save-outline"
            loading={busy}
            onPress={simpan}
          />
        </View>
      }
    >
      {pesanError ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.errorBoxText}>{pesanError}</Text>
        </View>
      ) : null}

      {/* Foto profil (opsional) */}
      <View style={styles.fotoBlok}>
        <View style={styles.avatar}>
          {uriTampil ? (
            <Image source={{ uri: uriTampil }} style={styles.avatarGambar} />
          ) : (
            <Text style={styles.avatarTeks}>{inisial}</Text>
          )}
        </View>
        <View style={styles.fotoAksi}>
          <AppButton
            compact
            variant="outline"
            icon="image-outline"
            label={uriTampil ? "Ganti Foto" : "Pilih Foto"}
            disabled={busy}
            onPress={pilihFoto}
          />
          {uriTampil ? (
            <AppButton
              compact
              variant="danger"
              icon="trash-outline"
              label="Hapus"
              disabled={busy}
              onPress={hapusFoto}
            />
          ) : null}
        </View>
        <Text style={styles.catatanFoto}>Opsional. JPG, PNG, atau WebP, maksimal 2 MB.</Text>
      </View>

      <AppInput
        label="Nama Lengkap"
        icon="person-outline"
        value={nama}
        onChangeText={setNama}
        error={errNama}
        maxLength={100}
        autoCapitalize="words"
        editable={!busy}
      />
      <AppInput
        label="Nomor Telepon (opsional)"
        icon="call-outline"
        placeholder="Contoh: 08123456789"
        value={phone}
        onChangeText={setPhone}
        error={errPhone}
        keyboardType="phone-pad"
        maxLength={20}
        editable={!busy}
      />
      <AppInput label="Email" icon="mail-outline" value={profil.email} editable={false} />
      <Text style={styles.catatan}>
        Email adalah identitas login dan tidak dapat diubah dari sini.
      </Text>
    </ModalTengah>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
  },
  errorBoxText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.danger },

  fotoBlok: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarGambar: { width: "100%", height: "100%" },
  avatarTeks: { fontSize: 32, fontWeight: "900", color: colors.white },
  fotoAksi: { flexDirection: "row", gap: spacing.sm },
  catatanFoto: { fontSize: 11, color: colors.muted },

  catatan: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  tombolBaris: { flexDirection: "row", gap: spacing.md },
  tombolBagi: { flex: 1 },
});
