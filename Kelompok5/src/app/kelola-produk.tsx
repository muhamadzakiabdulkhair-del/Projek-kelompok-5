import { useMemo, useState } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const GREEN = '#087F50';
const DARK = '#16352A';
const LIGHT_GREEN = '#E5F4EC';
const BG = '#F7F9F7';

const initialProducts = [
  { id: '1', name: 'Uwell Caliburn G2', category: 'Pod', price: '450000', stock: '20', image: require('../../assets/images/Pod.png') },
  { id: '2', name: 'Vaporesso XROS 3', category: 'Mod', price: '550000', stock: '8', image: require('../../assets/images/Mod.png') },
  { id: '3', name: 'Liquid Strawberry', category: 'Liquid', price: '150000', stock: '3', image: require('../../assets/images/Liquid.png') },
  { id: '4', name: 'Coil Replacement', category: 'Coil', price: '120000', stock: '0', image: require('../../assets/images/Coil.png') },
];

const imageByCategory: Record<string, any> = {
  Pod: require('../../assets/images/Pod.png'),
  Mod: require('../../assets/images/Mod.png'),
  Liquid: require('../../assets/images/Liquid.png'),
  Coil: require('../../assets/images/Coil.png'),
  Aksesori: require('../../assets/images/Coil.png'),
};

function rupiah(value: string) {
  const number = Number(value) || 0;
  return 'Rp ' + number.toLocaleString('id-ID');
}

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  image: any;
};

