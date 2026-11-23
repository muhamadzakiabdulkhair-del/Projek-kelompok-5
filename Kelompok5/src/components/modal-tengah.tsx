import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { colors, radius, spacing } from "@/constants/palette";

// Pop-up form di TENGAH layar (pengganti sheet yang naik dari bawah).
//
// Susunan kartu:
//   [ Judul                     X ]   <- header, tetap
//   [ isi (children), bisa digulir ]   <- area gulir
//   [ tombol (footer)             ]   <- tetap, selalu terlihat
//
// Tombol sengaja ditaruh di luar area gulir supaya tidak tertutup keyboard
// atau toolbar browser di HP.
//
// Cara pakai:
//   <ModalTengah judul="Tambah Karyawan" onTutup={tutup} footer={<AppButton ... />}>
//     ...isi form...
//   </ModalTengah>
//
// Bila dipakai bersama useDialogLokal(), kirim `dialog.element` lewat prop
// `overlay` (iOS tidak bisa menumpuk dua Modal).

type Props = {
  /** Default true. Komponen yang selalu dipasang bisa mengatur lewat prop ini. */
  visible?: boolean;
  judul: string;
  onTutup: () => void;
  /** false = ketuk area gelap tidak menutup (mis. saat sedang menyimpan) */
  tutupSaatKetukLuar?: boolean;
  /** Isi form; dibungkus ScrollView otomatis */
  children: ReactNode;
  /** Tombol aksi di bagian bawah kartu (tetap terlihat) */
  footer?: ReactNode;
  /** Elemen tambahan di atas kartu, mis. dialog.element dari useDialogLokal */
  overlay?: ReactNode;
};

export function ModalTengah({
  visible = true,
  judul,
  onTutup,
  tutupSaatKetukLuar = true,
  children,
  footer,
  overlay,
}: Props) {
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onTutup}
    >
      <View style={styles.root}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Area gelap: ketuk untuk menutup */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={tutupSaatKetukLuar ? onTutup : undefined}
            accessibilityLabel="Tutup pop-up"
          />

          <View style={[styles.kartu, { maxHeight: height * 0.86 }]} accessibilityViewIsModal>
            <View style={styles.header}>
              <Text style={styles.judul} numberOfLines={2}>
                {judul}
              </Text>
              <Pressable onPress={onTutup} hitSlop={10} accessibilityLabel="Tutup" style={styles.tutup}>
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.isi}
              contentContainerStyle={styles.isiKonten}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
        {overlay}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // colors.primaryDark + alpha 0x8C (sekitar 55%) untuk latar gelap
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: `${colors.primaryDark}8C`,
  },
  kartu: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg + 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.xl - 4,
    paddingTop: spacing.lg + 2,
    paddingBottom: spacing.md,
  },
  judul: { flex: 1, fontSize: 18, fontWeight: "900", color: colors.ink },
  tutup: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  isi: { flexGrow: 0 },
  isiKonten: { paddingHorizontal: spacing.xl - 4, paddingBottom: spacing.md },
  footer: {
    paddingHorizontal: spacing.xl - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
