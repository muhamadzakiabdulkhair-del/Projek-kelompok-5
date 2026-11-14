import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
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
import {
  ubahAkun,
  setStatusAkun,
  resetPasswordAkun,
  validasiNama,
  validasiPasswordBaru,
  validasiTelepon,
  type Akun,
  type PeranAkun,
  type StatusAkun,
} from "@/services/karyawanService";

// Sheet aksi untuk satu akun karyawan/pelanggan: Edit Data, Reset Password,
// Nonaktifkan/Aktifkan. Dipakai oleh halaman Kelola Karyawan dan Kelola Pelanggan.

type Props = {
  /** Akun yang diketuk. null = sheet tertutup. */
  akun: Akun | null;
  peran: PeranAkun;
  onTutup: () => void;
  /** Dipanggil setelah nama/telepon berhasil disimpan. */
  onDiubah: (akun: Akun) => void;
  /** Dipanggil setelah status berhasil diubah di server. */
  onStatusDiubah: (id: string, status: StatusAkun) => void;
  /** Pesan sukses untuk banner di halaman. */
  onSukses: (pesan: string) => void;
};

type Mode = "menu" | "edit" | "password";

// Konfirmasi yang jalan di web (window.confirm) dan native (Alert.alert)
function konfirmasi(
  judul: string,
  pesan: string,
  labelYa: string,
  onYes: () => void,
) {
  if (Platform.OS === "web") {
    if (window.confirm(pesan)) onYes();
    return;
  }
  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    { text: labelYa, onPress: onYes },
  ]);
}

export function AkunSheet(props: Props) {
  // Dipasang ulang setiap akun berganti, jadi isian form selalu bersih
  if (!props.akun) return null;
  return <IsiSheet key={props.akun.id} {...props} akun={props.akun} />;
}

