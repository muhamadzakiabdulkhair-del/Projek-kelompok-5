import { useState } from "react";
import { Redirect } from "expo-router";
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
const DARK = "#16352A";
const LIGHT_GREEN = "#E5F4EC";
const BG = "#F7F9F7";

// Kategori produk menggunakan empat gambar yang tersedia
const categories = [
  { name: "Pod", image: require("../../assets/images/Pod.png") },
  { name: "Mod", image: require("../../assets/images/Mod.png") },
  { name: "Liquid", image: require("../../assets/images/Liquid.png") },
  { name: "Coil", image: require("../../assets/images/Coil.png") },
  { name: "Aksesori", image: require("../../assets/images/Coil.png") },
];

// Data produk sementara
const products = [
  {
    id: "1",
    name: "Uwell Caliburn G2",
    category: "Pod",
    price: 450000,
    image: require("../../assets/images/Pod.png"),
    color: "#DCE8E1",
  },
  {
    id: "2",
    name: "Vaporesso XROS 3",
    category: "Mod",
    price: 550000,
    image: require("../../assets/images/Mod.png"),
    color: "#E7E1D8",
  },
  {
    id: "3",
    name: "Liquid Strawberry",
    category: "Liquid",
    price: 150000,
    image: require("../../assets/images/Liquid.png"),
    color: "#F3E2DF",
  },
  {
    id: "4",
    name: "Coil Replacement",
    category: "Coil",
    price: 120000,
    image: require("../../assets/images/Coil.png"),
    color: "#E5E6F0",
  },
];

