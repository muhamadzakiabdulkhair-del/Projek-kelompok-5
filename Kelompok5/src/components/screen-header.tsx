import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/palette";

type Props = {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, back, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable
          style={styles.backBtn}
          accessibilityLabel="Kembali"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/dashboard"))}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
      ) : null}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.bg, alignItems: "center", justifyContent: "center",
  },
  titleWrap: { flex: 1 },
  title: { fontSize: 18, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: 12, color: colors.muted },
});
