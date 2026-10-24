import { useMemo, useState } from "react";
import {
  Alert,
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
import { useRouter, useLocalSearchParams } from "expo-router";

const GREEN = "#087F50";
const DARK = "#0F1F17";
const BG = "#F5F7F5";

const initialProducts = [
  { id: "1", name: "Uwell Caliburn G2", sub: "Pod System", category: "Pod",  price: "450000", stock: "15", image: require("../../assets/images/Pod.png") },
  { id: "2", name: "Vaporesso XROS 3",  sub: "Pod System", category: "Mod",  price: "550000", stock: "20", image: require("../../assets/images/Mod.png") },
  { id: "3", name: "Liquid Naked 100",  sub: "Strawberry", category: "Liquid", price: "150000", stock: "35", image: require("../../assets/images/Liquid.png") },
  { id: "4", name: "Coil Geekvape",     sub: "Coil",       category: "Coil",  price: "120000", stock: "50", image: require("../../assets/images/Coil.png") },
  { id: "5", name: "Mod Voopoo Drag X", sub: "Mod",        category: "Mod",  price: "1200000", stock: "10", image: require("../../assets/images/Mod.png") },
];

const imgByCategory: Record<string, any> = {
  Pod: require("../../assets/images/Pod.png"),
  Mod: require("../../assets/images/Mod.png"),
  Liquid: require("../../assets/images/Liquid.png"),
  Coil: require("../../assets/images/Coil.png"),
  Aksesori: require("../../assets/images/Coil.png"),
};

function rupiah(v: string) {
  return "Rp " + (Number(v) || 0).toLocaleString("id-ID");
}

type Product = { id: string; name: string; sub: string; category: string; price: string; stock: string; image: any };

export default function KelolaProdukScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const isOwner = role !== "karyawan";

  // Nav tabs sesuai role
  const NAV_TABS = isOwner
    ? [
        { name: "Dashboard", icon: "📊" },
        { name: "Produk",    icon: "📦" },
        { name: "Laporan",   icon: "📈" },
        { name: "Profil",    icon: "👤" },
      ]
    : [
        { name: "Produk",  icon: "📦" },
        { name: "Pesanan", icon: "📋" },
        { name: "Profil",  icon: "👤" },
      ];
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua");
  const [activeTab, setActiveTab] = useState("Produk");
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [category, setCategory] = useState("Pod");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const filtered = useMemo(() => products.filter((p) => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "Semua" || p.category === catFilter;
    return ms && mc;
  }), [products, search, catFilter]);

  const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  const outStock = products.filter((p) => Number(p.stock) <= 0).length;

  function openAdd() {
    setEditingId(null); setName(""); setSub(""); setCategory("Pod"); setPrice(""); setStock("");
    setFormVisible(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id); setName(p.name); setSub(p.sub); setCategory(p.category); setPrice(p.price); setStock(p.stock);
    setFormVisible(true);
  }

  function save() {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      Alert.alert("Data belum lengkap", "Isi nama, harga, dan stok.");
      return;
    }
    const prod: Product = {
      id: editingId ?? String(Date.now()),
      name: name.trim(), sub: sub.trim() || category,
      category, price: String(Math.floor(Number(price))),
      stock: String(Math.floor(Number(stock))),
      image: imgByCategory[category] ?? imgByCategory.Pod,
    };
    if (editingId) {
      setProducts((old) => old.map((p) => p.id === editingId ? prod : p));
    } else {
      setProducts((old) => [prod, ...old]);
    }
    setFormVisible(false);
  }

  function del(p: Product) {
    Alert.alert("Hapus produk", `Yakin hapus ${p.name}?`, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => setProducts((old) => old.filter((x) => x.id !== p.id)) },
    ]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Kelola Produk</Text>
        <TouchableOpacity style={s.addHeaderBtn} onPress={openAdd}>
          <Text style={s.addHeaderBtnText}>+ Tambah Produk</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* SEARCH */}
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Cari produk..."
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

        {/* STAT CARDS */}
        <View style={s.statRow}>
          <View style={s.statCard}>
            <Text style={s.statIcon}>📦</Text>
            <Text style={s.statNum}>{products.length}</Text>
            <Text style={s.statLabel}>Total Produk</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: "#FFFBEE" }]}>
            <Text style={s.statIcon}>⚠️</Text>
            <Text style={[s.statNum, { color: "#C08000" }]}>{lowStock}</Text>
            <Text style={s.statLabel}>Stok Menipis</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: "#FFF0F0" }]}>
            <Text style={s.statIcon}>❌</Text>
            <Text style={[s.statNum, { color: "#C03030" }]}>{outStock}</Text>
            <Text style={s.statLabel}>Stok Habis</Text>
          </View>
        </View>

        {/* FILTER KATEGORI */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {["Semua","Pod","Mod","Liquid","Coil","Aksesori"].map((c) => (
            <TouchableOpacity
              key={c}
              style={[s.chip, catFilter === c && s.chipActive]}
              onPress={() => setCatFilter(c)}
            >
              <Text style={[s.chipText, catFilter === c && s.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LIST PRODUK */}
        {filtered.map((p) => {
          const qty = Number(p.stock);
          const stockColor = qty <= 0 ? "#C03030" : qty <= 5 ? "#C08000" : GREEN;
          const stockLabel = qty <= 0 ? "Stok habis" : qty <= 5 ? `Stok menipis · ${qty}` : `Stok: ${qty}`;
          return (
            <View key={p.id} style={s.productRow}>
              <View style={s.productImgWrap}>
                <Image source={p.image} style={s.productImg} resizeMode="contain" />
              </View>
              <View style={s.productInfo}>
                <Text style={s.productSub}>{p.sub}</Text>
                <Text style={s.productName}>{p.name}</Text>
                <Text style={s.productPrice}>{rupiah(p.price)}</Text>
                <Text style={[s.stockText, { color: stockColor }]}>{stockLabel}</Text>
              </View>
              <View style={s.productActions}>
                <TouchableOpacity style={s.editBtn} onPress={() => openEdit(p)}>
                  <Text style={s.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.delBtn} onPress={() => del(p)}>
                  <Text style={s.delIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>Produk tidak ditemukan</Text>
          </View>
        )}

        {/* FORM TAMBAH / EDIT */}
        {formVisible && (
          <View style={s.formCard}>
            <View style={s.formHeader}>
              <Text style={s.formTitle}>{editingId ? "Edit Produk" : "Tambah Produk"}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <Text style={s.formClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.inputLabel}>Nama produk</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Nama produk" placeholderTextColor="#9AAEA4" />

            <Text style={s.inputLabel}>Sub / Deskripsi singkat</Text>
            <TextInput style={s.input} value={sub} onChangeText={setSub} placeholder="Contoh: Pod System · Hitam" placeholderTextColor="#9AAEA4" />

            <Text style={s.inputLabel}>Kategori</Text>
            <View style={s.catOptions}>
              {["Pod","Mod","Liquid","Coil","Aksesori"].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.catOpt, category === c && s.catOptActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[s.catOptText, category === c && s.catOptTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.inputLabel}>Harga (Rp)</Text>
            <TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="Contoh: 450000" keyboardType="numeric" placeholderTextColor="#9AAEA4" />

            <Text style={s.inputLabel}>Stok</Text>
            <TextInput style={s.input} value={stock} onChangeText={setStock} placeholder="Jumlah stok" keyboardType="numeric" placeholderTextColor="#9AAEA4" />

            <TouchableOpacity style={s.saveBtn} onPress={save}>
              <Text style={s.saveBtnText}>{editingId ? "Simpan Perubahan" : "Simpan Produk"}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={s.bottomNav}>
        {NAV_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={s.navItem}
            onPress={() => {
              setActiveTab(tab.name);
              if (tab.name === "Dashboard") router.push("/admin/dashboard");
              if (tab.name === "Laporan") router.push("/admin/laporan" as any);
              if (tab.name === "Pesanan") router.push("/karyawan/pesanan" as any);
              if (tab.name === "Profil") router.push("/karyawan/profil" as any);
            }}
          >
            <Text style={s.navIcon}>{tab.icon}</Text>
            <Text style={[s.navLabel, activeTab === tab.name && s.navLabelActive]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#E8EEE8", gap: 10,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" },
  backIcon: { color: GREEN, fontSize: 18, fontWeight: "700" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: DARK },
  addHeaderBtn: { backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  addHeaderBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  content: { padding: 14, paddingBottom: 20 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 12,
    borderWidth: 1, borderColor: "#DDE8E2",
    paddingHorizontal: 12, marginBottom: 12, height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: DARK },
  searchClear: { color: GREEN, fontSize: 14, paddingHorizontal: 4 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: "#E8F5EE", borderRadius: 14, padding: 10, alignItems: "center", gap: 4 },
  statIcon: { fontSize: 20 },
  statNum: { fontSize: 22, fontWeight: "800", color: GREEN },
  statLabel: { fontSize: 10, color: "#6A8A74", textAlign: "center" },
  chips: { gap: 8, paddingBottom: 14 },
  chip: { borderWidth: 1, borderColor: "#DDE8E2", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#FFFFFF" },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { fontSize: 12, color: "#6A8A74", fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  productRow: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    borderRadius: 16, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: "#E8EEE8", alignItems: "center", gap: 12,
  },
  productImgWrap: { width: 72, height: 80, borderRadius: 12, backgroundColor: "#E8F5EE", padding: 8, alignItems: "center", justifyContent: "center" },
  productImg: { width: "100%", height: "100%" },
  productInfo: { flex: 1 },
  productSub: { fontSize: 10, color: "#9AAEA4", marginBottom: 2 },
  productName: { fontSize: 14, fontWeight: "700", color: DARK, marginBottom: 3 },
  productPrice: { fontSize: 14, fontWeight: "800", color: GREEN, marginBottom: 3 },
  stockText: { fontSize: 11, fontWeight: "700" },
  productActions: { gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#E8F5EE", alignItems: "center", justifyContent: "center" },
  editIcon: { fontSize: 16 },
  delBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#FFF0F0", alignItems: "center", justifyContent: "center" },
  delIcon: { fontSize: 16 },
  empty: { alignItems: "center", padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: DARK },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginTop: 10, borderWidth: 1, borderColor: "#E0EAE4", gap: 10 },
  formHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  formTitle: { fontSize: 17, fontWeight: "800", color: DARK },
  formClose: { color: "#9AAEA4", fontSize: 18, padding: 4 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: DARK },
  input: { borderWidth: 1, borderColor: "#DDE8E2", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: DARK, backgroundColor: "#F8FBF9" },
  catOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catOpt: { borderWidth: 1, borderColor: "#DDE8E2", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  catOptActive: { backgroundColor: GREEN, borderColor: GREEN },
  catOptText: { fontSize: 12, color: "#6A8A74" },
  catOptTextActive: { color: "#FFFFFF", fontWeight: "700" },
  saveBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  bottomNav: { flexDirection: "row", backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8EEE8", paddingVertical: 8, paddingHorizontal: 4 },
  navItem: { flex: 1, alignItems: "center", gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: "#9AAEA4", fontWeight: "600" },
  navLabelActive: { color: GREEN, fontWeight: "800" },
});
