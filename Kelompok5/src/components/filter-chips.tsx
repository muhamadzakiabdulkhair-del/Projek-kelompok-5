import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "@/constants/palette";

type Props = { options: string[]; value: string; onChange: (v: string) => void };

export function FilterChips({ options, value, onChange }: Props) {
  return (
    <FlatList
      horizontal
      data={options}
      keyExtractor={(o) => o}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      style={styles.flat}
      renderItem={({ item }) => {
        const active = item === value;
        return (
          <Pressable onPress={() => onChange(item)} style={[styles.chip, active && styles.active]}>
            <Text style={[styles.text, active && styles.textActive]}>{item}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flat: { flexGrow: 0 },
  list: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderInput,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 12, fontWeight: "700", color: colors.muted },
  textActive: { color: colors.white },
});
