// scripts/perbaiki-dist.js
// Netlify (seret-dan-lepas) bermasalah dengan font ikon hasil build web:
//   1) folder bernama "node_modules" diabaikan, dan
//   2) folder berawalan "@" (mis. "@expo") ikut tidak tersaji (404).
// Akibatnya ikon (Ionicons dll.) tampil sebagai kotak kosong.
// Skrip ini mengganti nama dist/assets/node_modules menjadi dist/assets/vendor,
// membuang tanda "@" di nama folder tingkat pertama (@expo -> expo),
// lalu memperbarui semua rujukannya di file hasil build.
//
// Cara pakai (setelah `npx expo export --platform web`):
//   node scripts/perbaiki-dist.js

const fs = require("fs");
const path = require("path");

const dist = path.resolve(
  process.argv[2] || path.join(__dirname, "..", "dist"),
);
const lama = path.join(dist, "assets", "node_modules");
const baru = path.join(dist, "assets", "vendor");

if (!fs.existsSync(dist)) {
  console.error(
    "Folder dist tidak ditemukan. Jalankan dulu: npx expo export --platform web",
  );
  process.exit(1);
}
if (!fs.existsSync(lama)) {
  console.log(
    "Tidak ada assets/node_modules di dist, tidak ada yang perlu diperbaiki.",
  );
  process.exit(0);
}

// 1) node_modules -> vendor
fs.renameSync(lama, baru);

// 2) @expo -> expo (hanya folder tingkat pertama yang berawalan "@")
const folderAt = fs
  .readdirSync(baru)
  .filter(
    (n) => n.startsWith("@") && fs.statSync(path.join(baru, n)).isDirectory(),
  );
for (const n of folderAt) {
  fs.renameSync(path.join(baru, n), path.join(baru, n.slice(1)));
}

// 3) Perbarui rujukan di file teks
let diperbarui = 0;
(function telusuri(dir) {
  for (const nama of fs.readdirSync(dir)) {
    const p = path.join(dir, nama);
    if (fs.statSync(p).isDirectory()) {
      telusuri(p);
      continue;
    }
    if (!/\.(js|html|json|css|map|txt)$/i.test(nama)) continue;
    const isi = fs.readFileSync(p, "utf8");
    if (!isi.includes("assets/node_modules")) continue;
    let hasil = isi;
    for (const n of folderAt) {
      hasil = hasil
        .split(`assets/node_modules/${n}/`)
        .join(`assets/vendor/${n.slice(1)}/`);
    }
    hasil = hasil.split("assets/node_modules").join("assets/vendor");
    fs.writeFileSync(p, hasil);
    diperbarui++;
  }
})(dist);

console.log(
  `Selesai: assets/node_modules -> assets/vendor, folder "@" diganti: ${folderAt.join(", ") || "-"} (${diperbarui} file diperbarui).`,
);
