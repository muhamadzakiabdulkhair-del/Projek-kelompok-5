import type { ImageSourcePropType } from "react-native";

export type Category = "Pod" | "Mod" | "Liquid" | "Coil" | "Aksesori";

export type Product = {
  id: string;
  name: string;
  sub: string;
  category: Category;
  price: number;
  stock: number;
  rating: number;
  reviews: number;
  description: string;
  image: ImageSourcePropType;
};

export const CATEGORIES: Category[] = ["Pod", "Mod", "Liquid", "Coil", "Aksesori"];

export const CATEGORY_IMAGES: Record<Category, ImageSourcePropType> = {
  Pod: require("../../assets/images/Pod.png"),
  Mod: require("../../assets/images/Mod.png"),
  Liquid: require("../../assets/images/Liquid.png"),
  Coil: require("../../assets/images/Coil.png"),
  Aksesori: require("../../assets/images/Coil.png"),
};

// Data dummy (UTS tidak menilai pengolahan data).
export const PRODUCTS: Product[] = [
  {
    id: "1", name: "Uwell Caliburn G2", sub: "Pod System · Hitam", category: "Pod",
    price: 450000, stock: 15, rating: 4.9, reviews: 100, image: CATEGORY_IMAGES.Pod,
    description: "Pod system ringkas dengan baterai 750 mAh dan pengisian USB-C. Cocok untuk pemula yang ingin perangkat praktis dan irit.",
  },
  {
    id: "2", name: "Vaporesso XROS 3", sub: "Pod System", category: "Pod",
    price: 550000, stock: 20, rating: 4.7, reviews: 99, image: CATEGORY_IMAGES.Pod,
    description: "Pod system dengan airflow adjustable dan kapasitas pod 2 ml. Rasa tajam dengan konsumsi liquid yang hemat.",
  },
  {
    id: "3", name: "Liquid Naked 100", sub: "Strawberry 60ml", category: "Liquid",
    price: 150000, stock: 35, rating: 4.8, reviews: 55, image: CATEGORY_IMAGES.Liquid,
    description: "Liquid freebase rasa stroberi segar, botol 60 ml. Tersedia kadar nikotin rendah hingga sedang.",
  },
  {
    id: "4", name: "Coil Geekvape", sub: "Pack 4", category: "Coil",
    price: 120000, stock: 4, rating: 4.6, reviews: 40, image: CATEGORY_IMAGES.Coil,
    description: "Coil pengganti isi 4 pcs, kompatibel dengan seri Geekvape Aegis. Menjaga rasa tetap konsisten.",
  },
  {
    id: "5", name: "Voopoo Drag X", sub: "Mod", category: "Mod",
    price: 1200000, stock: 10, rating: 4.9, reviews: 76, image: CATEGORY_IMAGES.Mod,
    description: "Mod 80 W dengan chip GENE.TT, layar jelas, dan body kokoh. Pilihan favorit pengguna menengah.",
  },
  {
    id: "6", name: "Geekvape Aegis", sub: "Mod", category: "Mod",
    price: 1350000, stock: 8, rating: 4.8, reviews: 61, image: CATEGORY_IMAGES.Mod,
    description: "Mod tahan air dan benturan (IP68) dengan dukungan dual baterai 18650. Cocok untuk penggunaan harian yang berat.",
  },
  {
    id: "7", name: "Kapas Cotton Bacon", sub: "Aksesori", category: "Aksesori",
    price: 35000, stock: 0, rating: 4.5, reviews: 28, image: CATEGORY_IMAGES.Aksesori,
    description: "Kapas organik untuk rebuildable atomizer. Daya serap tinggi dan tidak meninggalkan rasa.",
  },
  {
    id: "8", name: "Cartridge Pod Pengganti", sub: "Isi 2 pcs", category: "Aksesori",
    price: 60000, stock: 25, rating: 4.4, reviews: 33, image: CATEGORY_IMAGES.Aksesori,
    description: "Cartridge pod pengganti isi 2 pcs untuk seri Caliburn. Pasang tanpa alat.",
  },
];

export function findProduct(id?: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatRupiah(value: number) {
  return "Rp " + (Number(value) || 0).toLocaleString("id-ID");
}
