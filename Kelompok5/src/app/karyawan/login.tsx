import type { Href } from "expo-router";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";

export default function KaryawanLoginScreen() {
  return (
    <AuthLayout current="karyawan">
      <LoginForm
        role="karyawan"
        redirectTo={"/kelola-produk?role=karyawan" as Href}
        hint="karyawan@vapestore.com  ·  karyawan123"
      />
    </AuthLayout>
  );
}
