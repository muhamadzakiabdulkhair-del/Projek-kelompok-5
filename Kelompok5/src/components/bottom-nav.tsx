import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/palette";
import type { NavTab } from "@/constants/navigation";
import { useCart } from "@/context/cart";

type Props = { tabs: NavTab[]; active: string };

// Tab bawah yang benar-benar berpindah halaman (router.replace), reusable untuk semua role.
export function BottomNav({ tabs, active }: Props) {
  const router = useRouter();
  const { count } = useCart();

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => {
              if (!isActive) router.replace(tab.href);
            }}
          >
            <View>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.placeholder}
              />
              {tab.key === "keranjang" && count > 0 ? (
                <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: "center", gap: 2 },
  label: { fontSize: 10, color: colors.placeholder, fontWeight: "600" },
  labelActive: { color: colors.primary, fontWeight: "800" },
  badge: {
    position: "absolute", top: -4, right: -10, backgroundColor: colors.danger,
    borderRadius: 8, minWidth: 16, height: 16, paddingHorizontal: 3,
    alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: "800" },
});
