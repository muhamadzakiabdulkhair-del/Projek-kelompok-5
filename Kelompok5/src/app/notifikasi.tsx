import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDialog } from "@/components/app-dialog";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { useAuth } from "@/context/auth";
import { useNotifikasi } from "@/context/notifikasi";
import { formatWaktu, type Notifikasi, type TipeNotifikasi } from "@/services/notifikasiService";
import type { IconName } from "@/types/icon";

// Ikon, warna, dan tujuan ketuk untuk tiap jenis notifikasi.
const TIPE: Record<TipeNotifikasi, { ikon: IconName; fg: string; bg: string; tujuan: Href }> = {
  pesanan_baru: { ikon: "receipt-outline", fg: colors.primary, bg: colors.primarySoft, tujuan: "/pesanan" },
  status_pesanan: { ikon: "swap-horizontal-outline", fg: "#1D5FB8", bg: "#EAF3FF", tujuan: "/pesanan" },
  stok_menipis: { ikon: "alert-circle-outline", fg: colors.warning, bg: colors.warningSoft, tujuan: "/kelola-produk" },
};

export default function NotifikasiScreen() {
  const router = useRouter();
  const dialog = useDialog();
  const { profil } = useAuth();
  const role = profil?.peran ?? "pelanggan";
  const { daftar, belumDibaca, memuat, muatUlang, tandaiDibaca, tandaiSemuaDibaca, hapus } =
    useNotifikasi();

  function tampilkanGalat(judul: string, err: unknown) {
    const pesan = err instanceof Error ? err.message : "Terjadi kesalahan.";
    dialog.info({ judul, pesan, tipe: "error" });
  }

  // Ketuk isi pesan: hanya menandai sudah dibaca.
  async function baca(n: Notifikasi) {
    try {
      await tandaiDibaca(n.id);
    } catch (err) {
      tampilkanGalat("Gagal menandai dibaca", err);
    }
  }

  // "Lihat detail": tandai dibaca, lalu buka halaman terkait.
  async function lihatDetail(n: Notifikasi) {
    router.push(TIPE[n.tipe].tujuan);
    await baca(n);
  }

  async function bacaSemua() {
    try {
      await tandaiSemuaDibaca();
    } catch (err) {
      tampilkanGalat("Gagal menandai semua dibaca", err);
    }
  }

  function konfirmasiHapus(n: Notifikasi) {
    dialog.konfirmasi({
      judul: "Hapus notifikasi?",
      pesan: "Notifikasi ini akan dihapus dari daftarmu.",
      labelYa: "Hapus",
      bahaya: true,
      onYa: async () => {
        try {
          await hapus(n.id);
        } catch (err) {
          tampilkanGalat("Gagal menghapus", err);
        }
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Notifikasi"
        subtitle={belumDibaca > 0 ? `${belumDibaca} belum dibaca` : "Semua sudah dibaca"}
        back
        right={
          belumDibaca > 0 ? (
            <Pressable
              style={styles.aksiHeader}
              accessibilityRole="button"
              accessibilityLabel="Tandai semua dibaca"
              onPress={bacaSemua}
            >
              <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
            </Pressable>
          ) : null
        }
      />

      <FlatList
        data={daftar}
        refreshing={memuat}
        onRefresh={muatUlang}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          memuat ? null : (
            <EmptyState
              icon="notifications-off-outline"
              title="Belum ada notifikasi"
              message="Pemberitahuan untukmu akan tampil di sini."
            />
          )
        }
        renderItem={({ item }) => {
          const t = TIPE[item.tipe];
          return (
            <View style={[styles.card, !item.dibaca && styles.cardBaru]}>
              {/* Bagian atas: isi pesan. Bagian bawah: tombol. Semuanya bersaudara (bukan bersarang),
                  karena di web Pressable menjadi <button> dan <button> tidak boleh berisi <button>. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.judul}. ${item.pesan}`}
                onPress={() => baca(item)}
                style={({ pressed }) => [styles.pesanBox, pressed && styles.ditekan]}
              >
                <View style={[styles.ikon, { backgroundColor: t.bg }]}>
                  <Ionicons name={t.ikon} size={20} color={t.fg} />
                </View>
                <View style={styles.isi}>
                  <View style={styles.barisJudul}>
                    <Text style={styles.judul} numberOfLines={1}>{item.judul}</Text>
                    {!item.dibaca ? <View style={styles.titik} /> : null}
                    <Text style={styles.waktu}>{formatWaktu(item.dibuat)}</Text>
                  </View>
                  <Text style={styles.pesan}>{item.pesan}</Text>
                </View>
              </Pressable>

              <View style={styles.footer}>
                <Pressable
                  style={({ pressed }) => [styles.detail, pressed && styles.ditekan]}
                  accessibilityRole="button"
                  onPress={() => lihatDetail(item)}
                >
                  <Text style={styles.detailTeks}>Lihat detail</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </Pressable>
                <Pressable
                  style={styles.hapus}
                  accessibilityRole="button"
                  accessibilityLabel="Hapus notifikasi"
                  hitSlop={8}
                  onPress={() => konfirmasiHapus(item)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.placeholder} />
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {/* Layar ini bukan salah satu tab, jadi tidak ada tab yang ditandai aktif. */}
      <BottomNav tabs={tabsForRole(role)} active="" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, gap: 10, flexGrow: 1 },
  aksiHeader: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10,
  },
  cardBaru: { borderColor: colors.primary, backgroundColor: colors.tint },
  ditekan: { opacity: 0.85 },
  pesanBox: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  ikon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  isi: { flex: 1, gap: 4 },
  barisJudul: { flexDirection: "row", alignItems: "center", gap: 6 },
  judul: { fontSize: 14, fontWeight: "800", color: colors.ink, flexShrink: 1 },
  titik: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  waktu: { fontSize: 11, color: colors.muted, marginLeft: "auto" },
  pesan: { fontSize: 13, lineHeight: 19, color: colors.ink },
  footer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10,
  },
  detail: { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 2 },
  detailTeks: { fontSize: 13, fontWeight: "800", color: colors.primary },
  hapus: { padding: 4 },
});
