
import { useState } from "react";
import {
  FlatList,
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
import ProductCard from "../components/ProductCard";

const GREEN = "#087F50";
const DARK = "#0F1F17";
const BG = "#F5F7F5";
const WHITE = "#FFFFFF";

const categories = [
  { name: "Pod", image: require("../../assets/images/Pod.png") },
  { name: "Mod", image: require("../../assets/images/Mod.png") },
  { name: "Liquid", image: require("../../assets/images/Liquid.png") },
  { name: "Coil", image: require("../../assets/images/Coil.png") },
  { name: "Aksesori", image: require("../../assets/images/Coil.png") },
];

const products = [
  {
    id: "1",
    name: "Uwell Caliburn G2",
    sub: "Pod System · Hitam",
    category: "Pod",
    price: 450000,
    rating: 4.9,
    reviews: 100,
    image: require("../../assets/images/Pod.png"),
  },
  {
    id: "2",
    name: "Vaporesso XROS 3",
    sub: "Pod System",
    category: "Mod",
    price: 550000,
    rating: 4.7,
    reviews: 99,
    image: require("../../assets/images/Mod.png"),
  },
  {
    id: "3",
    name: "Liquid Naked 100",
    sub: "Strawberry 60ml",
    category: "Liquid",
    price: 150000,
    rating: 4.8,
    reviews: 55,
    image: require("../../assets/images/Liquid.png"),
  },
  {
    id: "4",
    name: "Coil Geekvape",
    sub: "Pack 4",
    category: "Coil",
    price: 120000,
    rating: 4.6,
    reviews: 40,
    image: require("../../assets/images/Coil.png"),
  },
  {
    id: "5",
    name: "Voopoo Drag X",
    sub: "Mod",
    category: "Mod",
    price: 1200000,
    rating: 4.9,
    reviews: 76,
    image: require("../../assets/images/Mod.png"),
  },
  {
    id: "6",
    name: "Geekvape Aegis",
    sub: "Mod",
    category: "Mod",
    price: 1350000,
    rating: 4.8,
    reviews: 61,
    image: require("../../assets/images/Mod.png"),
  },
];

const NAV_TABS = [
  { name: "Beranda", icon: "⌂" },
  { name: "Kategori", icon: "▦" },
  { name: "Keranjang", icon: "🛒" },
  { name: "Pesanan", icon: "▤" },
  { name: "Profil", icon: "♙" },
];

type Product = (typeof products)[number];

export default function DashboardScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState("Beranda");
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = products.filter((product) => {
    const keyword = search.trim().toLowerCase();

    const matchSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.sub.toLowerCase().includes(keyword);

    const matchCategory =
      selectedCategory === "Semua" ||
      product.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const openProductDetail = (id: string) => {
    router.push({
      pathname: "/detail-produk",
      params: { id },
    });
  };

  const addToCart = () => {
    setCartCount((count) => count + 1);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <ProductCard
        id={item.id}
        name={item.name}
        sub={item.sub}
        price={item.price}
        rating={item.rating}
        reviews={item.reviews}
        image={item.image}
        onAddToCart={addToCart}
        onPress={() => openProductDetail(item.id)}
      />
    </View>
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("Semua");
  };

  const renderHeader = () => (
    <View>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk, kategori, atau merek..."
          placeholderTextColor="#91A198"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          accessibilityLabel="Cari produk"
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            accessibilityLabel="Hapus pencarian"
          >
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>VAPESTORE COLLECTION</Text>
          </View>

          <Text style={styles.bannerTitle}>
            TEMUKAN{"\n"}PILIHANMU
          </Text>

          <Text style={styles.bannerSubtitle}>
            Jelajahi koleksi produk kami
          </Text>

          <TouchableOpacity
            style={styles.bannerButton}
            onPress={resetFilters}
          >
            <Text style={styles.bannerButtonText}>Lihat Produk →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerDecoration}>
          <Text style={styles.bannerEmoji}>💨</Text>
          <View style={styles.decorationCircle} />
        </View>
      </View>

      <View style={styles.categoryHeading}>
        <Text style={styles.sectionTitle}>Kategori</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        <TouchableOpacity
          style={styles.categoryItem}
          onPress={() => setSelectedCategory("Semua")}
        >
          <View
            style={[
              styles.categoryIcon,
              selectedCategory === "Semua" && styles.categoryIconActive,
            ]}
          >
            <Text
              style={[
                styles.categoryEmoji,
                selectedCategory === "Semua" && styles.activeEmoji,
              ]}
            >
              ▦
            </Text>
          </View>

          <Text
            style={[
              styles.categoryName,
              selectedCategory === "Semua" && styles.categoryNameActive,
            ]}
          >
            Semua
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={styles.categoryItem}
            onPress={() => setSelectedCategory(category.name)}
          >
            <View
              style={[
                styles.categoryIcon,
                selectedCategory === category.name &&
                  styles.categoryIconActive,
              ]}
            >
              <Image
                source={category.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>

            <Text
              style={[
                styles.categoryName,
                selectedCategory === category.name &&
                  styles.categoryNameActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Produk Terbaru</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredProducts.length} produk ditemukan
          </Text>
        </View>

        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.seeAll}>Reset ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (selectedCategory !== "Semua" || search.trim() !== "") {
      return null;
    }

    const featuredProducts = [...products].reverse().slice(0, 4);

    return (
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Produk Pilihan</Text>
            <Text style={styles.sectionSubtitle}>
              Pilihan untuk kamu
            </Text>
          </View>

          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.seeAll}>Lihat Semua ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuredGrid}>
          {featuredProducts.map((product) => (
            <View
              key={`featured-${product.id}`}
              style={styles.featuredItem}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                sub={product.sub}
                price={product.price}
                rating={product.rating}
                reviews={product.reviews}
                image={product.image}
                onAddToCart={addToCart}
                onPress={() => openProductDetail(product.id)}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>V</Text>
          </View>

          <View>
            <Text style={styles.brandText}>
              Vape<Text style={styles.brandGreen}>Store</Text>
            </Text>
            <Text style={styles.brandSubtitle}>YOUR VAPE STORE</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSearch("")}
            accessibilityLabel="Pencarian"
          >
            <Text style={styles.headerButtonText}>⌕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setActiveTab("Pesanan")}
            accessibilityLabel="Notifikasi"
          >
            <Text style={styles.headerButtonText}>♧</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, styles.profileButton]}
            onPress={() => router.push("/pelanggan/login")}
            accessibilityLabel="Masuk akun"
          >
            <Text style={styles.profileButtonText}>♙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>⌕</Text>
            </View>

            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptyDescription}>
              Coba kata kunci atau kategori yang lain.
            </Text>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset Pencarian</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
      />

      <View style={styles.bottomNav}>
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.navItem}
              onPress={() => {
                setActiveTab(tab.name);

                if (tab.name === "Beranda") {
                  router.replace("/dashboard");
                } else if (tab.name === "Profil") {
                  router.push("/pelanggan/login");
                } else if (tab.name === "Kategori") {
                  setSelectedCategory("Semua");
                }
              }}
            >
              <View style={styles.navIconContainer}>
                <Text
                  style={[
                    styles.navIcon,
                    isActive && styles.navIconActive,
                  ]}
                >
                  {tab.icon}
                </Text>

                {tab.name === "Keranjang" && cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartCount > 99 ? "99+" : cartCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.navLabel,
                  isActive && styles.navLabelActive,
                ]}
              >
                {tab.name}
              </Text>

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EEE9",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  logoBox: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#0B432E",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "900",
    color: WHITE,
  },
  brandText: {
    fontSize: 21,
    fontWeight: "900",
    color: DARK,
    letterSpacing: -0.6,
  },
  brandGreen: {
    color: GREEN,
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#809187",
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  headerButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F2",
  },
  headerButtonText: {
    color: DARK,
    fontSize: 22,
    fontWeight: "600",
  },
  profileButton: {
    backgroundColor: GREEN,
  },
  profileButtonText: {
    fontSize: 20,
    color: WHITE,
  },

  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
    flexGrow: 1,
  },
  productRow: {
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 10,
    marginBottom: 12,
  },
  productItem: {
    flex: 1,
    minWidth: 0,
  },

  searchBox: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E0E8E2",
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 25,
    color: GREEN,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: DARK,
    paddingVertical: 0,
  },
  clearSearch: {
    color: GREEN,
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: 4,
  },

  banner: {
    minHeight: 172,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 19,
    backgroundColor: "#0B432E",
    marginBottom: 23,
    paddingVertical: 19,
    paddingLeft: 19,
    paddingRight: 10,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTag: {
    alignSelf: "flex-start",
    backgroundColor: "#205E43",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 9,
  },
  bannerTagText: {
    color: "#BCE8D0",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bannerTitle: {
    color: WHITE,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    color: "#C7DED2",
    fontSize: 10,
    marginTop: 7,
    marginBottom: 13,
  },
  bannerButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: GREEN,
  },
  bannerButtonText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: "800",
  },
  bannerDecoration: {
    width: 84,
    height: 125,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerEmoji: {
    fontSize: 57,
    opacity: 0.9,
    zIndex: 1,
  },
  decorationCircle: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    right: -33,
    top: 5,
    backgroundColor: "#1C6346",
  },

  categoryHeading: {
    marginBottom: 12,
  },
  categoryList: {
    gap: 13,
    paddingBottom: 23,
  },
  categoryItem: {
    width: 61,
    alignItems: "center",
    gap: 7,
  },
  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E8F2EB",
    borderWidth: 1,
    borderColor: "#E1EBE3",
    alignItems: "center",
    justifyContent: "center",
    padding: 9,
  },
  categoryIconActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryEmoji: {
    fontSize: 25,
    color: "#60766A",
  },
  activeEmoji: {
    color: WHITE,
  },
  categoryName: {
    color: "#74847A",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  categoryNameActive: {
    color: GREEN,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: DARK,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: "#829087",
    marginTop: 4,
  },
  seeAll: {
    fontSize: 11,
    fontWeight: "800",
    color: GREEN,
  },

  // PRODUK PILIHAN
  featuredSection: {
    marginTop: 12,
    paddingTop: 6,
  },
  featuredGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "stretch",
    rowGap: 14,
  },
  featuredItem: {
    width: "48%",
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 2,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 42,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#E8F2EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyIcon: {
    fontSize: 36,
    color: GREEN,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
  },
  emptyDescription: {
    fontSize: 12,
    color: "#849188",
    textAlign: "center",
    marginTop: 7,
    marginBottom: 18,
  },
  resetButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  resetButtonText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "800",
  },

  bottomNav: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: "#E5EBE6",
    paddingTop: 8,
    paddingBottom: 5,
    paddingHorizontal: 3,
  },
  navItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    position: "relative",
    paddingTop: 2,
  },
  navIconContainer: {
    minHeight: 25,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 21,
    color: "#89988F",
  },
  navIconActive: {
    color: GREEN,
  },
  navLabel: {
    fontSize: 9,
    color: "#89988F",
    fontWeight: "600",
    textAlign: "center",
  },
  navLabelActive: {
    color: GREEN,
    fontWeight: "900",
  },
  activeIndicator: {
    width: 17,
    height: 3,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginTop: 2,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: "#E34C4C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: WHITE,
  },
  cartBadgeText: {
    color: WHITE,
    fontSize: 8,
    fontWeight: "900",
  },
});
