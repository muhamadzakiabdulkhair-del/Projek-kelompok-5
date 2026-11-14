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

type AuthValue = {
  session: Session | null;
  profil: Profil | null;
  memuat: boolean;
  masuk: (email: string, password: string) => Promise<HasilAuth>;
  daftar: (nama: string, email: string, password: string) => Promise<HasilAuth>;
  keluar: () => Promise<void>;
  muatUlangProfil: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function ambilProfil(userId: string): Promise<Profil | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nama, peran, phone, avatar_url, status")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profil;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [sesiSiap, setSesiSiap] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const sedangMasuk = useRef(false);

  // 1. Dengarkan perubahan sesi (termasuk sesi yang dipulihkan dari penyimpanan).
  //    Di callback ini hanya menyimpan sesi, tanpa memanggil Supabase lagi.
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
    if (sedangMasuk.current) return; // fungsi masuk() yang mengurusnya
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
          // Pesan sengaja generik: tidak membocorkan apakah emailnya terdaftar.
          return { ok: false, message: "Email atau kata sandi salah." };
        }
        const p = await ambilProfil(data.user.id);
        if (!p) {
          await supabase.auth.signOut();
          return {
            ok: false,
            message: "Profil akun tidak ditemukan. Hubungi owner.",
          };
        }
        if (p.status === "Nonaktif") {
          await supabase.auth.signOut();
          return { ok: false, message: "Akun nonaktif. Hubungi owner." };
        }
        setProfil(p);
        setMemuat(false);
        return { ok: true, peran: p.peran };
      } finally {
        sedangMasuk.current = false;
      }
    },
    [],
  );

  const daftar = useCallback(
    async (
      nama: string,
      email: string,
      password: string,
    ): Promise<HasilAuth> => {
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
    () => ({ session, profil, memuat, masuk, daftar, keluar, muatUlangProfil }),
    [session, profil, memuat, masuk, daftar, keluar, muatUlangProfil],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}
