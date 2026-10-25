import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/palette";
import type { IconName } from "@/types/icon";
import { AppButton } from "./app-button";

type Props = {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} compact style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", padding: 32, gap: 8 },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "800", color: colors.ink, marginTop: 4 },
  message: { fontSize: 12, color: colors.muted, textAlign: "center" },
  btn: { marginTop: 8 },
});
