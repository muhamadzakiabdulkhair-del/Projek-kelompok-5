import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { ModalTengah } from "@/components/modal-tengah";
import { colors, radius, spacing } from "@/constants/palette";
import { validasiPasswordBaru } from "@/services/karyawanService";
import { supabase } from "../../lib/supabase";

// Pop-up "Ubah Kata Sandi" untuk akun yang sedang login (semua peran).
// Memakai supabase.auth.updateUser; password lama diperiksa server bila
// opsi "Require current password when updating" aktif di dashboard Supabase.

type Props = {
  visible: boolean;
  onTutup: () => void;
};

type ErrorAuth = { code?: string; name?: string; message?: string };

function pesanDariError(error: ErrorAuth): string {
  // Catatan teknis untuk pengembang (tanpa password)
  console.warn("[ubahPassword]", error.code, error.name, error.message);

  switch (error.code) {
    case "same_password":
      return "Password baru harus berbeda dari password lama.";
    case "weak_password":
      return "Password terlalu lemah. Gunakan kombinasi yang lebih kuat.";
    case "invalid_credentials":
      return "Password lama salah.";
    case "reauthentication_needed":
    case "reauthentication_not_valid":
      return "Demi keamanan, keluar lalu login ulang sebelum mengganti password.";
    default:
      break;
  }
  if (error.name === "AuthRetryableFetchError") {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }
  return "Gagal mengganti password. Periksa password lama lalu coba lagi.";
}

export function UbahPasswordSheet({ visible, onTutup }: Props) {
  // Dipasang ulang setiap dibuka, jadi isian selalu bersih
  if (!visible) return null;
  return <Isi onTutup={onTutup} />;
}

function Isi({ onTutup }: { onTutup: () => void }) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [konf, setKonf] = useState("");
  const [errLama, setErrLama] = useState<string | undefined>();
  const [errBaru, setErrBaru] = useState<string | undefined>();
  const [errKonf, setErrKonf] = useState<string | undefined>();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selesai, setSelesai] = useState(false);

  function tutup() {
    if (busy) return; // jangan ditutup saat proses berjalan
    onTutup();
  }

  async function simpan() {
    if (busy) return; // cegah klik berulang
    setPesanError(null);

    const eLama = lama ? undefined : "Password lama wajib diisi.";
    let eBaru = validasiPasswordBaru(baru);
    if (!eBaru && baru === lama) eBaru = "Password baru harus berbeda dari password lama.";
    let eKonf: string | undefined;
    if (!konf) eKonf = "Konfirmasi password wajib diisi.";
    else if (baru !== konf) eKonf = "Konfirmasi password tidak sama.";
    setErrLama(eLama);
    setErrBaru(eBaru);
    setErrKonf(eKonf);
    if (eLama || eBaru || eKonf) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: baru,
        current_password: lama,
      });
      if (error) {
        setPesanError(pesanDariError(error as ErrorAuth));
        return;
      }
      setSelesai(true);
    } catch {
      setPesanError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setBusy(false);
    }
  }

  const footer = selesai ? (
    <AppButton label="Selesai" onPress={onTutup} />
  ) : (
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
  );

  return (
    <ModalTengah
      judul="Ubah Kata Sandi"
      onTutup={tutup}
      tutupSaatKetukLuar={!busy}
      footer={footer}
    >
      {selesai ? (
        <View style={styles.suksesBox}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={styles.suksesText}>
            Kata sandi berhasil diubah. Gunakan kata sandi baru saat login berikutnya.
          </Text>
        </View>
      ) : (
        <View>
          {pesanError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorBoxText}>{pesanError}</Text>
            </View>
          ) : null}

          <AppInput
            label="Password Lama"
            icon="lock-closed-outline"
            value={lama}
            onChangeText={setLama}
            error={errLama}
            secureTextEntry
            maxLength={72}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
          />
          <AppInput
            label="Password Baru"
            icon="key-outline"
            placeholder="Minimal 8 karakter"
            value={baru}
            onChangeText={setBaru}
            error={errBaru}
            secureTextEntry
            maxLength={72}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
          />
          <AppInput
            label="Konfirmasi Password Baru"
            icon="key-outline"
            placeholder="Ulangi password baru"
            value={konf}
            onChangeText={setKonf}
            error={errKonf}
            secureTextEntry
            maxLength={72}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
          />
          <Text style={styles.catatan}>
            Lupa password lama? Hubungi owner untuk mereset password akunmu.
          </Text>
        </View>
      )}
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
  suksesBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  suksesText: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.primary },
  catatan: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  tombolBaris: { flexDirection: "row", gap: spacing.md },
  tombolBagi: { flex: 1 },
});
