import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, radius } from "@/constants/palette";
import type { IconName } from "@/types/icon";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  icon?: IconName;
  containerStyle?: StyleProp<ViewStyle>;
};

// Input dengan label, ikon, state focus (border hijau) dan state error (border merah + pesan).
export function AppInput({
  label,
  error,
  icon,
  secureTextEntry,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.borderInput;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, { borderColor }, focused && styles.focused, !!error && styles.errored]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.placeholder} />
        ) : null}
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && hidden}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="Tampilkan kata sandi">
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={18} color={colors.placeholder} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "700", color: colors.ink, marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  focused: { backgroundColor: colors.tint },
  errored: { backgroundColor: colors.dangerSoft },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 10,
    ...Platform.select({ web: { outlineStyle: "none" } as object, default: {} }),
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  errorText: { fontSize: 11, color: colors.danger, fontWeight: "600" },
});
