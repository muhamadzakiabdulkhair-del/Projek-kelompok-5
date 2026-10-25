// Penyimpanan user sementara di memori
// Nanti diganti dengan API call ke backend sungguhan

export type UserRole = "owner" | "karyawan" | "pelanggan";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Akun default untuk testing
const users: User[] = [
  { id: 1, name: "Administrator", email: "admin@vapestore.com", password: "admin123", role: "owner" },
  { id: 2, name: "Karyawan Toko", email: "karyawan@vapestore.com", password: "karyawan123", role: "karyawan" },
];
let nextId = 3;

// ── Register (hanya untuk pelanggan) ─────────────────────────────────────────
export function mockRegister(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): { ok: boolean; message: string } {
  const existing = users.find((u) => u.email === payload.email);
  if (existing) {
    return { ok: false, message: "Email sudah terdaftar." };
  }

  users.push({
    id: nextId++,
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  });

  return { ok: true, message: "Pendaftaran berhasil." };
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function mockLogin(payload: {
  email: string;
  password: string;
  role: UserRole;
}): { ok: boolean; message: string; user?: Omit<User, "password"> } {
  const user = users.find(
    (u) =>
      u.email === payload.email &&
      u.password === payload.password &&
      u.role === payload.role,
  );

  if (!user) {
    return { ok: false, message: "Email atau kata sandi salah." };
  }

  return {
    ok: true,
    message: "Login berhasil.",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
