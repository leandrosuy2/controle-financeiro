import React from "react";
import {
  Pressable,
  Text,
  PressableProps,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { colors, gradientColors, radius } from "../../theme/tokens";

type Variant = "primary" | "outline" | "ghost";
type Size = "default" | "small";

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function Button({
  title,
  variant = "primary",
  size = "default",
  loading,
  iconName,
  disabled,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const isSmall = size === "small";
  const textStyle = isSmall ? styles.textSmall : styles.text;

  const primaryTextColor = theme.isDark ? "#111827" : "#FFFFFF";
  const textColor =
    variant === "primary" ? primaryTextColor : theme.primary;
  const iconColor = variant === "primary" ? primaryTextColor : theme.primary;

  if (variant === "primary" && !isDisabled) {
    return (
      <Pressable style={[styles.wrapper, style]} disabled={isDisabled} {...rest}>
        <LinearGradient
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, styles.gradientBtn, isDisabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color={primaryTextColor} />
          ) : (
            <View style={styles.contentRow}>
              {iconName ? (
                <Ionicons
                  name={iconName}
                  size={18}
                  color={iconColor}
                  style={styles.icon}
                />
              ) : null}
              <Text style={[textStyle, { color: textColor }]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const containerStyle = [
    styles.base,
    variant === "outline" && { borderWidth: 1, borderColor: theme.primary, backgroundColor: "transparent" },
    variant === "ghost" && { backgroundColor: "transparent" },
    isDisabled && styles.disabled,
    style,
  ];

  return (
    <Pressable style={containerStyle} disabled={isDisabled} {...rest}>
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.contentRow}>
          {iconName ? (
            <Ionicons
              name={iconName}
              size={18}
              color={iconColor}
              style={styles.icon}
            />
          ) : null}
          <Text style={[textStyle, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  base: {
    width: "100%",
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradientBtn: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  textSmall: {
    fontSize: 13,
    fontWeight: "600",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
});
