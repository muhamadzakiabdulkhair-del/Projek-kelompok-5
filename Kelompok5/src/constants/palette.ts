// Satu sumber untuk warna, spacing, dan radius di seluruh aplikasi VapeStore.
// Jangan menulis kode warna langsung di screen — pakai token di bawah ini.

export const colors = {
  primary: "#087F50",
  primaryDark: "#0A2218",
  primarySoft: "#E8F4EE",
  ink: "#0F1F17",
  muted: "#6A7E72",
  placeholder: "#8A9E94",
  bg: "#F5F7F5",
  surface: "#FFFFFF",
  tint: "#EDF5F0",
  border: "#E8EEE8",
  borderInput: "#DDE8E2",
  danger: "#C03030",
  dangerSoft: "#FFF0F0",
  warning: "#C08000",
  warningSoft: "#FFFBEE",
  star: "#F0A500",
  white: "#FFFFFF",
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

export const font = {
  title: 20,
  heading: 17,
  body: 14,
  small: 12,
  tiny: 10,
} as const;
