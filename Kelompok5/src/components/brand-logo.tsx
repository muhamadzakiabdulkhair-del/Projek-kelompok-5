import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/palette";

type Props = { size?: number; showText?: boolean; subtitle?: string; light?: boolean };

export function BrandLogo({ size = 36, showText = true, subtitle, light }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Ionicons name="flame" size={size * 0.55} color="#FFB74D" />
      </View>
      {showText ? (
        <View>
          <Text style={[styles.text, light && { color: colors.white }]}>
            Vape<Text style={styles.green}>Store</Text>
          </Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: { backgroundColor: "#0F3D25", alignItems: "center", justifyContent: "center" },
  text: { fontSize: 22, fontWeight: "900", color: colors.ink },
  green: { color: colors.primary },
  sub: { fontSize: 11, color: colors.muted, marginTop: -2 },
});
