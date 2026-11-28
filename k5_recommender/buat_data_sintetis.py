#!/usr/bin/env python3
"""
buat_data_sintetis.py
Membuat data.csv sintetis dari UUID produk dan user nyata di Supabase.

Cara pakai:
    python k5_recommender/buat_data_sintetis.py

Env yang dibutuhkan: EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY
(dibaca otomatis dari Kelompok5/.env)
"""
import csv
import os
import random
import sys
import urllib.request
import json

HERE = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(HERE, "..", "Kelompok5", ".env")

# ── Baca .env ────────────────────────────────────────────────────────────────
env = {}
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()

SUPABASE_URL = env.get("EXPO_PUBLIC_SUPABASE_URL", "").strip()
SUPABASE_KEY = env.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "").strip()

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit("[error] EXPO_PUBLIC_SUPABASE_URL / ANON_KEY tidak ditemukan di .env")


def fetch(endpoint: str) -> list:
    url = SUPABASE_URL.rstrip("/") + endpoint
    req = urllib.request.Request(
        url,
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


# ── Ambil produk aktif ────────────────────────────────────────────────────────
print("[fetch] Mengambil produk dari Supabase…")
produk_rows = fetch("/rest/v1/products?select=id,nama&is_active=eq.true&limit=200")
item_ids = [r["id"] for r in produk_rows]
print(f"[data]  {len(item_ids)} produk aktif ditemukan")
if len(item_ids) < 2:
    sys.exit("[error] Minimal 2 produk aktif di Supabase untuk membuat data sintetis.")

# ── Ambil pelanggan (tabel profiles — mungkin diblokir RLS) ──────────────────
print("[fetch] Mencoba ambil pelanggan dari Supabase…")
try:
    profil_rows = fetch("/rest/v1/profiles?select=id,peran&peran=eq.pelanggan&limit=200")
    user_ids = [r["id"] for r in profil_rows]
    print(f"[data]  {len(user_ids)} pelanggan ditemukan")
except Exception as e:
    print(f"[warn]  Tidak bisa baca profiles ({e}). Menggunakan UUID sintetis.")
    user_ids = []

# Kalau tidak ada user dari DB, buat UUID sintetis
if not user_ids:
    import uuid
    n_user_sintetis = 15
    user_ids = [str(uuid.uuid4()) for _ in range(n_user_sintetis)]
    print(f"[data]  Membuat {n_user_sintetis} user sintetis (UUID acak)")
    print("[warn]  Karena user UUID tidak nyata, rekomendasi.sql tidak bisa dipakai")
    print("        langsung. Ini hanya untuk demo tampilan halaman admin.")

# ── Generate interaksi acak ───────────────────────────────────────────────────
random.seed(42)
MIN_INTERAKSI = max(30, len(user_ids) * 3)

rows = []
for uid in user_ids:
    # Setiap user berinteraksi dengan 2–5 produk acak
    n = random.randint(2, min(5, len(item_ids)))
    for item_id in random.sample(item_ids, n):
        # Bisa lebih dari satu interaksi (view + cart + beli)
        for _ in range(random.randint(1, 3)):
            rows.append({"user_id": uid, "item_id": item_id})

# Pastikan minimal 30 baris
while len(rows) < 30:
    uid = random.choice(user_ids)
    item_id = random.choice(item_ids)
    rows.append({"user_id": uid, "item_id": item_id})

print(f"[data]  {len(rows)} baris interaksi dibuat")

# ── Tulis data.csv ────────────────────────────────────────────────────────────
out_path = os.path.join(HERE, "data.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["user_id", "item_id"])
    writer.writeheader()
    writer.writerows(rows)

print(f"[ok]    Tersimpan: {out_path}")
print(f"[ok]    {len(set(r['user_id'] for r in rows))} user, "
      f"{len(set(r['item_id'] for r in rows))} item")
print()
print("Langkah selanjutnya:")
print("  python k5_recommender/train.py --data k5_recommender/data.csv")
