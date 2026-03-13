/**
 * Design System – Fintech style
 * Verdes (gráfico financeiro), Azuis (ícones), Dourado (moeda), Neutros
 */

export const colors = {
  // Sugestão fintech
  primary: "#22C55E",       // verde principal
  secondary: "#2563EB",     // azul médio
  accent: "#FACC15",        // dourado claro
  background: "#111827",     // quase preto (fundo splash/dark)

  primarySoft: "#4ADE80",   // verde claro / highlight
  primaryDark: "#16A34A",   // verde escuro

  // Azuis (fundo ícone, detalhes)
  blueDark: "#1E3A8A",
  blueMedium: "#2563EB",
  blueLight: "#38BDF8",

  // Dourado / moeda
  goldLight: "#FACC15",
  goldMedium: "#F59E0B",
  goldDark: "#D97706",

  // Feedback
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",

  // Dark theme
  darkBg: "#111827",
  darkSurface: "rgba(30, 41, 59, 0.8)",
  darkBorder: "rgba(255,255,255,0.06)",
  darkBorderStrong: "rgba(255,255,255,0.12)",

  // Light theme
  lightBg: "#f8fafc",
  lightSurface: "#ffffff",
  lightBorder: "#e2e8f0",

  // Text
  textDarkPrimary: "#f9fafb",
  textDarkSecondary: "#9ca3af",
  textLightPrimary: "#111827",
  textLightSecondary: "#6b7280",

  // Neutros
  white: "#FFFFFF",
  grayLight: "#E5E7EB",
  zinc400: "#a1a1aa",
  zinc700: "#3f3f46",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
};

export const typography = {
  h1: { fontSize: 24, fontWeight: "700" as const },
  h2: { fontSize: 20, fontWeight: "700" as const },
  h3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  label: { fontSize: 12, fontWeight: "500" as const, letterSpacing: 0.4 },
  badge: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.6 },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
};

/** Gradiente botão primário (fintech: verde) */
export const gradientColors = ["#22C55E", "#16A34A"] as const;
