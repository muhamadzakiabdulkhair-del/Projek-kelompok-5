#!/usr/bin/env python3
"""
K5 Chikara Bake — Rekomendasi Produk Personal (arsitektur base mobile).

Arsitektur : user embedding (16) + item embedding (16) -> dot product -> sigmoid
             (implicit feedback; hybrid-ready: fitur konten bisa digabung ke
             item embedding). Ringan untuk on-device: simpan kedua matriks
             embedding, inferensi = dot product.
Data      : sintetis (seeded) bila --data tidak diisi.
            Data REAL: CSV dengan kolom user_id,item_id
            (satu baris = satu interaksi positif: view/klik/cart/beli).
            Lihat data_template.csv.

Cara pakai : python k5_recommender/train.py [--data k5_recommender/data.csv]
Output     : k5_recommender/model.tflite , k5_recommender/metrics.json
"""
import argparse
import csv
import json
import os

import numpy as np

SEED = 42
np.random.seed(SEED)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf  # noqa: E402

tf.random.set_seed(SEED)

HERE = os.path.dirname(os.path.abspath(__file__))
DIM, K = 8, 5

ap = argparse.ArgumentParser(description="Latih model rekomendasi Chikara Bake")
ap.add_argument("--data", default=None,
                help="CSV data latih REAL: kolom user_id,item_id "
                     "(lihat data_template.csv). Kosongkan untuk sintetis.")
args = ap.parse_args()


def load_real_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r.get("user_id")]
    if len(rows) < 30:
        raise SystemExit(f"[error] data real terlalu sedikit ({len(rows)} baris). "
                         "Minimal 30 interaksi.")
    users = sorted({r["user_id"] for r in rows})
    items = sorted({r["item_id"] for r in rows})
    umap = {u: i for i, u in enumerate(users)}
    imap = {it: i for i, it in enumerate(items)}
    pos = {}
    for r in rows:
        u, it = umap[r["user_id"]], imap[r["item_id"]]
        pos.setdefault(u, set()).add(it)
    return pos, len(users), len(items)


def gen_sintetis():
    n_user, n_item = 120, 36
    U_true = np.random.normal(0, 1, (n_user, DIM))
    V_true = np.random.normal(0, 1, (n_item, DIM))
    affinity = 1 / (1 + np.exp(-(U_true @ V_true.T) * 1.5))
    pos = {u: set() for u in range(n_user)}
    for u in range(n_user):
        p = affinity[u] / affinity[u].sum()
        pos[u] = set(np.random.choice(n_item, size=12, replace=False, p=p))
    return pos, n_user, n_item


if args.data:
    pos, N_USER, N_ITEM = load_real_csv(args.data)
    print(f"[data] REAL dari {args.data}: user={N_USER} item={N_ITEM}")
else:
    pos, N_USER, N_ITEM = gen_sintetis()
    print(f"[data] SINTETIS: user={N_USER} item={N_ITEM}")

# train: positif + 3 negatif per positif
tu, ti, ty = [], [], []
for u, items in pos.items():
    for i in items:
        tu.append(u)
        ti.append(i)
        ty.append(1)
        neg = np.random.choice([j for j in range(N_ITEM) if j not in items],
                               size=min(3, N_ITEM - len(items)), replace=False)
        for j in neg:
            tu.append(u)
            ti.append(j)
            ty.append(0)
tu, ti, ty = map(np.array, (tu, ti, ty))
idx = np.random.permutation(len(ty))
tu, ti, ty = tu[idx], ti[idx], ty[idx].astype(float)

# test: tahan 2 item per maksimal 20 user (yang punya >=3 interaksi)
cand = [u for u in pos if len(pos[u]) >= 3]
n_test = min(20, len(cand))
test_users = np.random.choice(cand, n_test, replace=False)
test_pos = {}
tr_mask = np.ones(len(ty), bool)
for u in test_users:
    held = list(pos[u])[:2]
    test_pos[u] = held
    drop = [k for k in range(len(ty)) if tu[k] == u and ti[k] in held and ty[k] == 1]
    tr_mask[drop] = False
tu_tr, ti_tr, ty_tr = tu[tr_mask], ti[tr_mask], ty[tr_mask]
print(f"[data] train_interactions={len(ty_tr)} | test_users={len(test_users)}")

# ---- model ----
u_in = tf.keras.layers.Input(shape=(), dtype=tf.int32, name="user")
i_in = tf.keras.layers.Input(shape=(), dtype=tf.int32, name="item")
u_emb = tf.keras.layers.Embedding(N_USER, 16)(u_in)
i_emb = tf.keras.layers.Embedding(N_ITEM, 16)(i_in)
dot = tf.keras.layers.Dot(axes=1)([u_emb, i_emb])
out = tf.keras.layers.Activation("sigmoid")(dot)
model = tf.keras.Model([u_in, i_in], out)
model.compile(optimizer="adam", loss="binary_crossentropy")
model.fit([tu_tr, ti_tr], ty_tr, epochs=20, batch_size=256, verbose=0)


# ---- evaluasi Precision@K / Recall@K ----
def pr_at_k(k=K):
    ps, rs = [], []
    items_all = np.arange(N_ITEM)
    for u in test_users:
        s = model.predict([np.full(N_ITEM, u), items_all], verbose=0).ravel()
        topk = set(np.argsort(s)[-k:][::-1])
        hits = len(topk & set(test_pos[u]))
        ps.append(hits / k)
        rs.append(hits / len(test_pos[u]))
    return float(np.mean(ps)), float(np.mean(rs))


p5, r5 = pr_at_k()
metrics = {"precision@5": p5, "recall@5": r5,
           "n_test_users": int(len(test_users)),
           "n_users": N_USER, "n_items": N_ITEM,
           "data_source": args.data or "sintetis"}
print(f"[eval] P@5={p5:.3f} R@5={r5:.3f}")

converter = tf.lite.TFLiteConverter.from_keras_model(model)
with open(os.path.join(HERE, "model.tflite"), "wb") as f:
    f.write(converter.convert())
with open(os.path.join(HERE, "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)
print("[ok] tersimpan: model.tflite, metrics.json")
print("[integrasi] Di HP: untuk user u, skor semua item = dot(user_emb[u], "
      "item_emb) -> urutkan -> top-N. Cold-start: fallback ke item populer.")
