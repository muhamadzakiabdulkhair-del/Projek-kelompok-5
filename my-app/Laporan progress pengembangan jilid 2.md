# LAPORAN PROGRESS PENGEMBANGAN APLIKASI MOBILE VAPESTORE

## 1. Pendahuluan

Pengembangan aplikasi mobile VapeStore merupakan proyek yang bertujuan untuk mempermudah proses penjualan produk vape, pengelolaan stok barang, pencatatan transaksi, serta penyusunan laporan penjualan. Aplikasi ini direncanakan untuk membantu pemilik usaha dan karyawan dalam mengelola operasional toko secara lebih efektif dan terorganisasi.

Sebagai langkah awal dalam pengembangan sistem, tim telah melakukan wawancara dengan pemilik VapeStore untuk mengetahui proses bisnis yang sedang berjalan, kendala yang dihadapi, serta kebutuhan terhadap aplikasi yang akan dikembangkan.

Hasil wawancara tersebut menjadi dasar dalam menentukan kebutuhan awal dan ruang lingkup pengembangan aplikasi.

## 2. Tujuan Wawancara

Wawancara dilakukan dengan tujuan:

1. Mengetahui proses penjualan VapeStore yang berjalan saat ini.
2. Mengidentifikasi produk yang dijual dan cara pengelolaan stok.
3. Memahami proses pemesanan dan pembayaran pelanggan.
4. Mengetahui kendala dalam kegiatan operasional toko.
5. Mengidentifikasi kebutuhan pemilik dan karyawan terhadap aplikasi mobile.
6. Menentukan fitur awal yang perlu diprioritaskan dalam pengembangan sistem.

## 3. Pelaksanaan Wawancara

Wawancara dilakukan dengan pemilik VapeStore sebagai narasumber. Pertanyaan yang diajukan mencakup proses penjualan, jenis produk, pengelolaan stok, metode pemesanan, pembayaran, pembagian tugas pengguna, dan fitur yang diharapkan tersedia pada aplikasi.

Selain itu, tim juga menggali kendala yang dialami dalam pengelolaan produk, stok, harga, transaksi penjualan, dan penyampaian informasi produk kepada pelanggan.

## 4. Hasil Wawancara

Berdasarkan hasil wawancara, diperoleh beberapa informasi mengenai kondisi operasional VapeStore saat ini.

### 4.1 Proses Penjualan

Penjualan VapeStore masih dilakukan secara offline, yaitu pelanggan datang langsung ke toko. Selain itu, pelanggan juga dapat melakukan pemesanan melalui WhatsApp.

Produk yang dijual meliputi device pod, mod, liquid, coil, kapas, cartridge, dan berbagai perlengkapan vape lainnya.

### 4.2 Pengelolaan Produk dan Stok

Pengelolaan stok saat ini dilakukan dengan memperhatikan jumlah barang yang tersedia di etalase. Apabila stok barang kosong atau mulai menipis, pemilik atau karyawan akan melakukan pemesanan barang kepada distributor.

Salah satu kendala yang dihadapi adalah ketika produk yang banyak diminati pelanggan ternyata tidak tersedia di distributor. Kondisi tersebut dapat menghambat pemenuhan permintaan pelanggan.

### 4.3 Pemesanan dan Pembayaran

Pelanggan melakukan pembelian dengan datang langsung ke toko atau menghubungi toko melalui WhatsApp.

Metode pembayaran yang digunakan saat ini meliputi:

- Pembayaran tunai (cash).
- Transfer bank.
- QRIS.

Untuk pembayaran melalui transfer bank atau QRIS, pemilik atau karyawan melakukan pengecekan melalui bukti atau informasi pembayaran dari pelanggan dan saldo yang masuk ke rekening atau akun pembayaran toko.

Pada transaksi langsung, barang dibawa oleh pelanggan setelah pembelian dilakukan.

### 4.4 Pengguna Sistem

Berdasarkan wawancara, pengguna internal yang disebutkan oleh pemilik adalah:

1. **Owner:** mengelola usaha, memantau stok, melihat transaksi, dan memperoleh laporan penjualan.
2. **Karyawan:** membantu kegiatan operasional toko, melayani pelanggan, serta mengelola produk dan transaksi sesuai kewenangannya.

Kebutuhan dan hak akses masing-masing pengguna akan diperjelas pada tahap analisis sistem berikutnya.

### 4.5 Kebutuhan Aplikasi

Pemilik menyampaikan bahwa aplikasi diharapkan dapat memberikan kemudahan dalam:

- Pengelolaan pesanan pelanggan.
- Pembaruan data dan stok produk.
- Pengelolaan pembayaran.
- Pembuatan laporan penjualan harian.
- Pemantauan stok akhir.

Pemilik juga menyetujui bahwa terdapat kendala dalam pencatatan stok, pengelolaan pesanan, pembaruan harga produk, pencatatan transaksi, serta penyampaian informasi produk kepada pelanggan.

