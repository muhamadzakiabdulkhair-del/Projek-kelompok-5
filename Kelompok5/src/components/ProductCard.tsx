
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GREEN = "#087F50";
const DARK = "#0F1F17";

type ProductCardProps = {
  id: string;
  name: string;
  sub: string;
  price: number;
  rating: number;
  reviews: number;
  image: ImageSourcePropType;
  onAddToCart: () => void;
  onPress: () => void;
};

export default function ProductCard({
  name,
  sub,
  price,
  rating,
  reviews,
  image,
  onAddToCart,
  onPress,
}: ProductCardProps) {
  const formattedPrice = `Rp ${price.toLocaleString("id-ID")}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.productButton}
      >
        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({reviews})</Text>
          </View>

          <Text style={styles.price}>{formattedPrice}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddToCart}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>＋ Keranjang</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7EDE8",
    padding: 9,
    marginBottom: 2,
    overflow: "hidden",
  },
  productButton: {
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: 125,
    borderRadius: 10,
    backgroundColor: "#F5F8F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 10,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  info: {
    width: "100%",
    minWidth: 0,
  },
  name: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    color: DARK,
    minHeight: 34,
  },
  sub: {
    fontSize: 10,
    color: "#849188",
    marginTop: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 4,
  },
  star: {
    fontSize: 12,
    color: "#F5A623",
  },
  rating: {
    fontSize: 10,
    fontWeight: "800",
    color: DARK,
  },
  reviews: {
    fontSize: 10,
    color: "#8B968F",
  },
  price: {
    fontSize: 13,
    fontWeight: "900",
    color: GREEN,
    marginTop: 8,
    marginBottom: 10,
  },
  addButton: {
    width: "100%",
    minHeight: 34,
    backgroundColor: GREEN,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
