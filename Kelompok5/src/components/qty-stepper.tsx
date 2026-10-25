import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/constants/palette";

type Props = { value: number; onChange: (v: number) => void; min?: number; max?: number };

export function QtyStepper({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, value <= min && styles.off]}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        accessibilityLabel="Kurangi jumlah"
      >
        <Ionicons name="remove" size={16} color={colors.ink} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={[styles.btn, value >= max && styles.off]}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        accessibilityLabel="Tambah jumlah"
      >
        <Ionicons name="add" size={16} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderInput,
    alignItems: "center", justifyContent: "center",
  },
  off: { opacity: 0.4 },
  value: { minWidth: 22, textAlign: "center", fontSize: 14, fontWeight: "800", color: colors.ink },
});
