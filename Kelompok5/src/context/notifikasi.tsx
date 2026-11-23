import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useAuth } from "@/context/auth";
import {
  fetchNotifikasi,
  hapusNotifikasi as hapusDiServer,
  rowToNotifikasi,
  tandaiDibaca as tandaiDiServer,
  tandaiSemuaDibaca as tandaiSemuaDiServer,
  type Notifikasi,
  type NotifikasiRow,
} from "@/services/notifikasiService";
import { supabase } from "../../lib/supabase";

type NotifikasiValue = {
  daftar: Notifikasi[];
  /** Jumlah yang belum dibaca (dari notifikasi yang sudah dimuat). */
  belumDibaca: number;
  memuat: boolean;
  galat: string | null;
  /** Notifikasi yang baru saja masuk lewat Realtime (bukan hasil muat awal). Dipakai untuk banner dan bunyi. */
  terbaru: Notifikasi | null;
  muatUlang: () => Promise<void>;
  tandaiDibaca: (id: string) => Promise<void>;
  tandaiSemuaDibaca: () => Promise<void>;
  hapus: (id: string) => Promise<void>;
};

const NotifikasiContext = createContext<NotifikasiValue | null>(null);

/** Urutkan terbaru di atas, dan buang duplikat id (insert lokal vs Realtime bisa bertemu). */
function rapikan(daftar: Notifikasi[]): Notifikasi[] {
  const unik = new Map<string, Notifikasi>();
  for (const n of daftar) unik.set(n.id, n);
  return [...unik.values()].sort((a, b) => b.dibuat.localeCompare(a.dibuat));
}

/**
 * Harus berada di dalam <AuthProvider>. Notifikasi hanya dimuat dan didengarkan
 * selama ada pengguna yang login, dan dikosongkan saat keluar.
 */
export function NotifikasiProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const uid = session?.user?.id ?? null;

  const [daftar, setDaftar] = useState<Notifikasi[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [terbaru, setTerbaru] = useState<Notifikasi | null>(null);

  const muatUlang = useCallback(async () => {
    if (!uid) return;
    setMemuat(true);
    try {
      const hasil = await fetchNotifikasi();
      setDaftar(rapikan(hasil));
      setGalat(null);
    } catch (err: any) {
      setGalat(err?.message ?? "Gagal memuat notifikasi");
    } finally {
      setMemuat(false);
    }
  }, [uid]);

  // Ganti pengguna / keluar: kosongkan dulu supaya notifikasi akun lama tidak terlihat.
  useEffect(() => {
    setDaftar([]);
    setGalat(null);
    setTerbaru(null);
    if (uid) muatUlang();
  }, [uid, muatUlang]);

  // Langganan Realtime. RLS tetap berlaku, jadi hanya notifikasi milik sendiri yang diterima.
  useEffect(() => {
    if (!uid) return;

    // Nama kanal dibuat unik tiap langganan. Realtime mengembalikan kanal lama bila namanya sama
    // dan kanal itu belum selesai ditutup, sehingga .on() bisa gagal diam-diam.
    const kanal = supabase
      .channel(`notifikasi:${uid}:${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const baru = rowToNotifikasi(payload.new as NotifikasiRow);
          setDaftar((lama) => rapikan([baru, ...lama]));
          setTerbaru(baru);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const ubah = rowToNotifikasi(payload.new as NotifikasiRow);
          setDaftar((lama) => lama.map((n) => (n.id === ubah.id ? ubah : n)));
        },
      )
      // Event DELETE tidak bisa disaring per pengguna oleh Realtime. Aman: payload hanya
      // berisi id, dan id yang bukan milik daftar ini tidak mengubah apa-apa.
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          const id = (payload.old as { id?: string }).id;
          if (id) setDaftar((lama) => lama.filter((n) => n.id !== id));
        },
      )
      .subscribe((status, err) => {
        // Status ini membantu melacak masalah Realtime (lihat console browser).
        console.log("[notifikasi] realtime:", status, err?.message ?? "");
        // Setelah tersambung (atau tersambung ulang), ambil ulang agar tidak ada yang terlewat.
        if (status === "SUBSCRIBED") muatUlang();
      });

    return () => {
      supabase.removeChannel(kanal);
    };
  }, [uid, muatUlang]);

  // HP: saat aplikasi kembali dibuka, segarkan daftar.
  useEffect(() => {
    if (!uid) return;
    const langganan = AppState.addEventListener("change", (state) => {
      if (state === "active") muatUlang();
    });
    return () => langganan.remove();
  }, [uid, muatUlang]);

  // Pembaruan optimistis: tampilan langsung berubah, dikembalikan bila server menolak.
  const tandaiDibaca = useCallback(
    async (id: string) => {
      const sebelum = daftar.find((n) => n.id === id);
      if (!sebelum || sebelum.dibaca) return;
      setDaftar((lama) => lama.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
      try {
        await tandaiDiServer(id);
      } catch (err) {
        setDaftar((lama) => lama.map((n) => (n.id === id ? { ...n, dibaca: false } : n)));
        throw err;
      }
    },
    [daftar],
  );

  const tandaiSemuaDibaca = useCallback(async () => {
    const idBelumDibaca = new Set(daftar.filter((n) => !n.dibaca).map((n) => n.id));
    if (idBelumDibaca.size === 0) return;
    setDaftar((lama) => lama.map((n) => ({ ...n, dibaca: true })));
    try {
      await tandaiSemuaDiServer();
    } catch (err) {
      setDaftar((lama) =>
        lama.map((n) => (idBelumDibaca.has(n.id) ? { ...n, dibaca: false } : n)),
      );
      throw err;
    }
  }, [daftar]);

  const hapus = useCallback(
    async (id: string) => {
      const sebelum = daftar.find((n) => n.id === id);
      if (!sebelum) return;
      setDaftar((lama) => lama.filter((n) => n.id !== id));
      try {
        await hapusDiServer(id);
      } catch (err) {
        setDaftar((lama) => rapikan([...lama, sebelum]));
        throw err;
      }
    },
    [daftar],
  );

  const belumDibaca = useMemo(() => daftar.filter((n) => !n.dibaca).length, [daftar]);

  const value = useMemo(
    () => ({ daftar, belumDibaca, memuat, galat, terbaru, muatUlang, tandaiDibaca, tandaiSemuaDibaca, hapus }),
    [daftar, belumDibaca, memuat, galat, terbaru, muatUlang, tandaiDibaca, tandaiSemuaDibaca, hapus],
  );

  return <NotifikasiContext.Provider value={value}>{children}</NotifikasiContext.Provider>;
}

export function useNotifikasi(): NotifikasiValue {
  const ctx = useContext(NotifikasiContext);
  if (!ctx) throw new Error("useNotifikasi harus dipakai di dalam <NotifikasiProvider>.");
  return ctx;
}
