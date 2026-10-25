import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GREEN = "#087F50";
const DARK = "#0F1F17";

const productData: Record<
  string,
  {
    name: string;
    sub: string;
    price: number;
    rating: number;
    reviews: number;
    image: any;
    description: string;
  }
> = {
  "1": {
    name: "Uwell Caliburn G2",
    sub: "Pod System · Hitam",
    price: 450000,
    rating: 4.9,
    reviews: 100,
    image: require("../../assets/images/Pod.png"),
    description:
      "Perangkat pod dengan desain ringkas dan tampilan minimalis. Periksa spesifikasi resmi produk sebelum membeli.",
  },
  "2": {
    name: "Vaporesso XROS 3",
    sub: "Pod System",
    price: 550000,
    rating: 4.7,
    reviews: 99,
    image: require("../../assets/images/Mod.png"),
    description:
      "Produk dengan desain praktis dan tampilan modern. Detail spesifikasi dapat disesuaikan dengan produk yang tersedia.",
  },
  "3": {
    name: "Liquid Naked 100",
    sub: "Strawberry 60ml",
    price: 150000,
    rating: 4.8,
    reviews: 55,
    image: require("../../assets/images/Liquid.png"),
    description:
      "Produk liquid dengan varian Strawberry. Periksa komposisi, label, dan ketentuan usia sebelum membeli.",
  },
  "4": {
    name: "Coil Geekvape",
    sub: "Pack 4",
    price: 120000,
    rating: 4.6,
    reviews: 40,
    image: require("../../assets/images/Coil.png"),
    description:
      "Produk coil untuk perangkat yang kompatibel. Pastikan tipe coil sesuai dengan perangkat yang digunakan.",
  },
  "5": {
    name: "Voopoo Drag X",
    sub: "Mod",
    price: 1200000,
    rating: 4.9,
    reviews: 76,
    image: require("../../assets/images/Mod.png"),
    description:
      "Perangkat kategori mod. Periksa kompatibilitas dan spesifikasi resmi sebelum membeli.",
  },
  "6": {
    name: "Geekvape Aegis",
    sub: "Mod",
    price: 1350000,
    rating: 4.8,
    reviews: 61,
    image: require("../../assets/images/Mod.png"),
    description:
      "Perangkat kategori mod dengan desain kokoh. Informasi detail dapat dilengkapi berdasarkan spesifikasi produk resmi.",
  },
};

export default function DetailProduk() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = productData[String(id)];

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Produk tidak ditemukan.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/dashboard")
          }
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatRupiah = (price: number) => "Rp " + price.toLocaleString("id-ID");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F5" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/dashboard")
          }
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        <View style={{ width: 65 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageBox}>
          <Image
            source={product.image}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.sub}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {product.rating}</Text>
            <Text style={styles.reviews}>({product.reviews} ulasan)</Text>
          </View>

          <Text style={styles.price}>{formatRupiah(product.price)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <View>
          <Text style={styles.bottomLabel}>Harga</Text>
          <Text style={styles.bottomPrice}>{formatRupiah(product.price)}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/dashboard",
            })
          }
        >
          <Text style={styles.buttonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F8F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: { width: 65 },
  backText: { color: GREEN, fontWeight: "700" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: DARK },
  imageBox: {
    height: 280,
    margin: 16,
    borderRadius: 20,
    backgroundColor: "#EAF2EC",
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: { width: "80%", height: "80%" },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  category: { color: "#809188", fontSize: 13, marginBottom: 6 },
  name: { color: DARK, fontSize: 23, fontWeight: "800" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  rating: { color: "#E5A000", fontWeight: "700" },
  reviews: { color: "#809188", fontSize: 12 },
  price: {
    color: GREEN,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#DFE8E0",
    marginVertical: 20,
  },
  sectionTitle: { color: DARK, fontSize: 16, fontWeight: "800" },
  description: {
    color: "#65776D",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5ECE6",
  },
  bottomLabel: { color: "#809188", fontSize: 11 },
  bottomPrice: { color: GREEN, fontWeight: "800", fontSize: 16 },
  button: {
    backgroundColor: GREEN,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  error: { color: DARK, textAlign: "center", margin: 24 },
});

