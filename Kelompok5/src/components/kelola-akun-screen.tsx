import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AkunSheet } from "@/components/akun-sheet";
import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { ScreenHeader } from "@/components/screen-header";
import { SearchBar } from "@/components/search-bar";
import { tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { useAuth } from "@/context/auth";
import {
  buatKaryawan,
  fetchAkun,
  type Akun,
  type Karyawan,
  type PeranAkun,
  type StatusAkun,
} from "@/services/karyawanService";

// ─── Validasi ─────────────────────────────────────────────────────────────────

type FormErrors = {
  nama?: string;
  email?: string;
  password?: string;
  konfirmasi?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validasi(
  nama: string,
  email: string,
  password: string,
  konfirmasi: string,
  emailTerpakai: (e: string) => boolean,
): FormErrors {
  const e: FormErrors = {};
  if (!nama.trim()) e.nama = "Nama lengkap wajib diisi.";

  const em = email.trim().toLowerCase();
  if (!em) e.email = "Email wajib diisi.";
  else if (!EMAIL_REGEX.test(em)) e.email = "Format email tidak valid.";
  else if (emailTerpakai(em)) e.email = "Email sudah terdaftar sebagai karyawan.";

  if (!password) e.password = "Password wajib diisi.";
  else if (password.length < 8) e.password = "Password minimal 8 karakter.";

  if (!konfirmasi) e.konfirmasi = "Konfirmasi password wajib diisi.";
  else if (password !== konfirmasi) e.konfirmasi = "Konfirmasi password tidak sama.";
  return e;
}

function tanggal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Teks per peran ───────────────────────────────────────────────────────────

const TEKS: Record<
  PeranAkun,
  {
    judul: string;
    jamak: string;
    deskripsi: string;
    bolehTambah: boolean;
    kosongJudul: string;
    kosongPesan: string;
  }
> = {
  karyawan: {
    judul: "Kelola Karyawan",
    jamak: "karyawan",
    deskripsi:
      "Daftarkan dan pantau akun karyawan toko. Ketuk karyawan untuk mengedit data, mereset password, atau menonaktifkan akun.",
    bolehTambah: true,
    kosongJudul: "Belum ada karyawan",
    kosongPesan: "Daftarkan akun karyawan pertama Anda.",
  },
  pelanggan: {
    judul: "Kelola Pelanggan",
    jamak: "pelanggan",
    deskripsi:
      "Pantau akun pelanggan. Ketuk pelanggan untuk mengedit data, mereset password bila lupa, atau menonaktifkan akun.",
    bolehTambah: false,
    kosongJudul: "Belum ada pelanggan",
    kosongPesan: "Pelanggan muncul di sini setelah mendaftar lewat aplikasi.",
  },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export function KelolaAkunScreen({ peran }: { peran: PeranAkun }) {
  const { profil } = useAuth();
  const teks = TEKS[peran];

  const [daftar, setDaftar] = useState<Karyawan[]>([]);
  const [dipilih, setDipilih] = useState<Akun | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [sukses, setSukses] = useState<string | null>(null);
  const timerSukses = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Muat data dari Supabase ────────────────────────────────────────────────
  const muat = useCallback(async (senyap = false) => {
    if (!senyap) {
      setLoading(true);
      setLoadError(null);
    }
    try {
      setDaftar(await fetchAkun(peran));
    } catch (e) {
      if (!senyap) setLoadError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      if (!senyap) setLoading(false);
    }
  }, [peran]);

  useEffect(() => {
    muat();
  }, [muat]);

  useEffect(
    () => () => {
      if (timerSukses.current) clearTimeout(timerSukses.current);
    },
    [],
  );

  // ── Pencarian ──────────────────────────────────────────────────────────────
  const tampil = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return daftar;
    return daftar.filter(
      (k) => k.nama.toLowerCase().includes(q) || k.email.toLowerCase().includes(q),
    );
  }, [daftar, search]);

  // ── Form ───────────────────────────────────────────────────────────────────
  function bukaForm() {
    setNama("");
    setEmail("");
    setPassword("");
    setKonfirmasi("");
    setErrors({});
    setFormError(null);
    setFormVisible(true);
  }

  function tutupForm() {
    if (saving) return; // jangan ditutup saat proses berjalan
    setFormVisible(false);
  }

  function tampilkanSukses(pesan: string) {
    setSukses(pesan);
    if (timerSukses.current) clearTimeout(timerSukses.current);
    timerSukses.current = setTimeout(() => setSukses(null), 4000);
  }

  async function simpan() {
    if (saving) return; // cegah klik berulang
    setFormError(null);

    const e = validasi(nama, email, password, konfirmasi, (em) =>
      daftar.some((k) => k.email.toLowerCase() === em),
    );
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const baru = await buatKaryawan({ nama, email, password });
      setDaftar((lama) => [baru, ...lama.filter((k) => k.id !== baru.id)]);
      setFormVisible(false);
      setSearch("");
      tampilkanSukses(`Akun karyawan ${baru.nama} berhasil didaftarkan.`);
      muat(true); // sinkronkan ulang dari database tanpa layar loading
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "Gagal mendaftarkan karyawan.";
      if (pesan.toLowerCase().includes("email sudah terdaftar")) {
        setErrors({ email: pesan });
      } else {
        setFormError(pesan);
      }
    } finally {
      setSaving(false);
    }
  }

  // Pengaman tambahan di layar; penjaga utama ada di _layout dan di server.
  if (profil?.peran !== "owner") return null;

  // ── Isi daftar ─────────────────────────────────────────────────────────────
  let isi;
  if (loading) {
    isi = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.centerText}>{`Memuat daftar ${teks.jamak}...`}</Text>
      </View>
    );
  } else if (loadError) {
    isi = (
      <EmptyState
        icon="alert-circle-outline"
        title="Gagal memuat data"
        message={loadError}
        actionLabel="Coba Lagi"
        onAction={() => muat()}
      />
    );
  } else {
    isi = (
      <FlatList
        data={tampil}
        keyExtractor={(k) => k.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          daftar.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title={teks.kosongJudul}
              message={teks.kosongPesan}
              actionLabel={teks.bolehTambah ? "Tambah Karyawan" : undefined}
              onAction={teks.bolehTambah ? bukaForm : undefined}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title={`${peran === "karyawan" ? "Karyawan" : "Pelanggan"} tidak ditemukan`}
              message="Coba kata kunci nama atau email lain."
            />
          )
        }
        renderItem={({ item: k }) => {
          const aktif = k.status === "Aktif";
          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                !aktif && styles.rowRedup,
                pressed && styles.rowDitekan,
              ]}
              onPress={() => setDipilih(k)}
              accessibilityRole="button"
              accessibilityLabel={`Kelola akun ${k.nama}`}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(k.nama.trim()[0] ?? "?").toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.nama} numberOfLines={1}>{k.nama}</Text>
                <Text style={styles.email} numberOfLines={1}>{k.email}</Text>
                <Text style={styles.tgl}>Terdaftar {tanggal(k.created_at)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: aktif ? colors.primarySoft : colors.dangerSoft }]}>
                <Text style={[styles.badgeText, { color: aktif ? colors.primary : colors.danger }]}>
                  {k.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.placeholder} />
            </Pressable>
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title={teks.judul} subtitle="Owner" back />

      <View style={styles.top}>
        <Text style={styles.desc}>{teks.deskripsi}</Text>

        {sukses ? (
          <View style={styles.banner}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.bannerText}>{sukses}</Text>
          </View>
        ) : null}

        {teks.bolehTambah ? (
          <AppButton icon="person-add-outline" label="Tambah Karyawan" onPress={bukaForm} />
        ) : null}
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari nama atau email..." />
      </View>

      {isi}

      <BottomNav tabs={tabsForRole("owner")} active="dashboard" />

      {/* ── Formulir Tambah Karyawan ── */}
      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={tutupForm}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.sheet}>
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>Tambah Karyawan</Text>
                <Pressable onPress={tutupForm} hitSlop={10} accessibilityLabel="Tutup form">
                  <Ionicons name="close" size={22} color={colors.ink} />
                </Pressable>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {formError ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.errorBoxText}>{formError}</Text>
                  </View>
                ) : null}

                <AppInput
                  label="Nama Lengkap"
                  icon="person-outline"
                  placeholder="Contoh: Budi Santoso"
                  value={nama}
                  onChangeText={setNama}
                  error={errors.nama}
                  maxLength={100}
                  autoCapitalize="words"
                  editable={!saving}
                />
                <AppInput
                  label="Email"
                  icon="mail-outline"
                  placeholder="karyawan@email.com"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                />
                <AppInput
                  label="Password Awal"
                  icon="lock-closed-outline"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  secureTextEntry
                  maxLength={72}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                />
                <AppInput
                  label="Konfirmasi Password"
                  icon="lock-closed-outline"
                  placeholder="Ulangi password"
                  value={konfirmasi}
                  onChangeText={setKonfirmasi}
                  error={errors.konfirmasi}
                  secureTextEntry
                  maxLength={72}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                />

                <AppButton
                  label="Daftarkan Karyawan"
                  icon="person-add-outline"
                  onPress={simpan}
                  loading={saving}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Sheet aksi per akun: edit, reset password, nonaktifkan/aktifkan ── */}
      <AkunSheet
        akun={dipilih}
        peran={peran}
        onTutup={() => setDipilih(null)}
        onDiubah={(baru) =>
          setDaftar((lama) => lama.map((a) => (a.id === baru.id ? { ...a, ...baru } : a)))
        }
        onStatusDiubah={(id: string, status: StatusAkun) =>
          setDaftar((lama) => lama.map((a) => (a.id === id ? { ...a, status } : a)))
        }
        onSukses={(pesan) => {
          tampilkanSukses(pesan);
          muat(true); // sinkronkan ulang dari database tanpa layar loading
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { padding: 14, gap: 10 },
  desc: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  banner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 10,
  },
  bannerText: { flex: 1, fontSize: 12, fontWeight: "700", color: colors.primary },

  content: { paddingHorizontal: 14, paddingBottom: 14, gap: 10, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  centerText: { fontSize: 13, color: colors.muted },

  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  rowRedup: { opacity: 0.6 },
  rowDitekan: { opacity: 0.85 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  info: { flex: 1, gap: 1 },
  nama: { fontSize: 14, fontWeight: "800", color: colors.ink },
  email: { fontSize: 12, color: colors.muted },
  tgl: { fontSize: 10, color: colors.placeholder },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(10,34,24,0.55)" },
  sheet: {
    maxHeight: "92%", backgroundColor: colors.surface,
    padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  sheetHead: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: colors.ink },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: 10, marginBottom: 14,
  },
  errorBoxText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.danger },
});
