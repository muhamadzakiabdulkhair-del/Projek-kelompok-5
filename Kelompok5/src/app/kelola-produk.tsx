import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  TouchableOpacity,
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
  formatRupiah,
  type Category,
  type Product,
} from "@/data/products";

import {
  activateProduct,
  createProduct,
  deactivateProduct,
  deleteFoto,
  fetchProducts,
  updateProduct,
  uploadFoto,
} from "@/services/productService";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormErrors = {
  name?: string;
  price?: string;
  purchasePrice?: string;
  stock?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confirmStatusChange(
  name: string,
  activate: boolean,
  onYes: () => void
) {
  const title = activate ? "Aktifkan Produk" : "Nonaktifkan Produk";
  const message = activate
    ? `Aktifkan kembali ${name}? Produk akan tampil di katalog pelanggan.`
    : `Nonaktifkan ${name}? Produk tidak akan tampil di katalog pelanggan.`;

  if (Platform.OS === "web") {
    if (window.confirm(message)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: "Batal", style: "cancel" },
    { text: activate ? "Aktifkan" : "Nonaktifkan", onPress: onYes },
  ]);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function KelolaProdukScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = parseRole(roleParam);
  const isAdmin = role === "owner";

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");

  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFotoUrl, setEditingFotoUrl] = useState<string | null>(null); // URL foto lama saat edit
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [category, setCategory] = useState<Category>("Pod");
  const [price, setPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);   // URI lokal foto baru
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Load data dari Supabase ────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: any) {
      Alert.alert("Gagal memuat produk", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
        const matchCategory = catFilter === "Semua" || p.category === catFilter;
        return matchSearch && matchCategory;
      }),
    [products, search, catFilter]
  );

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outStock = products.filter((p) => p.stock <= 0).length;

  // ── Form helpers ───────────────────────────────────────────────────────────
  function openForm(p?: Product) {
    if (!isAdmin) return;
    setEditingId(p?.id ?? null);
    setEditingFotoUrl(p?.fotoUrl ?? null);
    setName(p?.name ?? "");
    setSub(p?.sub ?? "");
    setCategory(p?.category ?? "Pod");
    setPrice(p ? String(p.price) : "");
    setPurchasePrice(p ? String(p.purchasePrice ?? "") : "");
    setStock(p ? String(p.stock) : "");
    setFotoUri(null);
    setErrors({});
    setFormVisible(true);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Nama produk wajib diisi.";
    if (!price.trim()) e.price = "Harga wajib diisi.";
    else if (!/^\d+$/.test(price.trim()) || Number(price) <= 0)
      e.price = "Harga harus berupa angka lebih dari 0.";
    if (!purchasePrice.trim()) e.purchasePrice = "Harga beli wajib diisi.";
    else if (!/^\d+$/.test(purchasePrice.trim()) || Number(purchasePrice) <= 0)
      e.purchasePrice = "Harga beli harus berupa angka lebih dari 0.";
    if (!stock.trim()) e.stock = "Stok wajib diisi.";
    else if (!/^\d+$/.test(stock.trim()))
      e.stock = "Stok harus berupa angka (0 atau lebih).";
    return e;
  }

  // ── Image picker ──────────────────────────────────────────────────────────
  async function pilihFoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin diperlukan", "Izinkan akses galeri untuk memilih foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  }

  // ── Save (CREATE / UPDATE) ─────────────────────────────────────────────────
  async function save() {
    if (!isAdmin) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSaving(true);

      // Upload foto baru jika ada
      let fotoUrl: string | null | undefined = undefined;
      if (fotoUri) {
        fotoUrl = await uploadFoto(fotoUri);
        // Hapus foto lama dari Storage jika ini adalah edit dan ada foto lama
        if (editingId && editingFotoUrl) {
          await deleteFoto(editingFotoUrl);
        }
      }

      const input = {
        nama: name.trim(),
        harga: Number(price),
        harga_beli: Number(purchasePrice),
        deskripsi: sub.trim() || category,
        kategori: category,
        stok: Number(stock),
        ...(fotoUrl !== undefined && { foto_url: fotoUrl }),
      };

      if (editingId) {
        const updated = await updateProduct(editingId, input);
        setProducts((old) => old.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await createProduct(input);
        setProducts((old) => [created, ...old]);
      }
      setFormVisible(false);
    } catch (err: any) {
      Alert.alert("Gagal menyimpan", err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active status ───────────────────────────────────────────────────
  function toggleProductStatus(p: Product) {
    if (!isAdmin) return;
    const nextActive = !p.isActive;
    confirmStatusChange(p.name, nextActive, async () => {
      try {
        if (nextActive) await activateProduct(p.id);
        else await deactivateProduct(p.id);
        setProducts((old) =>
          old.map((item) =>
            item.id === p.id ? { ...item, isActive: nextActive } : item
          )
        );
      } catch (err: any) {
        Alert.alert("Gagal mengubah status", err.message);
      }
    });
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  const addButton = isAdmin ? (
    <AppButton compact icon="add" label="Tambah" onPress={() => openForm()} />
  ) : undefined;

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

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScreenHeader
          title="Kelola Produk"
          subtitle={isAdmin ? "Admin" : role === "karyawan" ? "Karyawan" : "Pelanggan"}
        />
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat produk...</Text>
        </View>
        <BottomNav tabs={tabsForRole(role)} active="produk" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader
        title="Kelola Produk"
        subtitle={isAdmin ? "Admin" : role === "karyawan" ? "Karyawan" : "Pelanggan"}
        right={addButton}
      />

      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} />
        <FilterChips
          options={["Semua", ...CATEGORIES]}
          value={catFilter}
          onChange={setCatFilter}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Produk tidak ditemukan"
            message="Coba kata kunci atau kategori lain."
          />
        }
        renderItem={({ item: p }) => {
          const stockColor =
            p.stock <= 0 ? colors.danger : p.stock <= 5 ? colors.warning : colors.primary;
          const stockLabel =
            p.stock <= 0
              ? "Stok habis"
              : p.stock <= 5
              ? `Stok menipis · ${p.stock}`
              : `Stok: ${p.stock}`;

          return (
            <View style={[styles.row, !p.isActive && styles.inactiveRow]}>
              <View style={styles.imgWrap}>
                {p.fotoUrl ? (
                  <Image source={{ uri: p.fotoUrl }} style={styles.img} resizeMode="cover" />
                ) : (
                  <Image source={p.image} style={styles.img} resizeMode="contain" />
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.sub}>{p.sub}</Text>
                <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.price}>{formatRupiah(p.price)}</Text>
                <Text style={[styles.stock, { color: stockColor }]}>{stockLabel}</Text>
                <Text style={[styles.status, { color: p.isActive ? colors.primary : colors.danger }]}>
                  {p.isActive ? "Aktif" : "Nonaktif"}
                </Text>
              </View>

              {isAdmin && (
                <View style={styles.actions}>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() => openForm(p)}
                    accessibilityLabel={`Edit ${p.name}`}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.delBtn, p.isActive && styles.deactivateBtn]}
                    onPress={() => toggleProductStatus(p)}
                    accessibilityLabel={p.isActive ? `Nonaktifkan ${p.name}` : `Aktifkan ${p.name}`}
                  >
                    <Ionicons
                      name={p.isActive ? "power-outline" : "checkmark-circle-outline"}
                      size={18}
                      color={p.isActive ? colors.danger : colors.primary}
                    />
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Form tambah / edit */}
      <Modal
        visible={isAdmin && formVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.sheet}>
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>
                  {editingId ? "Edit Produk" : "Tambah Produk"}
                </Text>
                <Pressable onPress={() => setFormVisible(false)} hitSlop={10} accessibilityLabel="Tutup form">
                  <Ionicons name="close" size={22} color={colors.ink} />
                </Pressable>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* ── Foto produk ── */}
                <Text style={styles.fieldLabel}>Foto Produk</Text>
                <TouchableOpacity style={styles.fotoBox} onPress={pilihFoto} activeOpacity={0.75}>
                  {fotoUri ? (
                    <Image source={{ uri: fotoUri }} style={styles.fotoPreview} resizeMode="cover" />
                  ) : editingFotoUrl ? (
                    <View style={styles.fotoExisting}>
                      <Image source={{ uri: editingFotoUrl }} style={styles.fotoPreview} resizeMode="cover" />
                      <View style={styles.fotoOverlay}>
                        <Ionicons name="camera-outline" size={24} color={colors.white} />
                        <Text style={styles.fotoOverlayText}>Ganti foto</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fotoPlaceholder}>
                      <Ionicons name="camera-outline" size={32} color={colors.placeholder} />
                      <Text style={styles.fotoPlaceholderText}>Ketuk untuk pilih foto</Text>
                      <Text style={styles.fotoPlaceholderSub}>(Opsional)</Text>
                    </View>
                  )}
                </TouchableOpacity>

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
                    <Pressable
                      key={c}
                      style={[styles.catOpt, category === c && styles.catOptActive]}
                      onPress={() => setCategory(c)}
                    >
                      <Text style={[styles.catOptText, category === c && styles.catOptTextActive]}>
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <AppInput
                  label="Harga Jual (Rp)"
                  placeholder="Contoh: 450000"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  error={errors.price}
                />
                <AppInput
                  label="Harga Beli / Modal (Rp)"
                  placeholder="Contoh: 350000"
                  keyboardType="numeric"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  error={errors.purchasePrice}
                />
                <AppInput
                  label="Stok"
                  placeholder="Jumlah stok"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                  error={errors.stock}
                />

                <AppButton
                  label={saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Produk"}
                  icon="checkmark"
                  onPress={save}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <BottomNav tabs={tabsForRole(role)} active="produk" />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  filters: { paddingHorizontal: 14, paddingTop: 12, gap: 10 },
  content: { padding: 14, gap: 10, flexGrow: 1 },
  centerLoader: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 13, color: colors.muted },

  statRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  stat: {
    flex: 1, backgroundColor: colors.primarySoft,
    borderRadius: radius.md, alignItems: "center", paddingVertical: 12, gap: 2,
  },
  statNum: { fontSize: 20, fontWeight: "900", color: colors.primary },
  statLabel: { fontSize: 10, color: colors.muted, fontWeight: "600" },

  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: 10,
  },
  inactiveRow: { opacity: 0.72 },
  imgWrap: {
    width: 70, height: 70, borderRadius: radius.md,
    backgroundColor: colors.tint, alignItems: "center", justifyContent: "center", padding: 6,
  },
  img: { width: "100%", height: "100%" },
  info: { flex: 1, gap: 1 },
  sub: { fontSize: 10, color: colors.placeholder },
  name: { fontSize: 14, fontWeight: "800", color: colors.ink },
  price: { fontSize: 13, fontWeight: "800", color: colors.primary },
  stock: { fontSize: 11, fontWeight: "700" },
  status: { fontSize: 11, fontWeight: "800", marginTop: 2 },

  actions: { gap: 8 },
  editBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  delBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center",
  },
  deactivateBtn: { backgroundColor: colors.dangerSoft },

  // Foto picker
  fotoBox: {
    height: 160,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 14,
  },
  fotoPreview: { width: "100%", height: "100%" },
  fotoExisting: { width: "100%", height: "100%", position: "relative" },
  fotoOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  fotoOverlayText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  fotoPlaceholder: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.tint,
  },
  fotoPlaceholderText: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  fotoPlaceholderSub: { fontSize: 11, color: colors.placeholder },

  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(10,34,24,0.55)" },
  sheet: {
    maxHeight: "92%", backgroundColor: colors.surface,
    padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  sheetHead: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
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
