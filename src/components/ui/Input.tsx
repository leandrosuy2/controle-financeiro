import React from "react";
import {
  TextInput,
  TextInputProps,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { colors, radius, typography } from "../../theme/tokens";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, error, iconName, style, ...rest }: Props) {
  const theme = useTheme();

  const wrapperStyle = [
    styles.inputWrapper,
    {
      borderColor: error ? colors.danger : (theme.isDark ? colors.zinc700 : colors.slate200),
      backgroundColor: theme.isDark ? "rgba(0,0,0,0.6)" : colors.lightSurface,
    },
  ];

  const inputStyle = [
    styles.input,
    { color: theme.text },
  ];

  const labelStyle = [styles.label, { color: theme.text }];
  const placeholderColor = theme.isDark ? colors.zinc400 : colors.slate400;

  return (
    <View style={styles.container}>
      {label ? <Text style={labelStyle}>{label}</Text> : null}
      <View style={wrapperStyle}>
        {iconName ? (
          <Ionicons
            name={iconName}
            size={18}
            color={theme.textSecondary}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={inputStyle}
          placeholderTextColor={placeholderColor}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingLeft: 40,
  },
  icon: {
    position: "absolute",
    left: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: typography.body.fontSize,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: colors.danger,
  },
});
