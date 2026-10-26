import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "@/components/bottom-nav";
import { BrandLogo } from "@/components/brand-logo";
import { ScreenHeader } from "@/components/screen-header";
import { tabsForRole, type Role } from "@/constants/navigation";
import { colors, font, radius, spacing } from "@/constants/palette";
import { useAuth } from "@/context/auth";

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  danger?: boolean;
};

function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.placeholder} />}
    </Pressable>
  );
}

// Label role yang tampil di badge
const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  karyawan: "Karyawan",
  pelanggan: "Pelanggan",
};

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Tentukan role dari data user yang login; fallback pelanggan jika belum login
  const role: Role = user?.role ?? "pelanggan";

  const name  = user?.name  ?? "Pengguna";
  const email = user?.email ?? "-";
  const phone = role === "owner"    ? "0811-0000-0001"
              : role === "karyawan" ? "0811-0000-0002"
              : "0812-3456-7890";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    if (role === "owner") router.replace("/admin/login");
    else if (role === "karyawan") router.replace("/karyawan/login");
    else router.replace("/pelanggan/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScreenHeader title="Profil" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar & info utama */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{ROLE_LABEL[role]}</Text>
          </View>
        </View>

        {/* Info detail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          {[
            { icon: "person-outline" as const, label: "Nama", value: name },
            { icon: "mail-outline" as const, label: "Email", value: email },
            { icon: "call-outline" as const, label: "Telepon", value: phone },
          ].map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          <MenuItem icon="create-outline" label="Edit Profil" />
          <MenuItem icon="lock-closed-outline" label="Ubah Kata Sandi" />
          <MenuItem icon="notifications-outline" label="Notifikasi" />
        </View>

        {/* Tentang */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>
          <MenuItem icon="information-circle-outline" label="Tentang VapeStore" />
          <MenuItem icon="document-text-outline" label="Syarat & Ketentuan" />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <MenuItem icon="log-out-outline" label="Keluar" onPress={handleLogout} danger />
        </View>

        {/* Branding */}
        <View style={styles.brandRow}>
          <BrandLogo />
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </ScrollView>

      <BottomNav tabs={tabsForRole(role)} active="profil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl + 8, gap: spacing.lg },

  // Hero card
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "900", color: colors.white },
  heroName: { fontSize: font.title, fontWeight: "900", color: colors.ink },
  roleBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  roleText: { fontSize: font.small, fontWeight: "700", color: colors.primary },

  // Section
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  sectionTitle: {
    fontSize: font.small,
    fontWeight: "800",
    color: colors.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: font.small, color: colors.muted },
  infoValue: { fontSize: font.body, fontWeight: "700", color: colors.ink },

  // Menu items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemPressed: { opacity: 0.7 },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconDanger: { backgroundColor: colors.dangerSoft },
  menuLabel: { flex: 1, fontSize: font.body, fontWeight: "600", color: colors.ink },
  menuLabelDanger: { color: colors.danger },

  // Brand
  brandRow: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  version: { fontSize: font.tiny, color: colors.placeholder },
});