function formatRupiah(price: number) {
  return "Rp " + price.toLocaleString("id-ID");
}

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState("Beranda");
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>V</Text>
          </View>

          <Text style={styles.brandText}>
            Vape<Text style={styles.brandAccent}>Store</Text>
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.manageHeaderButton}
            onPress={() => router.push("/kelola-produk")}
          >
            <Text style={styles.manageHeaderButtonText}>Kelola</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setActiveTab("Pesanan")}
          >
            <Text style={styles.headerIcon}>♧</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setActiveTab("Keranjang")}
          >
            <Text style={styles.headerIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* PENCARIAN */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk atau kategori..."
            placeholderTextColor="#89958E"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BANNER TANPA GAMBAR TAMBAHAN */}
        <View style={styles.banner}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerEyebrow}>SELAMAT DATANG DI</Text>

            <Text style={styles.bannerTitle}>VapeStore</Text>

            <Text style={styles.bannerDescription}>
              Temukan produk dan aksesori pilihan.
            </Text>

            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => {
                setSelectedCategory("Semua");
                setSearch("");
              }}
            >
              <Text style={styles.bannerButtonText}>Jelajahi Katalog →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bannerDecoration}>
            <Text style={styles.bannerLetter}>V</Text>
          </View>
        </View>

        {/* KATEGORI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategori Produk</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === "Semua" && styles.categorySelected,
            ]}
            onPress={() => setSelectedCategory("Semua")}
          >
            <View style={styles.categoryIcon}>
              <Text style={styles.allCategoryIcon}>▦</Text>
            </View>

            <Text style={styles.categoryName}>Semua</Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryItem,
                selectedCategory === category.name && styles.categorySelected,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <View style={styles.categoryIcon}>
                <Image
                  source={category.image}
                  style={styles.categoryImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PRODUK PILIHAN */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Produk Pilihan</Text>

          <TouchableOpacity
            onPress={() => {
              setSelectedCategory("Semua");
              setSearch("");
            }}
          >
            <Text style={styles.seeAll}>Lihat Semua →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View
                style={[
                  styles.productImage,
                  { backgroundColor: product.color },
                ]}
              >
                <Image
                  source={product.image}
                  style={styles.productPhoto}
                  resizeMode="contain"
                />

                <View style={styles.productTag}>
                  <Text style={styles.productTagText}>Produk</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{product.category}</Text>

                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>

                <Text style={styles.productPrice}>
                  {formatRupiah(product.price)}
                </Text>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setCartCount((count) => count + 1)}
                >
                  <Text style={styles.addButtonText}>
                    + Tambah ke Keranjang
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>

            <Text style={styles.emptyDescription}>
              Coba kata kunci atau kategori lain.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setSelectedCategory("Semua");
              }}
            >
              <Text style={styles.seeAll}>Reset Pencarian</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>VapeStore</Text>
          <Text style={styles.footerText}>
            Katalog produk dan aksesori dalam satu aplikasi.
          </Text>
        </View>
      </ScrollView>

      {/* NAVIGASI BAWAH */}
      <View style={styles.bottomNav}>
        {[
          { name: "Beranda", icon: "⌂" },
          { name: "Kategori", icon: "▦" },
          { name: "Keranjang", icon: "🛒" },
          { name: "Pesanan", icon: "▤" },
          { name: "Profil", icon: "♙" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(tab.name);

              if (tab.name === "Kategori") {
                setSelectedCategory("Semua");
              }
            }}
          >
            <Text
              style={[
                styles.navIcon,
                activeTab === tab.name && styles.navActive,
              ]}
            >
              {tab.icon}
            </Text>

            <Text
              style={[
                styles.navLabel,
                activeTab === tab.name && styles.navActive,
              ]}
            >
              {tab.name}
            </Text>

            {tab.name === "Keranjang" && cartCount > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    minHeight: 66,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EEE9",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },
  brandText: {
    color: DARK,
    fontSize: 22,
    fontWeight: "800",
  },
  brandAccent: {
    color: GREEN,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageHeaderButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
  },
  manageHeaderButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 19,
  },
  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E34C4C",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    padding: 18,
    paddingBottom: 25,
  },
  searchBox: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAE5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 18,
  },
  searchIcon: {
    fontSize: 25,
    color: GREEN,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: DARK,
  },
  clearSearch: {
    color: GREEN,
    fontSize: 16,
    paddingHorizontal: 5,
  },
  banner: {
    minHeight: 175,
    borderRadius: 20,
    backgroundColor: "#073F2E",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 25,
  },
  bannerText: {
    flex: 1,
    zIndex: 1,
  },
  bannerEyebrow: {
    color: "#A9DCC2",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 5,
  },
  bannerDescription: {
    color: "#D5E9DE",
    fontSize: 12,
    marginBottom: 14,
  },
  bannerButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  bannerButtonText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "700",
  },
  bannerDecoration: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  bannerLetter: {
    color: "rgba(255,255,255,0.10)",
    fontSize: 150,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "800",
  },
  seeAll: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
  },
  categoryList: {
    gap: 12,
    paddingBottom: 25,
  },
  categoryItem: {
    width: 74,
    alignItems: "center",
    gap: 7,
    paddingVertical: 8,
    borderRadius: 13,
  },
  categorySelected: {
    backgroundColor: LIGHT_GREEN,
  },
  categoryIcon: {
    width: 51,
    height: 51,
    borderRadius: 17,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    padding: 7,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  allCategoryIcon: {
    color: GREEN,
    fontSize: 24,
    fontWeight: "700",
  },
  categoryName: {
    color: DARK,
    fontSize: 11,
    fontWeight: "600",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    width: "48%" as any,
    flexGrow: 1,
    flexBasis: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EDE8",
    overflow: "hidden",
    marginBottom: 2,
  },
  productImage: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  productPhoto: {
    width: "100%",
    height: "100%",
  },
  productTag: {
    position: "absolute",
    top: 9,
    left: 9,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  productTagText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "700",
  },
  productInfo: {
    padding: 11,
  },
  productCategory: {
    color: "#7D8C82",
    fontSize: 10,
    marginBottom: 5,
  },
  productName: {
    color: DARK,
    fontSize: 12,
    fontWeight: "700",
    minHeight: 32,
    marginBottom: 6,
  },
  productPrice: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: GREEN,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    gap: 10,
  },
  emptyTitle: {
    color: DARK,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#748078",
    fontSize: 12,
  },
  footer: {
    marginTop: 25,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5EAE5",
  },
  footerTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 5,
  },
  footerText: {
    color: "#78847C",
    fontSize: 12,
  },
  bottomNav: {
    minHeight: 66,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5EAE5",
    paddingHorizontal: 4,
  },
  navItem: {
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navIcon: {
    color: "#89958E",
    fontSize: 21,
  },
  navLabel: {
    color: "#89958E",
    fontSize: 10,
  },
  navActive: {
    color: GREEN,
    fontWeight: "800",
  },
  navBadge: {
    position: "absolute",
    top: -5,
    right: 3,
    backgroundColor: "#E34C4C",
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  navBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});
