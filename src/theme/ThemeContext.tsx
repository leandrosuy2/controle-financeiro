import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "./tokens";

const THEME_STORAGE_KEY = "@financapro/theme";

export type ThemeMode = "light" | "dark";

type Theme = {
  mode: ThemeMode;
  isDark: boolean;
  bg: string;
  surface: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  accent: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    () => (systemScheme === "dark" ? "dark" : "light")
  );

  // Carrega tema salvo ao iniciar; preferência do usuário sobrepõe o do sistema
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === "dark" || saved === "light") {
          setMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const isDark = mode === "dark";

  const theme: Theme = {
    mode,
    isDark,
    bg: isDark ? colors.darkBg : colors.lightBg,
    surface: isDark ? colors.darkSurface : colors.lightSurface,
    border: isDark ? colors.darkBorder : colors.lightBorder,
    borderStrong: isDark ? colors.darkBorderStrong : colors.lightBorder,
    text: isDark ? colors.textDarkPrimary : colors.textLightPrimary,
    textSecondary: isDark ? colors.textDarkSecondary : colors.textLightSecondary,
    primary: colors.primary,
    primarySoft: colors.primarySoft,
    secondary: colors.secondary,
    accent: colors.accent,
    toggleTheme,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
