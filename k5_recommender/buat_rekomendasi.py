#!/usr/bin/env python3
"""
buat_rekomendasi.py — Langkah 5 (K5 Rekomendasi, VapeStore)

Membaca model hasil train.py (model.tflite) + data.csv, lalu membuat
5 produk rekomendasi untuk tiap pengguna di data latih.

Hasil: rekomendasi.sql  -> ditempel di Supabase SQL Editor (Run).
       Isinya mengisi tabel `rekomendasi` dan `produk_populer`.

Cara pakai (dari folder k5_recommender, setelah train.py selesai):
    python buat_rekomendasi.py --data data.csv

Catatan penting:
- Nomor urut user & produk dibentuk dengan CARA YANG SAMA seperti train.py
  (diurutkan abjad dari data.csv). Jadi pakai data.csv yang SAMA dengan
  saat melatih. Kalau data.csv berubah, latih ulang dulu.
- Produk yang sudah pernah dilihat/dibeli pengguna tidak direkomendasikan lagi.
"""
import argparse
import csv
import os
import sys

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np  # noqa: E402
import tensorflow as tf  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
TOP_N = 5

ap = argparse.ArgumentParser(description="Buat rekomendasi dari model.tflite")
ap.add_argument("--data", default=os.path.join(HERE, "data.csv"),
                help="CSV user_id,item_id yang sama dengan saat melatih")
ap.add_argument("--model", default=os.path.join(HERE, "model.tflite"))
ap.add_argument("--out", default=os.path.join(HERE, "rekomendasi.sql"))
args = ap.parse_args()

# ---- baca data (sama dengan load_real_csv di train.py) ----
with open(args.data, newline="", encoding="utf-8") as f:
    rows = [r for r in csv.DictReader(f) if r.get("user_id")]
if not rows:
    sys.exit("[error] data.csv kosong.")
users = sorted({r["user_id"] for r in rows})
items = sorted({r["item_id"] for r in rows})
umap = {u: i for i, u in enumerate(users)}
imap = {it: i for i, it in enumerate(items)}
seen = {}
for r in rows:
    seen.setdefault(umap[r["user_id"]], set()).add(imap[r["item_id"]])
n_user, n_item = len(users), len(items)
print(f"[data] user={n_user} item={n_item} baris={len(rows)}")

# ---- muat model ----
interp = tf.lite.Interpreter(model_path=args.model)
inputs = interp.get_input_details()
by_name = {}
for d in inputs:
    nm = d["name"].lower()
    if "user" in nm:
        by_name["user"] = d
    elif "item" in nm:
        by_name["item"] = d
if set(by_name) != {"user", "item"}:
    sys.exit(f"[error] input model tidak dikenali: {[d['name'] for d in inputs]}")
interp.resize_tensor_input(by_name["user"]["index"], [n_item])
interp.resize_tensor_input(by_name["item"]["index"], [n_item])
interp.allocate_tensors()
out_idx = interp.get_output_details()[0]["index"]
all_items = np.arange(n_item, dtype=np.int32)


def skor_semua_item(u: int) -> np.ndarray:
    interp.set_tensor(by_name["user"]["index"], np.full(n_item, u, dtype=np.int32))
    interp.set_tensor(by_name["item"]["index"], all_items)
    interp.invoke()
    return interp.get_tensor(out_idx).ravel()


# ---- rekomendasi per user ----
rek = []  # (kode_user, item_id, peringkat)
kosong = 0
for u, kode in enumerate(users):
    s = skor_semua_item(u)
    urut = [int(i) for i in np.argsort(-s) if int(i) not in seen.get(u, set())][:TOP_N]
    if not urut:
        kosong += 1
    for rank, i in enumerate(urut, start=1):
        rek.append((kode, items[i], rank))
print(f"[rekomendasi] {len(rek)} baris untuk {n_user - kosong} user "
      f"({kosong} user tanpa sisa produk)")

# ---- produk terpopuler (jumlah user berbeda yang berinteraksi) ----
hitung = {}
for u_set in seen.values():
    for i in u_set:
        hitung[i] = hitung.get(i, 0) + 1
populer = sorted(hitung.items(), key=lambda x: (-x[1], items[x[0]]))[:TOP_N]


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


# ---- tulis SQL ----
sql = ["-- Dibuat oleh buat_rekomendasi.py. Tempel di Supabase SQL Editor lalu Run.",
       f"-- Sumber data: {os.path.basename(args.data)} ({n_user} user, {n_item} produk)",
       "begin;",
       "delete from public.rekomendasi;"]
if rek:
    vals = ",\n  ".join(f"({q(k)}, {q(it)}, {r})" for k, it, r in rek)
    sql.append(
        "insert into public.rekomendasi (user_id, item_id, peringkat)\n"
        "select pm.user_id, v.item_id, v.peringkat\n"
        f"from (values\n  {vals}\n) as v(kode, item_id, peringkat)\n"
        "join public.pemetaan_user pm on pm.kode = v.kode;")
sql.append("delete from public.produk_populer;")
if populer:
    vals = ",\n  ".join(f"({q(items[i])}, {rk}, {n})"
                        for rk, (i, n) in enumerate(populer, start=1))
    sql.append("insert into public.produk_populer (item_id, peringkat, jumlah_user)\n"
               f"values\n  {vals};")
sql.append("commit;")
with open(args.out, "w", encoding="utf-8") as f:
    f.write("\n".join(sql) + "\n")
print(f"[ok] tersimpan: {args.out}")
print("[lanjut] Tempel isi rekomendasi.sql di Supabase SQL Editor, lalu Run.")