function IsiSheet({
  akun,
  peran,
  onTutup,
  onDiubah,
  onStatusDiubah,
  onSukses,
}: Props & { akun: Akun }) {
  const [mode, setMode] = useState<Mode>("menu");
  const [busy, setBusy] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const [nama, setNama] = useState(akun.nama);
  const [phone, setPhone] = useState(akun.phone ?? "");
  const [errNama, setErrNama] = useState<string | undefined>();
  const [errPhone, setErrPhone] = useState<string | undefined>();

  const [passBaru, setPassBaru] = useState("");
  const [konf, setKonf] = useState("");
  const [errPass, setErrPass] = useState<string | undefined>();
  const [errKonf, setErrKonf] = useState<string | undefined>();

  const aktif = akun.status === "Aktif";
  const labelPeran = peran === "karyawan" ? "karyawan" : "pelanggan";

  function tutup() {
    if (busy) return; // jangan ditutup saat proses berjalan
    onTutup();
  }

  function kembaliKeMenu() {
    if (busy) return;
    setMode("menu");
    setPesanError(null);
  }

  // ── Edit data ──────────────────────────────────────────────────────────────
  async function simpanEdit() {
    if (busy) return; // cegah klik berulang
    setPesanError(null);
    const eNama = validasiNama(nama);
    const ePhone = validasiTelepon(phone);
    setErrNama(eNama);
    setErrPhone(ePhone);
    if (eNama || ePhone) return;

    setBusy(true);
    try {
      const baru = await ubahAkun(akun.id, peran, { nama, phone });
      onDiubah(baru);
      onSukses(`Data ${baru.nama} berhasil diperbarui.`);
      onTutup();
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : "Gagal menyimpan perubahan.");
    } finally {
      setBusy(false);
    }
  }

  // ── Reset password ─────────────────────────────────────────────────────────
  async function simpanPassword() {
    if (busy) return;
    setPesanError(null);
    const ePass = validasiPasswordBaru(passBaru);
    let eKonf: string | undefined;
    if (!konf) eKonf = "Konfirmasi password wajib diisi.";
    else if (passBaru !== konf) eKonf = "Konfirmasi password tidak sama.";
    setErrPass(ePass);
    setErrKonf(eKonf);
    if (ePass || eKonf) return;

    setBusy(true);
    try {
      await resetPasswordAkun(akun.id, passBaru);
      onSukses(
        `Password ${akun.nama} berhasil direset. Sampaikan password baru kepada yang bersangkutan.`,
      );
      onTutup();
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : "Gagal mereset password.");
    } finally {
      setBusy(false);
    }
  }

  // ── Nonaktifkan / Aktifkan ─────────────────────────────────────────────────
  function ubahStatus() {
    if (busy) return;
    const target: StatusAkun = aktif ? "Nonaktif" : "Aktif";
    const pesan = aktif
      ? `Nonaktifkan akun ${akun.nama}? Akun tidak akan bisa login sampai diaktifkan kembali.`
      : `Aktifkan kembali akun ${akun.nama}? Akun bisa login lagi.`;

    konfirmasi(
      aktif ? "Nonaktifkan Akun" : "Aktifkan Akun",
      pesan,
      aktif ? "Nonaktifkan" : "Aktifkan",
      async () => {
        setPesanError(null);
        setBusy(true);
        try {
          const baru = await setStatusAkun(akun.id, target);
          onStatusDiubah(akun.id, baru);
          onSukses(
            baru === "Nonaktif"
              ? `Akun ${akun.nama} dinonaktifkan.`
              : `Akun ${akun.nama} diaktifkan kembali.`,
          );
          onTutup();
        } catch (e) {
          setPesanError(e instanceof Error ? e.message : "Gagal mengubah status akun.");
        } finally {
          setBusy(false);
        }
      },
    );
  }

  const judul =
    mode === "edit" ? "Edit Data" : mode === "password" ? "Reset Password" : "Kelola Akun";

  return (
    <Modal visible animationType="slide" transparent onRequestClose={tutup}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{judul}</Text>
              <Pressable onPress={tutup} hitSlop={10} accessibilityLabel="Tutup">
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {pesanError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorBoxText}>{pesanError}</Text>
                </View>
              ) : null}

              {/* Ringkasan akun */}
              <View style={styles.ringkas}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(akun.nama.trim()[0] ?? "?").toUpperCase()}
                  </Text>
                </View>
                <View style={styles.ringkasInfo}>
                  <Text style={styles.nama} numberOfLines={1}>{akun.nama}</Text>
                  <Text style={styles.email} numberOfLines={1}>{akun.email}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: aktif ? colors.primarySoft : colors.dangerSoft },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: aktif ? colors.primary : colors.danger }]}>
                    {akun.status}
                  </Text>
                </View>
              </View>

              {mode === "menu" ? (
                <View style={styles.aksi}>
                  <AppButton
                    variant="outline"
                    icon="create-outline"
                    label="Edit Data"
                    disabled={busy}
                    onPress={() => {
                      setPesanError(null);
                      setMode("edit");
                    }}
                  />
                  <AppButton
                    variant="outline"
                    icon="lock-closed-outline"
                    label="Reset Password"
                    disabled={busy}
                    onPress={() => {
                      setPesanError(null);
                      setMode("password");
                    }}
                  />
                  <AppButton
                    variant={aktif ? "danger" : "soft"}
                    icon={aktif ? "ban-outline" : "checkmark-circle-outline"}
                    label={aktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                    loading={busy}
                    onPress={ubahStatus}
                  />
                  <Text style={styles.catatan}>
                    {aktif
                      ? `Akun ${labelPeran} yang dinonaktifkan tidak bisa login, tetapi datanya tetap tersimpan. Akun tidak dapat dihapus.`
                      : `Akun ${labelPeran} ini sedang nonaktif dan tidak bisa login. Aktifkan kembali agar bisa dipakai.`}
                  </Text>
                </View>
              ) : null}

              {mode === "edit" ? (
                <View>
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
                  <AppInput
                    label="Email"
                    icon="mail-outline"
                    value={akun.email}
                    editable={false}
                  />
                  <Text style={styles.catatan}>
                    Email adalah identitas login dan tidak dapat diubah dari sini.
                  </Text>
                  <View style={styles.tombolBaris}>
                    <AppButton
                      style={styles.tombolBagi}
                      variant="outline"
                      label="Batal"
                      disabled={busy}
                      onPress={kembaliKeMenu}
                    />
                    <AppButton
                      style={styles.tombolBagi}
                      label="Simpan"
                      icon="save-outline"
                      loading={busy}
                      onPress={simpanEdit}
                    />
                  </View>
                </View>
              ) : null}

              {mode === "password" ? (
                <View>
                  <AppInput
                    label="Password Baru"
                    icon="lock-closed-outline"
                    placeholder="Minimal 8 karakter"
                    value={passBaru}
                    onChangeText={setPassBaru}
                    error={errPass}
                    secureTextEntry
                    maxLength={72}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!busy}
                  />
                  <AppInput
                    label="Konfirmasi Password"
                    icon="lock-closed-outline"
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
                    Sampaikan password baru langsung kepada yang bersangkutan. Sesi yang sedang
                    login di perangkat lain tidak otomatis keluar.
                  </Text>
                  <View style={styles.tombolBaris}>
                    <AppButton
                      style={styles.tombolBagi}
                      variant="outline"
                      label="Batal"
                      disabled={busy}
                      onPress={kembaliKeMenu}
                    />
                    <AppButton
                      style={styles.tombolBagi}
                      label="Reset"
                      icon="key-outline"
                      loading={busy}
                      onPress={simpanPassword}
                    />
                  </View>
                </View>
              ) : null}
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

  ringkas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  ringkasInfo: { flex: 1, gap: 1 },
  nama: { fontSize: 14, fontWeight: "800", color: colors.ink },
  email: { fontSize: 12, color: colors.muted },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  aksi: { gap: spacing.md, paddingBottom: spacing.sm },
  catatan: { fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: spacing.md },
  tombolBaris: { flexDirection: "row", gap: spacing.md, paddingBottom: spacing.sm },
  tombolBagi: { flex: 1 },
});
