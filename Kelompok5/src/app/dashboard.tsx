import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "@/components/bottom-nav";
import { BrandLogo } from "@/components/brand-logo";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import { useCart } from "@/context/cart";
import { CATEGORIES, CATEGORY_IMAGES, PRODUCTS, type Product } from "@/data/products";

const TOP_RATED = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);

export default function DashboardScreen() {
  const router = useRouter();
  const { add } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Semua");

  const filtered = useMemo(
    () =>
      PRODUCTS.filter((p) => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        return matchSearch && (category === "Semua" || p.category === category);
      }),
    [search, category],
  );

  const openDetail = (p: Product) => router.push({ pathname: "/produk/[id]", params: { id: p.id } });

  const listHeader = (
    <View>
      <View style={styles.banner}>
        <View style={styles.bannerText}>
          <Text style={styles.bannerEye}>POD SYSTEM</Text>
          <Text style={styles.bannerTitle}>{"RASA LEBIH\nNIKMAT"}</Text>
          <Pressable style={styles.bannerBtn} onPress={() => setCategory("Pod")}>
            <Text style={styles.bannerBtnText}>Belanja Sekarang</Text>
          </Pressable>
        </View>
        <Ionicons name="cloud-outline" size={72} color="rgba(125,204,164,0.45)" />
      </View>

      <FlatList
        horizontal
        data={["Semua", ...CATEGORIES]}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        style={styles.catFlat}
        renderItem={({ item }) => {
          const active = category === item;
          return (
            <Pressable style={styles.catItem} onPress={() => setCategory(item)}>
              <View style={[styles.catIcon, active && styles.catIconActive]}>
                {item === "Semua" ? (
                  <Ionicons name="grid" size={22} color={active ? colors.white : colors.primary} />
                ) : (
                  <Image source={CATEGORY_IMAGES[item as keyof typeof CATEGORY_IMAGES]} style={styles.catImg} resizeMode="contain" />
                )}
              </View>
              <Text style={[styles.catName, active && styles.catNameActive]}>{item}</Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{category === "Semua" ? "Semua Produk" : `Kategori ${category}`}</Text>
        <Text style={styles.count}>{filtered.length} produk</Text>
      </View>
    </View>
  );

  const showPicks = category === "Semua" && search.trim() === "";
  const listFooter = showPicks ? (
    <View>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Produk Pilihan</Text>
        <Text style={styles.count}>Rating tertinggi</Text>
      </View>
      <FlatList
        horizontal
        data={TOP_RATED}
        keyExtractor={(p) => "pick-" + p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pickList}
        renderItem={({ item }) => (
          <ProductCard product={item} style={styles.pickCard} onPress={() => openDetail(item)} onAdd={() => add(item.id)} />
        )}
      />
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <BrandLogo />
        <Pressable style={styles.loginBtn} onPress={() => router.push("/pelanggan/login")} accessibilityLabel="Masuk">
          <Ionicons name="person" size={18} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari produk, kategori, atau merek..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="Produk tidak ditemukan"
            message="Coba kata kunci atau kategori lain."
            actionLabel="Reset pencarian"
            onAction={() => {
              setSearch("");
              setCategory("Semua");
            }}
          />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} style={styles.gridCard} onPress={() => openDetail(item)} onAdd={() => add(item.id)} />
        )}
      />

      <BottomNav tabs={tabsForRole("pelanggan")} active="beranda" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  loginBtn: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  searchWrap: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  content: { padding: 14, paddingBottom: 24 },
  row: { justifyContent: "space-between", marginBottom: 12 },
  gridCard: { width: "48.5%" },
  banner: {
    borderRadius: 18, backgroundColor: "#073F2E", flexDirection: "row",
    alignItems: "center", padding: 20, marginBottom: 16, minHeight: 150,
  },
  bannerText: { flex: 1 },
  bannerEye: { color: "#7DCCA4", fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 },
  bannerTitle: { color: colors.white, fontSize: 26, fontWeight: "900", lineHeight: 30, marginBottom: 14 },
  bannerBtn: {
    alignSelf: "flex-start", backgroundColor: colors.primary,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  bannerBtnText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  catFlat: { flexGrow: 0 },
  catList: { gap: 10, paddingBottom: 16 },
  catItem: { alignItems: "center", gap: 6, width: 64 },
  catIcon: {
    width: 52, height: 52, borderRadius: radius.lg, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center", padding: 8,
  },
  catIconActive: { backgroundColor: colors.primary },
  catImg: { width: "100%", height: "100%" },
  catName: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  catNameActive: { color: colors.primary, fontWeight: "800" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.ink },
  count: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  pickList: { gap: 10, paddingBottom: 8 },
  pickCard: { width: 160 },
});
