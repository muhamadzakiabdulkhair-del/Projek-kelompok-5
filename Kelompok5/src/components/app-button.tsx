import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius } from "@/constants/palette";
import type { IconName } from "@/types/icon";

type Variant = "primary" | "outline" | "soft" | "danger";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  outline: { bg: colors.surface, fg: colors.ink, border: colors.borderInput },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  compact,
  style,
}: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && styles.pressed,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={v.fg} /> : null}
          <Text style={[styles.label, compact && styles.labelCompact, { color: v.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  compact: { minHeight: 38, paddingHorizontal: 12, borderRadius: radius.sm },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.55 },
  label: { fontSize: 15, fontWeight: "800" },
  labelCompact: { fontSize: 13 },
});
