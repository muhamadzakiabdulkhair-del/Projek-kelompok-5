import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ====== Konfigurasi ======
// Ganti dengan URL backend kamu (endpoint transaksi)
const API_URL = 'http://localhost:3000/api';
const ONGKOS_KIRIM = 15000;

type CartItem = {
  id: string;
  nama: string;
  varian: string;
  harga: number;
  qty: number;
  gambar?: ImageSourcePropType;
};

type PaymentMethod = 'TRANSFER_BANK' | 'QRIS' | 'COD';

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'TRANSFER_BANK', label: 'Transfer Bank', icon: 'card-outline' },
  { key: 'QRIS', label: 'QRIS', icon: 'qr-code-outline' },
  { key: 'COD', label: 'COD (Bayar di Tempat)', icon: 'cash-outline' },
];

// Data awal (sementara). Nanti ganti dengan data dari API / state global.
const INITIAL_ITEMS: CartItem[] = [
  {
    id: '1',
    nama: 'Uwell Caliburn G2',
    varian: 'Pod System – Hitam',
    harga: 450000,
    qty: 1,
  },
  {
    id: '2',
    nama: 'Liquid Naked 100',
    varian: 'Strawberry 60ml',
    harga: 150000,
    qty: 1,
  },
  {
    id: '3',
    nama: 'Coil Uwell Caliburn G2',
    varian: '(Pack 4)',
    harga: 120000,
    qty: 1,
  },
];

const formatRupiah = (n: number) =>
  'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function Keranjang() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [payment, setPayment] = useState<PaymentMethod>('TRANSFER_BANK');
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.harga * it.qty, 0),
    [items]
  );
  const ongkir = items.length > 0 ? ONGKOS_KIRIM : 0;
  const total = subtotal + ongkir;
  const totalBarang = items.reduce((sum, it) => sum + it.qty, 0);

  const ubahQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );
  };

  const hapusItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Keranjang kosong', 'Tambahkan produk terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      // Buat pesanan di backend
      const res = await fetch(`${API_URL}/pesanan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // TODO: sertakan token auth bila backend memerlukan
        body: JSON.stringify({
          items: items.map((it) => ({
            produkId: it.id,
            qty: it.qty,
            harga: it.harga,
          })),
          metodePembayaran: payment,
          subtotal,
          ongkosKirim: ongkir,
          total,
        }),
      });

      if (!res.ok) throw new Error('Gagal membuat pesanan');
      const data = await res.json();

      setItems([]);
      Alert.alert(
        'Pesanan dibuat',
        `Nomor pesanan: ${data?.id ?? '-'}\nMetode: ${
          PAYMENT_OPTIONS.find((p) => p.key === payment)?.label
        }`
      );
      // router.push('/pesanan'); // aktifkan jika halaman Pesanan sudah ada
    } catch (e: any) {
      Alert.alert('Checkout gagal', e?.message ?? 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Keranjang</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Daftar item */}
        {items.length === 0 && (
          <Text style={styles.empty}>Keranjang kamu masih kosong.</Text>
        )}

        {items.map((it) => (
          <View key={it.id} style={styles.card}>
            <View style={styles.thumb}>
              {it.gambar ? (
                <Image source={it.gambar} style={styles.thumbImg} />
              ) : (
                <Ionicons name="image-outline" size={28} color="#bbb" />
              )}
            </View>

            <View style={styles.info}>
              <Text style={styles.nama} numberOfLines={1}>
                {it.nama}
              </Text>
              <Text style={styles.varian}>{it.varian}</Text>
              <Text style={styles.harga}>{formatRupiah(it.harga)}</Text>
            </View>

            <View style={styles.right}>
              <Pressable onPress={() => hapusItem(it.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color="#777" />
              </Pressable>

              <View style={styles.qtyBox}>
                <Pressable onPress={() => ubahQty(it.id, -1)} hitSlop={6}>
                  <Ionicons name="remove" size={18} color="#222" />
                </Pressable>
                <Text style={styles.qtyText}>{it.qty}</Text>
                <Pressable onPress={() => ubahQty(it.id, 1)} hitSlop={6}>
                  <Ionicons name="add" size={18} color="#222" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {/* Ringkasan */}
        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.muted}>Subtotal ({totalBarang} barang)</Text>
            <Text style={styles.muted}>{formatRupiah(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>Ongkos Kirim</Text>
            <Text style={styles.muted}>{formatRupiah(ongkir)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
          </View>

          <Pressable
            style={[
              styles.checkoutBtn,
              (loading || items.length === 0) && { opacity: 0.6 },
            ]}
            onPress={handleCheckout}
            disabled={loading || items.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutText}>Checkout</Text>
            )}
          </Pressable>
        </View>

        {/* Metode pembayaran */}
        <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
        {PAYMENT_OPTIONS.map((opt) => {
          const selected = payment === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={styles.payRow}
              onPress={() => setPayment(opt.key)}
            >
              <Ionicons name={opt.icon} size={26} color="#1f4fa3" />
              <Text style={styles.payLabel}>{opt.label}</Text>
              <View style={[styles.radio, selected && styles.radioActive]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#0f8a4b';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  empty: { textAlign: 'center', color: '#888', marginVertical: 24 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    gap: 12,
  },
  thumb: {
    width: 72,
    height: 88,
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  info: { flex: 1, gap: 4 },
  nama: { fontSize: 15, fontWeight: '700', color: '#111' },
  varian: { fontSize: 12, color: '#888' },
  harga: { fontSize: 15, fontWeight: '700', color: '#111', marginTop: 6 },
  right: { alignItems: 'flex-end', justifyContent: 'space-between', height: 88 },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyText: { fontSize: 15, fontWeight: '600', minWidth: 14, textAlign: 'center' },

  summary: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    gap: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { fontSize: 13, color: '#666' },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#111' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#111' },
  checkoutBtn: {
    marginTop: 12,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, color: '#111' },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  payLabel: { flex: 1, fontSize: 14, color: '#222' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: GREEN },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
});