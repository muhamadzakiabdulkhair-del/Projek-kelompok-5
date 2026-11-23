import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ProductCard } from "@/components/product-card";
import { colors } from "@/constants/palette";
import { useAuth } from "@/context/auth";
import type { Product } from "@/data/products";
import {
  fetchRekomendasi,
  type HasilRekomendasi,
} from "@/services/rekomendasiService";

type Props = {
  products: Product[]; // daftar produk aktif (untuk mencocokkan id)
  onOpen: (product: Product) => void;
  onAdd?: (product: Product) => void;
};

// Bagian "Rekomendasi untuk Kamu". Hanya tampil untuk pelanggan yang login.
// Label dibuat jujur: hasil model dan produk terpopuler diberi keterangan berbeda.
export function RekomendasiSection({ products, onOpen, onAdd }: Props) {
  const { profil } = useAuth();
  const userId = profil?.id;
  const peran = profil?.peran;
  const [hasil, setHasil] = useState<HasilRekomendasi | null>(null);

  useEffect(() => {
    if (!userId || peran !== "pelanggan") {
      setHasil(null);
      return;
    }
    let batal = false;
    fetchRekomendasi()
      .then((h) => {
        if (!batal) setHasil(h);
      })
      .catch(() => {
        if (!batal) setHasil(null);
      });
    return () => {
      batal = true;
    };
  }, [userId, peran]);

  const items = useMemo(() => {
    if (!hasil) return [];
    return hasil.itemIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  }, [hasil, products]);

  if (!hasil || items.length === 0) return null;

  const dariModel = hasil.sumber === "model";

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {dariModel ? "Rekomendasi untuk Kamu" : "Produk Terpopuler"}
        </Text>
        <Text style={styles.count}>
          {dariModel
            ? "Dihitung model dari riwayatmu"
            : "Belum ada riwayat untukmu"}
        </Text>
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(p) => "rek-" + p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            style={styles.card}
            onPress={() => onOpen(item)}
            onAdd={onAdd ? () => onAdd(item) : undefined}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.ink },
  count: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  list: { gap: 10, paddingBottom: 8 },
  card: { width: 160 },
});
