import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, radius } from "@/constants/palette";

type Props = { value: string; onChangeText: (v: string) => void; placeholder?: string };

export function SearchBar({ value, onChangeText, placeholder = "Cari produk..." }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.box, focused && styles.focused]}>
      <Ionicons name="search" size={18} color={focused ? colors.primary : colors.placeholder} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} accessibilityLabel="Hapus pencarian">
          <Ionicons name="close-circle" size={18} color={colors.placeholder} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: 8,
    height: 46, paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderInput,
  },
  focused: { borderColor: colors.primary },
  input: { flex: 1, fontSize: 13, color: colors.ink },
});
