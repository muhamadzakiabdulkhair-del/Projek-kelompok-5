import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";

export default function AdminLoginScreen() {
  return (
    <AuthLayout current="owner">
      <LoginForm role="owner" redirectTo="/admin/dashboard" hint="admin@vapestore.com  ·  admin123" />
    </AuthLayout>
  );
}
