import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { usePathname, useRouter, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "@/constants/palette";
import { useNotifikasi } from "@/context/notifikasi";
import type { Notifikasi, TipeNotifikasi } from "@/services/notifikasiService";
import type { IconName } from "@/types/icon";

const TIPE: Record<TipeNotifikasi, { ikon: IconName; fg: string; bg: string; tujuan: Href }> = {
  pesanan_baru: { ikon: "receipt-outline", fg: colors.primary, bg: colors.primarySoft, tujuan: "/pesanan" },
  status_pesanan: { ikon: "swap-horizontal-outline", fg: "#1D5FB8", bg: "#EAF3FF", tujuan: "/pesanan" },
  stok_menipis: { ikon: "alert-circle-outline", fg: colors.warning, bg: colors.warningSoft, tujuan: "/kelola-produk" },
};

/** Lama banner tampil sebelum hilang sendiri (milidetik). */
const DURASI_TAMPIL = 6000;

const BUNYI = require("@/assets/sounds/notifikasi.wav");

/**
 * Banner di atas layar + bunyi saat notifikasi baru masuk lewat Realtime.
 * Dipasang sekali di _layout, di dalam NotifikasiProvider.
 */
export function NotifikasiBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { terbaru, tandaiDibaca } = useNotifikasi();

  const player = useAudioPlayer(BUNYI);
  const [tampil, setTampil] = useState<Notifikasi | null>(null);
  const geser = useRef(new Animated.Value(0)).current; // 0 = tersembunyi, 1 = terlihat
  const idTerakhir = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bunyi tetap terdengar walau HP dalam mode senyap (iOS).
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  function sembunyikan() {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(geser, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== "web" }).start(
      ({ finished }) => {
        if (finished) setTampil(null);
      },
    );
  }

  useEffect(() => {
    if (!terbaru || terbaru.id === idTerakhir.current) return;
    idTerakhir.current = terbaru.id;

    // Bunyi. Di web, browser bisa menolak sebelum pengguna menyentuh halaman: abaikan saja.
    try {
      player.seekTo(0);
      const hasil: unknown = player.play();
      if (hasil instanceof Promise) hasil.catch(() => {});
    } catch {
      /* tidak fatal */
    }

    // Di layar notifikasi, daftar sudah bertambah sendiri: banner tidak perlu.
    if (pathname === "/notifikasi") return;

    setTampil(terbaru);
    geser.setValue(0);
    Animated.timing(geser, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== "web" }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(sembunyikan, DURASI_TAMPIL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terbaru]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!tampil) return null;
  const t = TIPE[tampil.tipe];

  function lihat() {
    const n = tampil;
    sembunyikan();
    if (!n) return;
    router.push(TIPE[n.tipe].tujuan);
    tandaiDibaca(n.id).catch(() => {});
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wadah,
        {
          top: insets.top + 8,
          opacity: geser,
          transform: [{ translateY: geser.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        },
      ]}
    >
      {/* Isi dan tombol tutup bersaudara (bukan bersarang): di web Pressable menjadi <button>. */}
      <View style={styles.kartu}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${tampil.judul}. ${tampil.pesan}. Ketuk untuk melihat detail`}
          onPress={lihat}
          style={({ pressed }) => [styles.isiBox, pressed && styles.ditekan]}
        >
          <View style={[styles.ikon, { backgroundColor: t.bg }]}>
            <Ionicons name={t.ikon} size={20} color={t.fg} />
          </View>
          <View style={styles.teks}>
            <Text style={styles.judul} numberOfLines={1}>{tampil.judul}</Text>
            <Text style={styles.pesan} numberOfLines={2}>{tampil.pesan}</Text>
            <Text style={styles.detail}>Lihat detail ›</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutup"
          hitSlop={8}
          onPress={sembunyikan}
          style={styles.tutup}
        >
          <Ionicons name="close" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wadah: {
    position: "absolute", left: 12, right: 12, zIndex: 998, elevation: 998,
    alignItems: "center",
  },
  kartu: {
    width: "100%", maxWidth: 480, flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.primary, padding: 12,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  isiBox: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  ditekan: { opacity: 0.85 },
  ikon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  teks: { flex: 1, gap: 2 },
  judul: { fontSize: 14, fontWeight: "800", color: colors.ink },
  pesan: { fontSize: 13, lineHeight: 18, color: colors.ink },
  detail: { fontSize: 12, fontWeight: "800", color: colors.primary, marginTop: 2 },
  tutup: { padding: 4 },
});
