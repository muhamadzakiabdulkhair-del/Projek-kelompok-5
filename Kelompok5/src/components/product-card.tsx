import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/constants/palette";
import { formatRupiah, type Product } from "@/data/products";

type Props = {
  product: Product;
  onPress: () => void;
  onAdd?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Kartu produk: seluruh kartu bisa ditekan (ke Detail), tombol keranjang terpisah.
export function ProductCard({ product, onPress, onAdd, style }: Props) {
  const soldOut = product.stock <= 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <View style={styles.imgWrap}>
        <Image source={product.image} style={styles.img} resizeMode="contain" />
        {soldOut ? (
          <View style={styles.soldBadge}><Text style={styles.soldText}>Habis</Text></View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.sub} numberOfLines={1}>{product.sub}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.star} />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviews})</Text>
        </View>
        <Text style={styles.price}>{formatRupiah(product.price)}</Text>
        {onAdd ? (
          <Pressable
            style={[styles.addBtn, soldOut && styles.addOff]}
            disabled={soldOut}
            onPress={onAdd}
            accessibilityLabel={`Tambah ${product.name} ke keranjang`}
          >
            <Ionicons name="cart" size={16} color={colors.white} />
            <Text style={styles.addText}>Tambah</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
  },
  pressed: { opacity: 0.9 },
  imgWrap: { height: 130, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center", padding: 12 },
  img: { width: "100%", height: "100%" },
  soldBadge: {
    position: "absolute", top: 8, left: 8, backgroundColor: colors.danger,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  soldText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  body: { padding: 10 },
  sub: { fontSize: 10, color: colors.placeholder, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: "700", color: colors.ink, minHeight: 34, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 4 },
  rating: { fontSize: 11, color: colors.star, fontWeight: "700" },
  reviews: { fontSize: 10, color: colors.placeholder },
  price: { fontSize: 14, fontWeight: "800", color: colors.primary, marginBottom: 8 },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 8,
  },
  addOff: { opacity: 0.4 },
  addText: { color: colors.white, fontSize: 12, fontWeight: "800" },
});
