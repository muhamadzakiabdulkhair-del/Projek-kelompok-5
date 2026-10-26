import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/app-button";
import { AppInput } from "@/components/app-input";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { FilterChips } from "@/components/filter-chips";
import { ScreenHeader } from "@/components/screen-header";
import { SearchBar } from "@/components/search-bar";
import { parseRole, tabsForRole } from "@/constants/navigation";
import { colors, radius } from "@/constants/palette";
import {
  CATEGORIES,
  CATEGORY_IMAGES,
  PRODUCTS,
  formatRupiah,
  type Category,
  type Product,
} from "@/data/products";

type FormErrors = { name?: string; price?: string; stock?: string };

function confirmDelete(name: string, onYes: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`Yakin hapus ${name}?`)) onYes();
    return;
  }
  Alert.alert("Hapus produk", `Yakin hapus ${name}?`, [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: onYes },
  ]);
}

export default function KelolaProdukScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = parseRole(roleParam) === "karyawan" ? "karyawan" : "owner";

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");

  // Form tambah / edit
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [category, setCategory] = useState<Category>("Pod");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
        return matchSearch && (catFilter === "Semua" || p.category === catFilter);
      }),
    [products, search, catFilter],
  );

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outStock = products.filter((p) => p.stock <= 0).length;

  function openForm(p?: Product) {
    setEditingId(p?.id ?? null);
    setName(p?.name ?? "");
    setSub(p?.sub ?? "");
    setCategory(p?.category ?? "Pod");
    setPrice(p ? String(p.price) : "");
    setStock(p ? String(p.stock) : "");
    setErrors({});
    setFormVisible(true);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Nama produk wajib diisi.";
    if (!price.trim()) e.price = "Harga wajib diisi.";
    else if (!/^\d+$/.test(price.trim()) || Number(price) <= 0) e.price = "Harga harus berupa angka lebih dari 0.";
    if (!stock.trim()) e.stock = "Stok wajib diisi.";
    else if (!/^\d+$/.test(stock.trim())) e.stock = "Stok harus berupa angka (0 atau lebih).";
    return e;
  }

  function save() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const existing = products.find((p) => p.id === editingId);
    const next: Product = {
      id: editingId ?? String(Date.now()),
      name: name.trim(),
      sub: sub.trim() || category,
      category,
      price: Number(price),
      stock: Number(stock),
      rating: existing?.rating ?? 0,
      reviews: existing?.reviews ?? 0,
      description: existing?.description ?? "Belum ada deskripsi.",
      image: CATEGORY_IMAGES[category],
    };
    setProducts((old) => (editingId ? old.map((p) => (p.id === editingId ? next : p)) : [next, ...old]));
    setFormVisible(false);
  }

  const addButton = (
    <AppButton compact icon="add" label="Tambah" onPress={() => openForm()} />
  );

  const listHeader = (
    <View style={styles.statRow}>
      <View style={styles.stat}>
        <Ionicons name="cube" size={20} color={colors.primary} />
        <Text style={styles.statNum}>{products.length}</Text>
        <Text style={styles.statLabel}>Total Produk</Text>
      </View>
      <View style={[styles.stat, { backgroundColor: colors.warningSoft }]}>
        <Ionicons name="warning" size={20} color={colors.warning} />
        <Text style={[styles.statNum, { color: colors.warning }]}>{lowStock}</Text>
        <Text style={styles.statLabel}>Stok Menipis</Text>
      </View>
      <View style={[styles.stat, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="close-circle" size={20} color={colors.danger} />
        <Text style={[styles.statNum, { color: colors.danger }]}>{outStock}</Text>
        <Text style={styles.statLabel}>Stok Habis</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Kelola Produk"
        subtitle={role === "owner" ? "Owner" : "Karyawan"}
        right={addButton}
      />

      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} />
        <FilterChips options={["Semua", ...CATEGORIES]} value={catFilter} onChange={setCatFilter} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Produk tidak ditemukan" message="Coba kata kunci atau kategori lain." />}
        renderItem={({ item: p }) => {
          const stockColor = p.stock <= 0 ? colors.danger : p.stock <= 5 ? colors.warning : colors.primary;
          const stockLabel = p.stock <= 0 ? "Stok habis" : p.stock <= 5 ? `Stok menipis · ${p.stock}` : `Stok: ${p.stock}`;
          return (
            <Pressable
              style={styles.row}
              onPress={() => openForm(p)}
            >
              <View style={styles.imgWrap}>
                <Image source={p.image} style={styles.img} resizeMode="contain" />
              </View>
              <View style={styles.info}>
                <Text style={styles.sub}>{p.sub}</Text>
                <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.price}>{formatRupiah(p.price)}</Text>
                <Text style={[styles.stock, { color: stockColor }]}>{stockLabel}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.editBtn} onPress={() => openForm(p)} accessibilityLabel={`Edit ${p.name}`}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  style={styles.delBtn}
                  onPress={() => confirmDelete(p.name, () => setProducts((old) => old.filter((x) => x.id !== p.id)))}
                  accessibilityLabel={`Hapus ${p.name}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.sheet}>
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>{editingId ? "Edit Produk" : "Tambah Produk"}</Text>
                <Pressable onPress={() => setFormVisible(false)} hitSlop={10} accessibilityLabel="Tutup form">
                  <Ionicons name="close" size={22} color={colors.ink} />
                </Pressable>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <AppInput
                  label="Nama produk"
                  placeholder="Contoh: Uwell Caliburn G2"
                  value={name}
                  onChangeText={setName}
                  error={errors.name}
                />
                <AppInput
                  label="Deskripsi singkat"
                  placeholder="Contoh: Pod System · Hitam"
                  value={sub}
                  onChangeText={setSub}
                />

                <Text style={styles.fieldLabel}>Kategori</Text>
                <View style={styles.catOptions}>
                  {CATEGORIES.map((c) => (
                    <Pressable key={c} style={[styles.catOpt, category === c && styles.catOptActive]} onPress={() => setCategory(c)}>
                      <Text style={[styles.catOptText, category === c && styles.catOptTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>

                <AppInput
                  label="Harga (Rp)"
                  placeholder="Contoh: 450000"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  error={errors.price}
                />
                <AppInput
                  label="Stok"
                  placeholder="Jumlah stok"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                  error={errors.stock}
                />

                <AppButton label={editingId ? "Simpan Perubahan" : "Simpan Produk"} icon="checkmark" onPress={save} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <BottomNav tabs={tabsForRole(role)} active="produk" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  filters: { paddingHorizontal: 14, paddingTop: 12, gap: 10 },
  content: { padding: 14, gap: 10, flexGrow: 1 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  stat: {
    flex: 1, backgroundColor: colors.primarySoft, borderRadius: radius.md,
    alignItems: "center", paddingVertical: 12, gap: 2,
  },
  statNum: { fontSize: 20, fontWeight: "900", color: colors.primary },
  statLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 10,
  },
  imgWrap: {
    width: 70, height: 70, borderRadius: radius.md, backgroundColor: colors.tint,
    alignItems: "center", justifyContent: "center", padding: 6,
  },
  img: { width: "100%", height: "100%" },
  info: { flex: 1, gap: 1 },
  sub: { fontSize: 10, color: colors.placeholder },
  name: { fontSize: 14, fontWeight: "800", color: colors.ink },
  price: { fontSize: 13, fontWeight: "800", color: colors.primary },
  stock: { fontSize: 11, fontWeight: "700" },
  actions: { gap: 8 },
  editBtn: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  delBtn: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.dangerSoft,
    alignItems: "center", justifyContent: "center",
  },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(10,34,24,0.55)" },
  sheet: {
    maxHeight: "92%", backgroundColor: colors.surface, padding: 18,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  sheetHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: colors.ink },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: colors.ink, marginBottom: 6 },
  catOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  catOpt: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.borderInput, backgroundColor: colors.surface,
  },
  catOptActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catOptText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  catOptTextActive: { color: colors.white },
});
