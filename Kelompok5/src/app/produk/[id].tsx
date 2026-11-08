import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton }   from "@/components/app-button";
import { EmptyState }  from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { QtyStepper }  from "@/components/qty-stepper";
import { ScreenHeader } from "@/components/screen-header";
import { colors, radius } from "@/constants/palette";
import { useCart } from "@/context/cart";
import { formatRupiah, type Product } from "@/data/products";
import { fetchProducts } from "@/services/productService";

export default function ProdukDetailScreen() {
  const router       = useRouter();
  const { id }       = useLocalSearchParams<{ id: string }>();
  const { add, count } = useCart();
  const [qty, setQty] = useState(1);

  // ── Fetch produk dari Supabase ────────────────────────────────────────────
  const [product,  setProduct]  = useState<Product | null>(null);
  const [related,  setRelated]  = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const all = await fetchProducts();
        const found = all.find((p) => p.id === id) ?? null;
        setProduct(found);
        if (found) {
          setRelated(
            all
              .filter((p) => p.category === found.category && p.id !== id && p.isActive !== false)
              .slice(0, 6),
          );
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Cart button (kanan header) ────────────────────────────────────────────
  const cartButton = (
    <Pressable
      style={styles.cartBtn}
      onPress={() => router.push("/keranjang")}
      accessibilityLabel="Buka keranjang"
    >
      <Ionicons name="cart-outline" size={22} color={colors.ink} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </Pressable>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScreenHeader title="Detail Produk" back right={cartButton} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat produk...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScreenHeader title="Detail Produk" back />
        <EmptyState
          icon="help-circle-outline"
          title="Produk tidak ditemukan"
          message="Produk ini mungkin sudah dihapus atau tidak aktif."
          actionLabel="Kembali ke katalog"
          onAction={() => router.replace("/dashboard")}
        />
      </SafeAreaView>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const soldOut   = product.stock <= 0;
  const lowStock  = !soldOut && product.stock <= 5;
  const stockColor = soldOut ? colors.danger : lowStock ? colors.warning : colors.primary;
  const stockLabel = soldOut
    ? "Stok habis"
    : lowStock
    ? `Stok menipis · ${product.stock}`
    : `Stok tersedia · ${product.stock}`;

  function addToCart() {
    add(product!, qty);
    const msg = `${qty} × ${product!.name} masuk ke keranjang.`;
    if (Platform.OS === "web") window.alert(msg);
    else
      Alert.alert("Ditambahkan", msg, [
        { text: "Lanjut belanja", style: "cancel" },
        { text: "Lihat keranjang", onPress: () => router.push("/keranjang") },
      ]);
  }

  // ── Gambar: foto dari Storage jika ada, fallback ke aset lokal ────────────
  const heroContent = product.fotoUrl ? (
    <Image source={{ uri: product.fotoUrl }} style={styles.heroImg} resizeMode="cover" />
  ) : (
    <Image source={product.image} style={styles.heroImg} resizeMode="contain" />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Detail Produk"
        subtitle={product.category}
        back
        right={cartButton}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero foto */}
        <View style={[styles.hero, product.fotoUrl && styles.heroCover]}>
          {heroContent}
        </View>

        {/* Info utama */}
        <View style={styles.card}>
          <Text style={styles.sub}>{product.sub}</Text>
          <Text style={styles.name}>{product.name}</Text>
          {product.rating > 0 && (
            <View style={styles.metaRow}>
              <Ionicons name="star" size={14} color={colors.star} />
              <Text style={styles.rating}>{product.rating}</Text>
              <Text style={styles.reviews}>({product.reviews} ulasan)</Text>
            </View>
          )}
          <Text style={styles.price}>{formatRupiah(product.price)}</Text>
          <View style={[styles.stockPill, { borderColor: stockColor }]}>
            <Ionicons
              name={soldOut ? "close-circle" : "checkmark-circle"}
              size={14}
              color={stockColor}
            />
            <Text style={[styles.stockText, { color: stockColor }]}>{stockLabel}</Text>
          </View>
        </View>

        {/* Deskripsi */}
        {product.description ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Deskripsi</Text>
            <Text style={styles.body}>{product.description}</Text>
          </View>
        ) : null}

        {/* Spesifikasi */}
        <View style={styles.card}>
          <Text style={styles.heading}>Spesifikasi</Text>
          {[
            ["Kategori", product.category],
            ["Jenis", product.sub],
            ...(product.rating > 0 ? [["Rating", `${product.rating} / 5`]] : []),
          ].map(([k, v]) => (
            <View key={k} style={styles.specRow}>
              <Text style={styles.specKey}>{k}</Text>
              <Text style={styles.specVal}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Produk serupa */}
        {related.length > 0 && (
          <View>
            <Text style={[styles.heading, styles.relatedTitle]}>Produk Serupa</Text>
            <FlatList
              horizontal
              data={related}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  style={styles.relatedCard}
                  onPress={() =>
                    router.push({ pathname: "/produk/[id]", params: { id: item.id } })
                  }
                />
              )}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <QtyStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
        <AppButton
          label={soldOut ? "Stok habis" : "Tambah ke Keranjang"}
          icon="cart"
          disabled={soldOut}
          onPress={addToCart}
          style={styles.footerBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: 14, paddingBottom: 24, gap: 12 },
  center:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 13, color: colors.muted },

  cartBtn: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.bg,
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    position: "absolute", top: -4, right: -4, backgroundColor: colors.danger,
    borderRadius: 8, minWidth: 16, height: 16, paddingHorizontal: 3,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: "800" },

  hero: {
    height: 240, backgroundColor: colors.tint, borderRadius: radius.lg,
    alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden",
  },
  heroCover: { padding: 0 },   // foto dari Storage: full cover tanpa padding
  heroImg: { width: "100%", height: "100%" },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, gap: 6,
  },
  sub:     { fontSize: 12, color: colors.placeholder },
  name:    { fontSize: 22, fontWeight: "900", color: colors.ink },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating:  { fontSize: 13, fontWeight: "800", color: colors.star },
  reviews: { fontSize: 12, color: colors.muted },
  price:   { fontSize: 24, fontWeight: "900", color: colors.primary, marginTop: 4 },
  stockPill: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4,
  },
  stockText: { fontSize: 12, fontWeight: "700" },

  heading: { fontSize: 15, fontWeight: "800", color: colors.ink },
  body:    { fontSize: 13, color: colors.muted, lineHeight: 20 },
  specRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border,
  },
  specKey: { fontSize: 13, color: colors.muted },
  specVal: { fontSize: 13, fontWeight: "700", color: colors.ink },

  relatedTitle: { marginBottom: 10 },
  relatedList:  { gap: 10 },
  relatedCard:  { width: 160 },

  footer: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerBtn: { flex: 1 },
});
