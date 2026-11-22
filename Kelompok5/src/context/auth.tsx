import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { Role } from "@/constants/navigation";
import { ambilProfil, mulaiLoginGoogle } from "@/services/authService";
import { supabase } from "../../lib/supabase";

export type Profil = {
  id: string;
  email: string;
  nama: string;
  peran: Role;
  phone: string | null;
  avatar_url: string | null;
  status: "Aktif" | "Nonaktif";
};

export type HasilAuth =
  | { ok: true; peran: Role; perluVerifikasi?: boolean }
  | { ok: false; message: string };

/** Login Google di web memindahkan halaman, jadi belum ada peran saat fungsi kembali. */
export type HasilGoogle = HasilAuth | { ok: true; dialihkan: true };

type AuthValue = {
  session: Session | null;
  profil: Profil | null;
  memuat: boolean;
  masuk: (email: string, password: string) => Promise<HasilAuth>;
  masukGoogle: () => Promise<HasilGoogle>;
  daftar: (nama: string, email: string, password: string) => Promise<HasilAuth>;
  keluar: () => Promise<void>;
  muatUlangProfil: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [sesiSiap, setSesiSiap] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const sedangMasuk = useRef(false);

  // 1. Dengarkan perubahan sesi (termasuk sesi yang dipulihkan dari penyimpanan).
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSesiSiap(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Setiap ada sesi baru, muat profilnya dari tabel profiles.
  useEffect(() => {
    if (!sesiSiap) return;
    const uid = session?.user?.id;
    if (!uid) {
      setProfil(null);
      setMemuat(false);
      return;
    }
    if (sedangMasuk.current) return; // fungsi masuk()/masukGoogle() yang mengurusnya
    let aktif = true;
    (async () => {
      const p = await ambilProfil(uid);
      if (!aktif) return;
      if (!p || p.status === "Nonaktif") {
        await supabase.auth.signOut();
        setProfil(null);
      } else {
        setProfil(p);
      }
      setMemuat(false);
    })();
    return () => {
      aktif = false;
    };
  }, [sesiSiap, session?.user?.id]);

  // Dipakai setelah login berhasil: pastikan profil ada dan akunnya aktif.
  const selesaikanMasuk = useCallback(async (userId: string): Promise<HasilAuth> => {
    const p = await ambilProfil(userId);
    if (!p) {
      await supabase.auth.signOut();
      return { ok: false, message: "Profil akun tidak ditemukan. Hubungi owner." };
    }
    if (p.status === "Nonaktif") {
      await supabase.auth.signOut();
      return { ok: false, message: "Akun nonaktif. Hubungi owner." };
    }
    setProfil(p);
    setMemuat(false);
    return { ok: true, peran: p.peran };
  }, []);

  const masuk = useCallback(
    async (email: string, password: string): Promise<HasilAuth> => {
      sedangMasuk.current = true;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error || !data.user) {
          if (error?.message?.toLowerCase().includes("email not confirmed")) {
            return {
              ok: false,
              message: "Email belum diverifikasi. Cek kotak masuk email kamu.",
            };
          }
          // Akun yang dinonaktifkan owner (ban di Supabase Auth)
          if (
            error?.code === "user_banned" ||
            error?.message?.toLowerCase().includes("banned")
          ) {
            return { ok: false, message: "Akun nonaktif. Hubungi owner." };
          }
          // Pesan sengaja generik: tidak membocorkan apakah emailnya terdaftar.
          return { ok: false, message: "Email atau kata sandi salah." };
        }
        return await selesaikanMasuk(data.user.id);
      } finally {
        sedangMasuk.current = false;
      }
    },
    [selesaikanMasuk],
  );

  const masukGoogle = useCallback(async (): Promise<HasilGoogle> => {
    sedangMasuk.current = true;
    try {
      const hasil = await mulaiLoginGoogle();
      switch (hasil.status) {
        case "dialihkan":
          // Web: halaman pindah ke Google. Sesi diproses di /auth/callback.
          return { ok: true, dialihkan: true };
        case "batal":
          return { ok: false, message: "Login Google dibatalkan." };
        case "gagal":
          return { ok: false, message: hasil.message };
        case "selesai": {
          const { data } = await supabase.auth.getUser();
          if (!data.user) {
            return { ok: false, message: "Sesi Google tidak terbentuk. Coba lagi." };
          }
          return await selesaikanMasuk(data.user.id);
        }
      }
    } finally {
      sedangMasuk.current = false;
    }
  }, [selesaikanMasuk]);

  const daftar = useCallback(
    async (nama: string, email: string, password: string): Promise<HasilAuth> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nama } }, // dibaca trigger untuk mengisi kolom nama
      });
      if (error) {
        const pesan = error.message.toLowerCase();
        if (pesan.includes("already") || pesan.includes("registered")) {
          return { ok: false, message: "Email sudah terdaftar." };
        }
        if (pesan.includes("password")) {
          return {
            ok: false,
            message: "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.",
          };
        }
        return { ok: false, message: "Pendaftaran gagal. Coba lagi." };
      }
      // Email yang sudah terdaftar dikembalikan tanpa error tetapi tanpa identities.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        return { ok: false, message: "Email sudah terdaftar." };
      }
      // Confirm email aktif: belum ada sesi, pelanggan harus verifikasi dulu.
      return { ok: true, peran: "pelanggan", perluVerifikasi: !data.session };
    },
    [],
  );

  const keluar = useCallback(async () => {
    await supabase.auth.signOut();
    setProfil(null);
  }, []);

  const muatUlangProfil = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    const p = await ambilProfil(uid);
    if (p) setProfil(p);
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({ session, profil, memuat, masuk, masukGoogle, daftar, keluar, muatUlangProfil }),
    [session, profil, memuat, masuk, masukGoogle, daftar, keluar, muatUlangProfil],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}