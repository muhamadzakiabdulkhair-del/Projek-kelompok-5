# VapeStore

Aplikasi toko vape berbasis React Native dengan Expo, dibuat untuk UTS Pemrograman Mobile Kelompok 5.

## Deskripsi

VapeStore punya tiga alur pengguna: pelanggan yang belanja, karyawan yang mengelola produk dan pesanan, dan owner yang melihat dashboard serta laporan. Data masih dummy (mock) untuk keperluan tampilan.

## Daftar Screen

| Screen | Keterangan |
|---|---|
| Beranda (katalog) | Banner, kategori, dan daftar produk dua kolom (FlatList) |
| Detail produk | Info produk, tombol tambah ke keranjang |
| Keranjang | Daftar barang, metode bayar, checkout |
| Pesanan | Riwayat pesanan |
| Profil | Info akun |
| Login pelanggan / karyawan / owner | Form login dengan validasi dan pesan error |
| Dashboard owner | Kartu statistik dan tombol cepat |
| Laporan | Penjualan harian dan stok akhir |
| Kelola produk | Daftar produk (FlatList) dan statistik stok |
| Form tambah produk | Form dengan state focus dan error |

## Screenshot

| | |
|---|---|
| ![Beranda](docs/shots/01-beranda.png) | ![Detail produk](docs/shots/02-detail-produk.png) |
| ![Keranjang](docs/shots/03-keranjang.png) | ![Login](docs/shots/06-login-pelanggan.png) |
| ![Dashboard owner](docs/shots/09-dashboard-owner.png) | ![Kelola produk](docs/shots/11-kelola-produk.png) |

[Tambahkan screenshot lainnya sesuai kebutuhan]

## Komponen Reusable

- `AppButton`: tombol dengan variasi warna dan ikon
- `AppInput`: input dengan state focus dan pesan error
- `ProductCard`: kartu produk untuk FlatList
- `BottomNav`: navigasi bawah yang berbeda tiap role
- `ScreenHeader`: header dengan tombol kembali

## Cara Menjalankan

```bash
git clone [link-repo]
cd Kelompok5
npm install
npx expo start
```

Scan QR yang muncul di terminal dengan aplikasi **Expo Go** di HP.

Atau coba langsung lewat Expo Snack: [link-snack]

## Akun Demo

- Owner: `admin@vapestore.com` / `admin123`
- Karyawan: `karyawan@vapestore.com` / `karyawan123`
- Pelanggan: [isi akun atau tulis "daftar baru di halaman login"]

## Anggota Kelompok

- [Nama] ([NIM]): [bagian]
- [Nama] ([NIM]): [bagian]
- [Nama] ([NIM]): [bagian]