export default function KelolaProdukScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pod');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const filtered = useMemo(() => products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [products, search, categoryFilter]);

  const lowStockCount = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  const outStockCount = products.filter((p) => Number(p.stock) <= 0).length;

  function openAddForm() {
    setEditingId(null);
    setName('');
    setCategory('Pod');
    setPrice('');
    setStock('');
    setFormVisible(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price);
    setStock(product.stock);
    setFormVisible(true);
  }

  function saveProduct() {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama, harga, dan stok produk terlebih dahulu.');
      return;
    }
    if (Number(price) < 0 || Number(stock) < 0 || !Number.isFinite(Number(price)) || !Number.isFinite(Number(stock))) {
      Alert.alert('Data tidak valid', 'Harga dan stok harus berupa angka nol atau lebih.');
      return;
    }
    const product: Product = {
      id: editingId ?? String(Date.now()),
      name: name.trim(),
      category,
      price: String(Math.floor(Number(price))),
      stock: String(Math.floor(Number(stock))),
      image: imageByCategory[category] ?? imageByCategory.Pod,
    };
    if (editingId) {
      setProducts((old) => old.map((p) => p.id === editingId ? product : p));
    } else {
      setProducts((old) => [product, ...old]);
    }
    setFormVisible(false);
  }

  function deleteProduct(product: Product) {
    Alert.alert('Hapus produk', `Yakin ingin menghapus ${product.name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setProducts((old) => old.filter((p) => p.id !== product.id)) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Kelola Produk</Text>
          <Text style={styles.headerSubtitle}>Atur produk dan persediaan toko</Text>
        </View>
        <TouchableOpacity style={styles.addHeaderButton} onPress={openAddForm}>
          <Text style={styles.addHeaderText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>▣</Text>
            <Text style={styles.statLabel}>Total Produk</Text>
            <Text style={styles.statNumber}>{products.length}</Text>
          </View>
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.warningIcon}>⚠</Text>
            <Text style={styles.statLabel}>Stok Menipis</Text>
            <Text style={[styles.statNumber, styles.warningNumber]}>{lowStockCount}</Text>
          </View>
          <View style={[styles.statCard, styles.outCard]}>
            <Text style={styles.outIcon}>!</Text>
            <Text style={styles.statLabel}>Stok Habis</Text>
            <Text style={[styles.statNumber, styles.outNumber]}>{outStockCount}</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama produk..."
            placeholderTextColor="#89958E"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clearText}>✕</Text></TouchableOpacity>}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Produk</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
            <Text style={styles.addButtonText}>＋ Tambah</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {['Semua', 'Pod', 'Mod', 'Liquid', 'Coil', 'Aksesori'].map((item) => (
            <TouchableOpacity key={item} style={[styles.filterChip, categoryFilter === item && styles.filterChipActive]} onPress={() => setCategoryFilter(item)}>
              <Text style={[styles.filterText, categoryFilter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map((product) => {
          const quantity = Number(product.stock);
          const stockLabel = quantity <= 0 ? 'Stok habis' : quantity <= 5 ? `Stok menipis: ${quantity} unit` : `Stok: ${quantity} unit`;
          const stockColor = quantity <= 0 ? '#C43D3D' : quantity <= 5 ? '#B77909' : GREEN;
          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageWrap}>
                <Image source={product.image} style={styles.productImage} resizeMode="contain" />
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.categoryLabel}>{product.category}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.price}>{rupiah(product.price)}</Text>
                <Text style={[styles.stockLabel, { color: stockColor }]}>{stockLabel}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditForm(product)}>
                    <Text style={styles.editButtonText}>✎ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.stockButton} onPress={() => openEditForm(product)}>
                    <Text style={styles.stockButtonText}>▣ Stok</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteProduct(product)}>
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptyText}>Coba kata kunci atau kategori lain.</Text>
          </View>
        )}

        {formVisible && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingId ? 'Edit Produk' : 'Tambah Produk'}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}><Text style={styles.closeForm}>✕</Text></TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Nama produk</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Masukkan nama produk" placeholderTextColor="#89958E" />
            <Text style={styles.inputLabel}>Kategori</Text>
            <View style={styles.categoryOptions}>
              {['Pod', 'Mod', 'Liquid', 'Coil', 'Aksesori'].map((item) => (
                <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.categoryOption, category === item && styles.categoryOptionActive]}>
                  <Text style={[styles.categoryOptionText, category === item && styles.categoryOptionTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.inputLabel}>Harga (angka rupiah)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Contoh: 150000" keyboardType="numeric" placeholderTextColor="#89958E" />
            <Text style={styles.inputLabel}>Stok</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="Jumlah stok" keyboardType="numeric" placeholderTextColor="#89958E" />
            <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
              <Text style={styles.saveButtonText}>{editingId ? 'Simpan Perubahan' : 'Simpan Produk'}</Text>
            </TouchableOpacity>
            <Text style={styles.formNote}>Data saat ini masih tersimpan sementara di state aplikasi, belum ke database.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: { minHeight: 72, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E9EEE9', gap: 12 },
  backButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: LIGHT_GREEN, alignItems: 'center', justifyContent: 'center' },
  backText: { color: GREEN, fontSize: 32, lineHeight: 34 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { color: DARK, fontSize: 19, fontWeight: '800' },
  headerSubtitle: { color: '#7D8C82', fontSize: 11, marginTop: 3 },
  addHeaderButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  addHeaderText: { color: '#FFFFFF', fontSize: 25, lineHeight: 28 },
  content: { padding: 16, paddingBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statCard: { flex: 1, minHeight: 104, borderRadius: 15, backgroundColor: LIGHT_GREEN, padding: 10, justifyContent: 'center' },
  warningCard: { backgroundColor: '#FFF2D9' },
  outCard: { backgroundColor: '#FBE8E8' },
  statIcon: { color: GREEN, fontSize: 17, marginBottom: 4 },
  warningIcon: { color: '#A86B00', fontSize: 17, marginBottom: 4 },
  outIcon: { color: '#C43D3D', fontSize: 17, marginBottom: 4 },
  statLabel: { color: '#52645A', fontSize: 10 },
  statNumber: { color: GREEN, fontSize: 22, fontWeight: '800', marginTop: 2 },
  warningNumber: { color: '#A86B00' },
  outNumber: { color: '#C43D3D' },
  searchBox: { height: 46, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5EAE5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 22 },
  searchIcon: { color: GREEN, fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: DARK },
  clearText: { color: GREEN, paddingHorizontal: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: DARK, fontSize: 17, fontWeight: '800' },
  addButton: { backgroundColor: GREEN, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  addButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  filters: { gap: 8, paddingBottom: 16 },
  filterChip: { borderWidth: 1, borderColor: '#DDE5DE', backgroundColor: '#FFFFFF', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 },
  filterChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterText: { color: '#647268', fontSize: 11, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  productCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 11, marginBottom: 12, borderWidth: 1, borderColor: '#E8EDE8', gap: 12 },
  productImageWrap: { width: 98, height: 112, borderRadius: 12, backgroundColor: LIGHT_GREEN, padding: 8, alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: '100%' },
  productDetails: { flex: 1, justifyContent: 'center' },
  categoryLabel: { color: '#7D8C82', fontSize: 10, marginBottom: 3 },
  productName: { color: DARK, fontSize: 13, fontWeight: '800', marginBottom: 5 },
  price: { color: GREEN, fontSize: 13, fontWeight: '800', marginBottom: 5 },
  stockLabel: { fontSize: 11, fontWeight: '700', marginBottom: 9 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  editButton: { backgroundColor: LIGHT_GREEN, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7 },
  editButtonText: { color: GREEN, fontSize: 10, fontWeight: '700' },
  stockButton: { backgroundColor: '#FFF2D9', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7 },
  stockButtonText: { color: '#93600A', fontSize: 10, fontWeight: '700' },
  deleteButton: { backgroundColor: '#FBE8E8', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7 },
  deleteButtonText: { color: '#C43D3D', fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 28, gap: 8 },
  emptyTitle: { color: DARK, fontSize: 16, fontWeight: '700' },
  emptyText: { color: '#748078', fontSize: 12 },
  formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE7DE', borderRadius: 16, padding: 15, marginTop: 12, gap: 8 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  formTitle: { color: DARK, fontSize: 17, fontWeight: '800' },
  closeForm: { color: '#718078', fontSize: 18, padding: 4 },
  inputLabel: { color: DARK, fontSize: 12, fontWeight: '700', marginTop: 4 },
  input: { minHeight: 43, borderWidth: 1, borderColor: '#DDE5DE', borderRadius: 10, paddingHorizontal: 11, color: DARK, fontSize: 13, backgroundColor: '#FCFDFC' },
  categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  categoryOption: { borderWidth: 1, borderColor: '#DDE5DE', borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  categoryOptionActive: { backgroundColor: LIGHT_GREEN, borderColor: GREEN },
  categoryOptionText: { color: '#647268', fontSize: 11 },
  categoryOptionTextActive: { color: GREEN, fontWeight: '700' },
  saveButton: { backgroundColor: GREEN, borderRadius: 10, alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  formNote: { color: '#879289', fontSize: 10, lineHeight: 15, marginTop: 3 },
});
