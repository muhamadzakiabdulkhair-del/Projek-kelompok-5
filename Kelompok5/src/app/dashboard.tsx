import { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const GREEN = "#087F50";
const DARK = "#0F1F17";
const BG = "#F5F7F5";
const HEADER_BG = "#FFFFFF";

const categories = [
  { name: "Pod",      icon: "💨", image: require("../../assets/images/Pod.png") },
  { name: "Mod",      icon: "⚡", image: require("../../assets/images/Mod.png") },
  { name: "Liquid",   icon: "💧", image: require("../../assets/images/Liquid.png") },
  { name: "Coil",     icon: "🔩", image: require("../../assets/images/Coil.png") },
  { name: "Aksesori", icon: "🎒", image: require("../../assets/images/Coil.png") },
];

const products = [
  { id: "1", name: "Uwell Caliburn G2", sub: "Pod System · Hitam", category: "Pod", price: 450000, rating: 4.9, reviews: 100, image: require("../../assets/images/Pod.png") },
  { id: "2", name: "Vaporesso XROS 3",  sub: "Pod System",         category: "Mod", price: 550000, rating: 4.7, reviews: 99,  image: require("../../assets/images/Mod.png") },
  { id: "3", name: "Liquid Naked 100",  sub: "Strawberry 60ml",    category: "Liquid", price: 150000, rating: 4.8, reviews: 55, image: require("../../assets/images/Liquid.png") },
  { id: "4", name: "Coil Geekvape",     sub: "Pack 4",             category: "Coil", price: 120000, rating: 4.6, reviews: 40, image: require("../../assets/images/Coil.png") },
  { id: "5", name: "Voopoo Drag X",     sub: "Mod",                category: "Mod", price: 1200000, rating: 4.9, reviews: 76, image: require("../../assets/images/Mod.png") },
  { id: "6", name: "Geekvape Aegis",    sub: "Mod",                category: "Mod", price: 1350000, rating: 4.8, reviews: 61, image: require("../../assets/images/Mod.png") },
];

function formatRupiah(price: number) {
  return "Rp " + price.toLocaleString("id-ID");
}

const NAV_TABS = [
  { name: "Beranda",  icon: "🏠" },
  { name: "Kategori", icon: "🗂" },
  { name: "Keranjang",icon: "🛒" },
  { name: "Pesanan",  icon: "📋" },
  { name: "Profil",   icon: "👤" },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState("Beranda");
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.brandRow}>
          <View style={s.logoBox}>
            <Text style={s.logoFire}>🔥</Text>
          </View>
          <Text style={s.brandText}>
            Vape<Text style={s.brandGreen}>Store</Text>
          </Text>
        </View>
        <View style={s.headerIcons}>
          <TouchableOpacity style={s.iconBtn}>
            <Text style={s.iconBtnText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Text style={s.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.iconBtn, s.loginIconBtn]}
            onPress={() => router.push("/pelanggan/login")}
          >
            <Text style={s.iconBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── SEARCH ── */}
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Cari produk, kategori, atau merek..."
            placeholderTextColor="#9AAEA4"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── BANNER ── */}
        <View style={s.banner}>
          <View style={s.bannerContent}>
            <Text style={s.bannerEye}>POD SYSTEM</Text>
            <Text style={s.bannerTitle}>RASA LEBIH{"\n"}NIKMAT</Text>
            <TouchableOpacity style={s.bannerBtn}>
              <Text style={s.bannerBtnText}>Belanja Sekarang</Text>
            </TouchableOpacity>
          </View>
          <View style={s.bannerDeco}>
            <Text style={s.bannerDecoText}>💨</Text>
          </View>
        </View>

        {/* ── KATEGORI ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catList}>
          <TouchableOpacity
            style={s.catItem}
            onPress={() => setSelectedCategory("Semua")}
          >
            <View style={[s.catIcon, selectedCategory === "Semua" && s.catIconActive]}>
              <Text style={s.catEmoji}>🗂</Text>
            </View>
            <Text style={[s.catName, selectedCategory === "Semua" && s.catNameActive]}>Semua</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.name}
              style={s.catItem}
              onPress={() => setSelectedCategory(c.name)}
            >
              <View style={[s.catIcon, selectedCategory === c.name && s.catIconActive]}>
                <Image source={c.image} style={s.catImg} resizeMode="contain" />
              </View>
              <Text style={[s.catName, selectedCategory === c.name && s.catNameActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── PRODUK TERBARU ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Produk Terbaru</Text>
          <TouchableOpacity onPress={() => setSelectedCategory("Semua")}>
            <Text style={s.seeAll}>Lihat Semua &rsaquo;</Text>
          </TouchableOpacity>
        </View>

        <View style={s.grid}>
          {filteredProducts.map((p) => (
            <View key={p.id} style={s.card}>
              <View style={s.cardImgWrap}>
                <Image source={p.image} style={s.cardImg} resizeMode="contain" />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardSub}>{p.sub}</Text>
                <Text style={s.cardName} numberOfLines={2}>{p.name}</Text>
                <View style={s.ratingRow}>
                  <Text style={s.ratingText}>⭐ {p.rating}</Text>
                  <Text style={s.reviewText}>({p.reviews})</Text>
                </View>
                <Text style={s.cardPrice}>{formatRupiah(p.price)}</Text>
                <TouchableOpacity
                  style={s.addBtn}
                  onPress={() => setCartCount((n) => n + 1)}
                >
                  <Text style={s.addBtnText}>🛒</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Produk tidak ditemukan</Text>
            <TouchableOpacity onPress={() => { setSearch(""); setSelectedCategory("Semua"); }}>
              <Text style={s.seeAll}>Reset Pencarian</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PRODUK PILIHAN ── */}
        {selectedCategory === "Semua" && search === "" && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Produk Pilihan</Text>
              <Text style={s.seeAll}>Lihat Semua &rsaquo;</Text>
            </View>
            <View style={s.grid}>
              {[...products].reverse().slice(0, 4).map((p) => (
                <View key={"pick-" + p.id} style={s.card}>
                  <View style={s.cardImgWrap}>
                    <Image source={p.image} style={s.cardImg} resizeMode="contain" />
                  </View>
                  <View style={s.cardBody}>
                    <Text style={s.cardSub}>{p.sub}</Text>
                    <Text style={s.cardName} numberOfLines={2}>{p.name}</Text>
                    <View style={s.ratingRow}>
                      <Text style={s.ratingText}>⭐ {p.rating}</Text>
                      <Text style={s.reviewText}>({p.reviews})</Text>
                    </View>
                    <Text style={s.cardPrice}>{formatRupiah(p.price)}</Text>
                    <TouchableOpacity style={s.addBtn} onPress={() => setCartCount((n) => n + 1)}>
                      <Text style={s.addBtnText}>🛒</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={s.bottomNav}>
        {NAV_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={s.navItem}
            onPress={() => setActiveTab(tab.name)}
          >
            <Text style={s.navIcon}>{tab.icon}</Text>
            <Text style={[s.navLabel, activeTab === tab.name && s.navLabelActive]}>
              {tab.name}
            </Text>
            {tab.name === "Keranjang" && cartCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: HEADER_BG,
    borderBottomWidth: 1, borderBottomColor: "#E8EEE8",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#0F3D25",
    alignItems: "center", justifyContent: "center",
  },
  logoFire: { fontSize: 20 },
  brandText: { fontSize: 22, fontWeight: "900", color: DARK },
  brandGreen: { color: GREEN },
  headerIcons: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#F0F5F0",
    alignItems: "center", justifyContent: "center",
  },
  loginIconBtn: {
    backgroundColor: "#087F50",
  },
  iconBtnText: { fontSize: 18 },
  content: { padding: 14, paddingBottom: 20 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12, borderWidth: 1, borderColor: "#DDE8E2",
    paddingHorizontal: 12, marginBottom: 14, height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: DARK },
  searchClear: { color: GREEN, fontSize: 14, paddingHorizontal: 4 },
  banner: {
    borderRadius: 18, backgroundColor: "#073F2E",
    overflow: "hidden", flexDirection: "row",
    alignItems: "center", padding: 20, marginBottom: 18, minHeight: 160,
  },
  bannerContent: { flex: 1 },
  bannerEye: { color: "#7DCCA4", fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 },
  bannerTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", lineHeight: 30, marginBottom: 14 },
  bannerBtn: {
    alignSelf: "flex-start", backgroundColor: GREEN,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  bannerBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  bannerDeco: { width: 80, alignItems: "center", justifyContent: "center" },
  bannerDecoText: { fontSize: 64, opacity: 0.4 },
  catList: { gap: 10, paddingBottom: 18 },
  catItem: { alignItems: "center", gap: 6, width: 64 },
  catIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "#E8F4EE",
    alignItems: "center", justifyContent: "center", padding: 8,
  },
  catIconActive: { backgroundColor: GREEN },
  catEmoji: { fontSize: 22 },
  catImg: { width: "100%", height: "100%" },
  catName: { fontSize: 11, color: "#6A7E72", fontWeight: "600", textAlign: "center" },
  catNameActive: { color: GREEN, fontWeight: "800" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: DARK },
  seeAll: { fontSize: 12, color: GREEN, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  card: {
    width: "48%" as any, flexGrow: 1, flexBasis: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16, borderWidth: 1, borderColor: "#E8EEE8",
    overflow: "hidden",
  },
  cardImgWrap: {
    height: 140, backgroundColor: "#EDF5F0",
    alignItems: "center", justifyContent: "center", padding: 12,
  },
  cardImg: { width: "100%", height: "100%" },
  cardBody: { padding: 10 },
  cardSub: { fontSize: 10, color: "#8A9E94", marginBottom: 3 },
  cardName: { fontSize: 13, fontWeight: "700", color: DARK, marginBottom: 4, minHeight: 34 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  ratingText: { fontSize: 11, color: "#F0A500", fontWeight: "700" },
  reviewText: { fontSize: 10, color: "#9AAEA4" },
  cardPrice: { fontSize: 14, fontWeight: "800", color: GREEN, marginBottom: 8 },
  addBtn: {
    backgroundColor: GREEN, borderRadius: 8,
    paddingVertical: 8, alignItems: "center",
  },
  addBtnText: { fontSize: 16 },
  empty: { alignItems: "center", padding: 32, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: DARK },
  bottomNav: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#E8EEE8",
    paddingVertical: 8, paddingHorizontal: 4,
  },
  navItem: { flex: 1, alignItems: "center", gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: "#9AAEA4", fontWeight: "600" },
  navLabelActive: { color: GREEN, fontWeight: "800" },
  badge: {
    position: "absolute", top: -2, right: 6,
    backgroundColor: "#E34C4C", borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
});
