/**
 * admin/rekomendasi.tsx
 * Halaman admin — Status Model AI & Rekomendasi Produk.
 *
 * Menampilkan:
 *   • Statistik model (metrics.json): P@5, R@5, n_users, data_source
 *   • Jumlah interaksi (data latih), user direkomendasikan, produk populer
 *   • Produk populer (cold-start fallback)
 *   • Panduan singkat cara update model
 *
 * Tidak memuat model TFLite langsung — model dijalankan offline
 * via train.py + buat_rekomendasi.py, hasilnya disimpan ke Supabase.
 */

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole } from "@/constants/navigation";
import { colors, font, radius, spacing } from "@/constants/palette";
import {
  fetchProdukPopuler,
  fetchStatistikAI,
  type ProdukPopuler,
  type StatistikAI,
} from "@/services/aiService";
import { fetchProducts } from "@/services/productService";
import type { Product } from "@/data/products";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function persen(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

type KartuStatProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  nilai: string;
  sub?: string;
};

function KartuStat({ icon, iconColor, iconBg, label, nilai, sub }: KartuStatProps) {
  return (
    <View style={[s.kartuStat, { backgroundColor: iconBg + "55" }]}>
      <View style={[s.kartuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={s.kartuNilai}>{nilai}</Text>
      <Text style={s.kartuLabel}>{label}</Text>
      {sub ? <Text style={s.kartuSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminRekomendasiScreen() {
  const [stat, setStat] = useState<StatistikAI | null>(null);
  const [populer, setPopuler] = useState<ProdukPopuler[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    setLoading(true);
    setGalat(null);
    try {
      const [s, pop, prods] = await Promise.all([
        fetchStatistikAI(),
        fetchProdukPopuler(),
        fetchProducts(),
      ]);
      setStat(s);
      setPopuler(pop);
      setProducts(prods);
    } catch (e: unknown) {
      setGalat(e instanceof Error ? e.message : "Gagal memuat data AI");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Cocokkan item_id ke nama produk
  function namaProduk(itemId: string) {
    const p = products.find((pr) => pr.id === itemId);
    return p?.name ?? itemId;
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Model AI" subtitle="Rekomendasi Produk Personal" />

      {loading ? (
        <View style={s.tengah}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Memuat data model…</Text>
        </View>
      ) : galat ? (
        <View style={s.tengah}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
          <Text style={s.galatText}>{galat}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={muat} />
          }
        >
          {/* ── Status model ── */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
              <Text style={s.sectionTitle}>Status Model</Text>
              <View
                style={[
                  s.badge,
                  {
                    backgroundColor: stat?.metricsAda
                      ? colors.primarySoft
                      : colors.dangerSoft,
                  },
                ]}
              >
                <Text
                  style={[
                    s.badgeText,
                    {
                      color: stat?.metricsAda ? colors.primary : colors.danger,
                    },
                  ]}
                >
                  {stat?.metricsAda ? "Aktif" : "Belum Dilatih"}
                </Text>
              </View>
            </View>

            {stat?.metricsAda && stat.metrics ? (
              <>
                {/* Badge sumber data */}
                <View
                  style={[
                    s.sumberBadge,
                    {
                      backgroundColor: stat.dataReal
                        ? colors.primarySoft
                        : colors.warningSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name={stat.dataReal ? "checkmark-circle-outline" : "warning-outline"}
                    size={14}
                    color={stat.dataReal ? colors.primary : colors.warning}
                  />
                  <Text
                    style={[
                      s.sumberText,
                      { color: stat.dataReal ? colors.primary : colors.warning },
                    ]}
                  >
                    {stat.dataReal
                      ? `Data real · ${stat.metrics.data_source}`
                      : "Data sintetis — latih ulang dengan data nyata untuk UAS"}
                  </Text>
                </View>

                {/* Grid metrik */}
                <View style={s.gridDua}>
                  <KartuStat
                    icon="trophy-outline"
                    iconColor={colors.primary}
                    iconBg={colors.primarySoft}
                    label="Precision@5"
                    nilai={persen(stat.metrics["precision@5"])}
                    sub="Relevansi top-5 rekomendasi"
                  />
                  <KartuStat
                    icon="refresh-outline"
                    iconColor="#1D5FB8"
                    iconBg="#EAF3FF"
                    label="Recall@5"
                    nilai={persen(stat.metrics["recall@5"])}
                    sub="Cakupan item relevan"
                  />
                  <KartuStat
                    icon="people-outline"
                    iconColor="#7B5EA7"
                    iconBg="#F0EEF9"
                    label="User diuji"
                    nilai={String(stat.metrics.n_test_users)}
                    sub="Saat evaluasi model"
                  />
                  <KartuStat
                    icon="cube-outline"
                    iconColor={colors.warning}
                    iconBg={colors.warningSoft}
                    label="Item dikenal"
                    nilai={String(stat.metrics.n_items)}
                    sub={`dari ${stat.metrics.n_users} user latih`}
                  />
                </View>

                <Text style={s.penjelasan}>
                  <Text style={{ fontWeight: "800" }}>Cara baca: </Text>
                  Precision@5 = rata-rata berapa produk yang benar-benar relevan
                  di antara 5 rekomendasi teratas. Recall@5 = berapa item relevan
                  yang berhasil ditemukan. Angka ini dari data uji — semakin
                  tinggi semakin baik.
                </Text>
              </>
            ) : (
              <View style={s.belumDilatih}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.muted}
                />
                <Text style={s.belumDilatihText}>
                  File{" "}
                  <Text style={{ fontWeight: "800" }}>assets/ai/metrics.json</Text>{" "}
                  belum ada. Jalankan{" "}
                  <Text style={{ fontWeight: "800" }}>
                    python k5_recommender/train.py --data data.csv
                  </Text>{" "}
                  di laptop, lalu salin{" "}
                  <Text style={{ fontWeight: "800" }}>
                    model.tflite
                  </Text>{" "}
                  dan{" "}
                  <Text style={{ fontWeight: "800" }}>metrics.json</Text> ke{" "}
                  <Text style={{ fontWeight: "800" }}>assets/ai/</Text>.
                </Text>
              </View>
            )}
          </View>

          {/* ── Statistik data ── */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="stats-chart-outline" size={18} color={colors.primary} />
              <Text style={s.sectionTitle}>Statistik Data</Text>
            </View>
            <View style={s.gridTiga}>
              <View style={[s.statKecil, { backgroundColor: "#EAF3FF" }]}>
                <Text style={[s.statKecilNilai, { color: "#1D5FB8" }]}>
                  {stat?.jumlahInteraksi.toLocaleString("id-ID") ?? "—"}
                </Text>
                <Text style={s.statKecilLabel}>Interaksi{"\n"}(data latih)</Text>
              </View>
              <View style={[s.statKecil, { backgroundColor: colors.primarySoft }]}>
                <Text style={[s.statKecilNilai, { color: colors.primary }]}>
                  {stat?.jumlahUserDirekomendasikan.toLocaleString("id-ID") ?? "—"}
                </Text>
                <Text style={s.statKecilLabel}>User{"\n"}direkomendasikan</Text>
              </View>
              <View style={[s.statKecil, { backgroundColor: colors.warningSoft }]}>
                <Text style={[s.statKecilNilai, { color: colors.warning }]}>
                  {stat?.jumlahProdukPopuler ?? "—"}
                </Text>
                <Text style={s.statKecilLabel}>Produk{"\n"}populer (fallback)</Text>
              </View>
            </View>
            <Text style={s.penjelasan}>
              User yang belum punya rekomendasi personal (cold-start) akan
              melihat{" "}
              <Text style={{ fontWeight: "800" }}>Produk Terpopuler</Text> di
              beranda. Setelah mereka berinteraksi (lihat/tambah keranjang/beli),
              data masuk ke tabel{" "}
              <Text style={{ fontWeight: "800" }}>interactions</Text> dan model
              bisa dilatih ulang.
            </Text>
          </View>

          {/* ── Produk populer (cold-start) ── */}
          {populer.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Ionicons name="flame-outline" size={18} color={colors.warning} />
                <Text style={s.sectionTitle}>Produk Terpopuler (Cold-Start)</Text>
              </View>
              <Text style={s.penjelasan}>
                Ditampilkan ke pelanggan baru yang belum punya riwayat interaksi.
              </Text>
              {populer.map((item, idx) => (
                <View key={item.itemId} style={s.populerRow}>
                  <View
                    style={[
                      s.rankBadge,
                      { backgroundColor: idx < 3 ? colors.primarySoft : colors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        s.rankText,
                        { color: idx < 3 ? colors.primary : colors.muted },
                      ]}
                    >
                      #{item.peringkat}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.populerNama} numberOfLines={1}>
                      {namaProduk(item.itemId)}
                    </Text>
                    <Text style={s.populerSub}>
                      {item.jumlahUser} user berinteraksi
                    </Text>
                  </View>
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={colors.muted}
                  />
                </View>
              ))}
            </View>
          )}

          {/* ── Panduan update model ── */}
          <View style={[s.section, { backgroundColor: colors.tint }]}>
            <View style={s.sectionHeader}>
              <Ionicons name="refresh-circle-outline" size={18} color={colors.primary} />
              <Text style={s.sectionTitle}>Cara Update Model</Text>
            </View>
            {[
              {
                no: "1",
                judul: "Kumpulkan data interaksi",
                detail:
                  "Export tabel interactions (user_id, item_id) ke k5_recommender/data.csv. Minimal 30 baris.",
              },
              {
                no: "2",
                judul: "Latih model",
                detail:
                  "Di laptop: python k5_recommender/train.py --data k5_recommender/data.csv",
              },
              {
                no: "3",
                judul: "Buat rekomendasi SQL",
                detail:
                  "python k5_recommender/buat_rekomendasi.py --data k5_recommender/data.csv\nHasilnya: k5_recommender/rekomendasi.sql",
              },
              {
                no: "4",
                judul: "Jalankan SQL di Supabase",
                detail:
                  "Tempel isi rekomendasi.sql di Supabase SQL Editor lalu klik Run. Tabel rekomendasi & produk_populer akan diperbarui.",
              },
              {
                no: "5",
                judul: "Salin metrics ke app",
                detail:
                  "Salin k5_recommender/metrics.json ke assets/ai/metrics.json, lalu build ulang app. Halaman ini akan menampilkan metrik baru.",
              },
            ].map((step) => (
              <View key={step.no} style={s.langkahRow}>
                <View style={s.langkahNo}>
                  <Text style={s.langkahNoText}>{step.no}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.langkahJudul}>{step.judul}</Text>
                  <Text style={s.langkahDetail}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <BottomNav tabs={tabsForRole("owner")} active="ai" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  tengah: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: spacing.xl,
  },
  loadingText: { fontSize: font.small, color: colors.muted },
  galatText: {
    fontSize: font.body,
    color: colors.danger,
    textAlign: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: 16,
  },

  // Section
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: font.heading,
    fontWeight: "800",
    color: colors.ink,
  },

  // Badge status
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: font.tiny, fontWeight: "800" },

  // Sumber data
  sumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.md,
    padding: 10,
  },
  sumberText: { flex: 1, fontSize: font.small, fontWeight: "600" },

  // Grid 2 kolom
  gridDua: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kartuStat: {
    width: "47%",
    flexGrow: 1,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kartuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  kartuNilai: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.ink,
  },
  kartuLabel: { fontSize: font.small, fontWeight: "700", color: colors.ink },
  kartuSub: { fontSize: font.tiny, color: colors.muted },

  // Grid 3 kolom
  gridTiga: { flexDirection: "row", gap: 8 },
  statKecil: {
    flex: 1,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statKecilNilai: { fontSize: 20, fontWeight: "900" },
  statKecilLabel: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },

  // Belum dilatih
  belumDilatih: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "flex-start",
  },
  belumDilatihText: {
    flex: 1,
    fontSize: font.small,
    color: colors.muted,
    lineHeight: 20,
  },

  // Penjelasan
  penjelasan: {
    fontSize: font.small,
    color: colors.muted,
    lineHeight: 20,
  },

  // Produk populer
  populerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: font.small, fontWeight: "900" },
  populerNama: { fontSize: font.body, fontWeight: "700", color: colors.ink },
  populerSub: { fontSize: font.tiny, color: colors.muted },

  // Langkah panduan
  langkahRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 6,
  },
  langkahNo: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  langkahNoText: { color: colors.white, fontSize: font.small, fontWeight: "900" },
  langkahJudul: {
    fontSize: font.body,
    fontWeight: "800",
    color: colors.ink,
  },
  langkahDetail: {
    fontSize: font.small,
    color: colors.muted,
    lineHeight: 18,
  },
});
