import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/constants/palette";
import type { IconName } from "@/types/icon";

// Pop-up kustom pengganti Alert.alert / window.confirm / window.alert,
// supaya tampilannya sama di web dan HP, dan sesuai desain aplikasi.
//
// Cara pakai (di layar biasa):
//   const dialog = useDialog();
//   dialog.konfirmasi({ judul, pesan, labelYa, bahaya: true, onYa: () => ... });
//   dialog.info({ judul, pesan, tipe: "error" });
//
// Cara pakai (di dalam <Modal> lain, mis. form/sheet) — iOS tidak bisa menumpuk
// dua Modal, jadi pop-up dirender sebagai overlay di dalam Modal tersebut:
//   const dialog = useDialogLokal();
//   ...
//   <Modal> ... {dialog.element} </Modal>

export type TipeDialog = "info" | "sukses" | "error" | "peringatan";

export type OpsiKonfirmasi = {
  judul: string;
  pesan: string;
  labelYa?: string;
  labelBatal?: string;
  /** true = tombol "Ya" berwarna merah (aksi berisiko, mis. nonaktifkan) */
  bahaya?: boolean;
  tipe?: TipeDialog;
  ikon?: IconName;
  onYa?: () => void;
  onBatal?: () => void;
};

export type OpsiInfo = {
  judul: string;
  pesan: string;
  tipe?: TipeDialog;
  ikon?: IconName;
  labelOk?: string;
  onOk?: () => void;
};

type Aktif = {
  judul: string;
  pesan: string;
  tipe: TipeDialog;
  ikon: IconName;
  labelYa: string;
  labelBatal: string | null; // null = hanya satu tombol
  bahaya: boolean;
  onYa?: () => void;
  onBatal?: () => void;
};

type DialogApi = {
  konfirmasi: (o: OpsiKonfirmasi) => void;
  info: (o: OpsiInfo) => void;
  tutup: () => void;
};

const TEMA: Record<TipeDialog, { ikon: IconName; fg: string; bg: string }> = {
  info: { ikon: "information-circle", fg: colors.primary, bg: colors.primarySoft },
  sukses: { ikon: "checkmark-circle", fg: colors.primary, bg: colors.primarySoft },
  error: { ikon: "close-circle", fg: colors.danger, bg: colors.dangerSoft },
  peringatan: { ikon: "warning", fg: colors.warning, bg: colors.warningSoft },
};

// ── State dialog (dipakai provider global maupun versi lokal) ───────────────
function useDialogState() {
  const [aktif, setAktif] = useState<Aktif | null>(null);
  const [terlihat, setTerlihat] = useState(false);

  const tutup = useCallback(() => setTerlihat(false), []);

  const konfirmasi = useCallback((o: OpsiKonfirmasi) => {
    const tipe: TipeDialog = o.tipe ?? (o.bahaya ? "peringatan" : "info");
    setAktif({
      judul: o.judul,
      pesan: o.pesan,
      tipe,
      ikon: o.ikon ?? TEMA[tipe].ikon,
      labelYa: o.labelYa ?? "Ya",
      labelBatal: o.labelBatal ?? "Batal",
      bahaya: !!o.bahaya,
      onYa: o.onYa,
      onBatal: o.onBatal,
    });
    setTerlihat(true);
  }, []);

  const info = useCallback((o: OpsiInfo) => {
    const tipe = o.tipe ?? "info";
    setAktif({
      judul: o.judul,
      pesan: o.pesan,
      tipe,
      ikon: o.ikon ?? TEMA[tipe].ikon,
      labelYa: o.labelOk ?? "Mengerti",
      labelBatal: null,
      bahaya: false,
      onYa: o.onOk,
    });
    setTerlihat(true);
  }, []);

  const api = useMemo<DialogApi>(
    () => ({ konfirmasi, info, tutup }),
    [konfirmasi, info, tutup],
  );

  return { aktif, terlihat, api };
}

// ── Tampilan kartu ──────────────────────────────────────────────────────────
function KartuDialog({
  aktif,
  tutup,
}: {
  aktif: Aktif;
  tutup: () => void;
}) {
  const tema = TEMA[aktif.tipe];
  const warnaYa = aktif.bahaya ? colors.danger : colors.primary;

  // Tutup dulu, baru jalankan aksi (aksi boleh membuka dialog baru)
  function ya() {
    tutup();
    aktif.onYa?.();
  }
  function batal() {
    tutup();
    aktif.onBatal?.();
  }

  return (
    <Pressable
      style={styles.backdrop}
      onPress={aktif.labelBatal ? batal : ya}
      accessibilityLabel="Tutup pop-up"
    >
      {/* Pressable kosong agar ketukan di dalam kartu tidak menutup dialog */}
      <Pressable style={styles.kartu} onPress={() => {}} accessibilityRole="alert">
        <View style={[styles.ikonWrap, { backgroundColor: tema.bg }]}>
          <Ionicons name={aktif.ikon} size={30} color={tema.fg} />
        </View>
        <Text style={styles.judul}>{aktif.judul}</Text>
        <Text style={styles.pesan}>{aktif.pesan}</Text>

        <View style={styles.tombolBaris}>
          {aktif.labelBatal ? (
            <Pressable
              accessibilityRole="button"
              onPress={batal}
              style={({ pressed }) => [
                styles.tombol,
                styles.tombolBatal,
                pressed && styles.ditekan,
              ]}
            >
              <Text style={styles.tombolBatalTeks}>{aktif.labelBatal}</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={ya}
            style={({ pressed }) => [
              styles.tombol,
              { backgroundColor: warnaYa, borderColor: warnaYa },
              pressed && styles.ditekan,
            ]}
          >
            <Text style={styles.tombolYaTeks}>{aktif.labelYa}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Provider global: dipasang sekali di _layout ─────────────────────────────
const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const { aktif, terlihat, api } = useDialogState();

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Modal
        visible={terlihat && !!aktif}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          // Tombol back Android = Batal (atau OK bila hanya satu tombol)
          if (!aktif) return;
          api.tutup();
          (aktif.labelBatal ? aktif.onBatal : aktif.onYa)?.();
        }}
      >
        {aktif ? <KartuDialog aktif={aktif} tutup={api.tutup} /> : null}
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog harus dipakai di dalam <DialogProvider>.");
  return ctx;
}

// ── Versi lokal: overlay di dalam Modal lain (form / sheet) ─────────────────
export function useDialogLokal() {
  const { aktif, terlihat, api } = useDialogState();

  const element =
    terlihat && aktif ? (
      <View style={styles.overlayLokal} pointerEvents="box-none">
        <KartuDialog aktif={aktif} tutup={api.tutup} />
      </View>
    ) : null;

  return { konfirmasi: api.konfirmasi, info: api.info, tutup: api.tutup, element };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 34, 24, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  overlayLokal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  kartu: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg + 4,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg + 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  ikonWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md + 2,
  },
  judul: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  pesan: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
  },
  tombolBaris: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
    width: "100%",
  },
  tombol: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  tombolBatal: {
    backgroundColor: colors.surface,
    borderColor: colors.borderInput,
  },
  tombolBatalTeks: { fontSize: 14, fontWeight: "600", color: colors.ink },
  tombolYaTeks: { fontSize: 14, fontWeight: "700", color: colors.white },
  ditekan: { opacity: 0.85 },
});
