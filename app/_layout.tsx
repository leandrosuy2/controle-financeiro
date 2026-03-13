import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreenNative from "expo-splash-screen";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { colors } from "../src/theme/tokens";
import { configureNotifications } from "../src/services/notifications";
import { SplashScreen as SplashOverlay } from "../src/components/SplashScreen";

SplashScreenNative.preventAutoHideAsync();

function TabsLayout() {
  const theme = useTheme();

  const headerBg = theme.isDark ? colors.darkBg : colors.primary;
  const headerText = "#ffffff";
  const tabBg = theme.isDark ? colors.darkBg : colors.lightSurface;
  const tabBorder = theme.isDark ? colors.darkBorderStrong : colors.lightBorder;
  const activeTint = theme.isDark ? colors.accent : colors.primary;
  const inactiveTint = theme.textSecondary;

  return (
    <Tabs
      screenOptions={({ route }) => {
        const isDashboard = route.name === "index";
        const isContas = String(route.name).startsWith("contas");
        const isConfig = String(route.name).startsWith("configuracoes");

        let iconName: keyof typeof Ionicons.glyphMap = "ellipse";
        if (isDashboard) {
          iconName = "grid-outline";
        } else if (isContas) {
          iconName = "card-outline";
        } else if (isConfig) {
          iconName = "settings-outline";
        }

        return {
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: headerText,
          headerTitleStyle: { fontWeight: "600" },
          tabBarStyle: {
            backgroundColor: tabBg,
            borderTopColor: tabBorder,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} color={color} size={size} />
          ),
        };
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          href: "/",
        }}
      />
      <Tabs.Screen
        name="contas/index"
        options={{
          title: "Contas",
          href: "/contas",
        }}
      />
      <Tabs.Screen
        name="configuracoes/index"
        options={{
          title: "Configurações",
          href: "/configuracoes",
        }}
      />
      <Tabs.Screen name="contas/[id]" options={{ href: null }} />
      <Tabs.Screen name="contas/nova" options={{ href: null }} />
    </Tabs>
  );
}

function NotificationsInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureNotifications();
  }, []);
  return <>{children}</>;
}

export default function RootLayout() {
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      await SplashScreenNative.hideAsync();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotificationsInit>
          <TabsLayout />
        </NotificationsInit>
      </ThemeProvider>
      <Toast />
      {splashVisible && (
        <SplashOverlay onFinish={() => setSplashVisible(false)} />
      )}
    </SafeAreaProvider>
  );
}
