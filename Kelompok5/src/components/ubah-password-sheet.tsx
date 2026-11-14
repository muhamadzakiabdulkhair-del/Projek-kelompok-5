import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { colors, radius, spacing } from "@/constants/palette";
import { validasiPasswordBaru } from "@/services/karyawanService";
import { supabase } from "../../lib/supabase";

// Sheet "Ubah Kata Sandi" untuk akun yang sedang login (semua peran).
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

  return (
    <Modal visible animationType="slide" transparent onRequestClose={tutup}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Ubah Kata Sandi</Text>
              <Pressable onPress={tutup} hitSlop={10} accessibilityLabel="Tutup">
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {selesai ? (
                <View>
                  <View style={styles.suksesBox}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <Text style={styles.suksesText}>
                      Kata sandi berhasil diubah. Gunakan kata sandi baru saat login berikutnya.
                    </Text>
                  </View>
                  <AppButton label="Selesai" onPress={onTutup} />
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
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // colors.primaryDark + alpha 0x8C (sekitar 55%) untuk latar gelap di belakang sheet
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: `${colors.primaryDark}8C` },
  sheet: {
    maxHeight: "92%",
    backgroundColor: colors.surface,
    padding: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: colors.ink },
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
  catatan: { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: spacing.md },
  tombolBaris: { flexDirection: "row", gap: spacing.md, paddingBottom: spacing.sm },
  tombolBagi: { flex: 1 },
});