## 5. Analisis Permasalahan

Berdasarkan hasil wawancara, tim mengidentifikasi beberapa permasalahan utama.

| No. | Permasalahan                                                            | Kebutuhan Sistem                                                                |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | Stok masih dipantau melalui barang yang terpajang di etalase.           | Fitur pengelolaan dan pembaruan stok produk.                                    |
| 2   | Produk yang diminati pelanggan terkadang tidak tersedia di distributor. | Informasi stok yang lebih akurat untuk membantu pemantauan ketersediaan barang. |
| 3   | Pemesanan dilakukan melalui toko dan WhatsApp.                          | Pengelolaan pesanan pelanggan yang lebih terorganisasi.                         |
| 4   | Pembaruan harga dan informasi produk masih menjadi kendala.             | Fitur pengelolaan data produk dan harga.                                        |
| 5   | Pencatatan transaksi penjualan masih perlu diperbaiki.                  | Fitur pencatatan dan riwayat transaksi.                                         |
| 6   | Pemilik membutuhkan informasi penjualan dan stok akhir.                 | Fitur laporan penjualan harian dan laporan stok.                                |
| 7   | Informasi produk perlu disampaikan dengan lebih mudah kepada pelanggan. | Katalog produk digital yang memuat informasi dan ketersediaan produk.           |

Permasalahan tersebut menjadi dasar penyusunan kebutuhan fungsional aplikasi. Rancangan solusi masih perlu dikonfirmasi dan disesuaikan dengan proses kerja pemilik serta karyawan.

## 6. Progress Pengembangan Saat Ini

Pada tahap ini, pengembangan aplikasi masih berada dalam tahap awal, yaitu pengumpulan informasi dan analisis kebutuhan pengguna.

Progress yang telah dilakukan meliputi:

1. Melakukan persiapan wawancara dengan pemilik VapeStore.
2. Menyusun daftar pertanyaan terkait proses bisnis dan kebutuhan aplikasi.
3. Melaksanakan wawancara untuk mengetahui proses operasional toko.
4. Mengumpulkan informasi tentang penjualan, produk, stok, pemesanan, dan pembayaran.
5. Mengidentifikasi kendala yang dialami pemilik dalam kegiatan operasional.
6. Menyusun kebutuhan awal dan gambaran fitur yang akan dikembangkan.

Dengan demikian, hasil yang telah dicapai saat ini adalah terkumpulnya informasi awal sebagai dasar pengembangan sistem. Desain antarmuka, rancangan database, implementasi aplikasi, dan pengujian belum dinyatakan selesai pada tahap ini.

## 7. Rencana Pengembangan Selanjutnya

Setelah tahap wawancara, tim merencanakan beberapa kegiatan berikut:

1. **Analisis kebutuhan sistem:** menyusun kebutuhan fungsional dan nonfungsional berdasarkan hasil wawancara.
2. **Penyusunan alur sistem:** menggambarkan proses penggunaan aplikasi oleh owner, karyawan, dan pelanggan.
3. **Perancangan UI/UX:** membuat rancangan tampilan aplikasi mobile sesuai kebutuhan pengguna.
4. **Perancangan database:** menyusun struktur data produk, stok, pengguna, pesanan, transaksi, dan laporan.
5. **Pengembangan aplikasi:** mulai mengimplementasikan fitur yang telah disepakati.
6. **Integrasi dan pengujian:** memeriksa apakah setiap fitur berjalan sesuai kebutuhan.
7. **Evaluasi:** meminta masukan dari pemilik dan melakukan perbaikan berdasarkan hasil pengujian.

Prioritas awal yang diusulkan adalah pengelolaan produk dan stok, pencatatan transaksi, pengelolaan pesanan, serta laporan penjualan dan stok. Prioritas tersebut akan dikonfirmasi kembali bersama pemilik sebelum implementasi.

## 8. Kesimpulan

Berdasarkan hasil wawancara dengan pemilik VapeStore, diketahui bahwa proses penjualan saat ini masih dilakukan secara offline dan melalui WhatsApp. Pengelolaan stok, pembaruan harga, pencatatan transaksi, pengelolaan pesanan, serta penyampaian informasi produk masih menjadi beberapa kendala yang perlu diperhatikan.

Pemilik mengharapkan aplikasi mobile yang dapat membantu pengelolaan pesanan, pembaruan stok, sistem pembayaran, serta penyediaan laporan penjualan harian dan stok akhir.

Oleh karena itu, tahap wawancara ini menjadi langkah awal yang penting dalam pengembangan aplikasi VapeStore. Hasilnya akan digunakan sebagai dasar untuk menyusun kebutuhan sistem, merancang antarmuka dan database, serta menentukan prioritas implementasi pada tahap selanjutnya.
