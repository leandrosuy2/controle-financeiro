import React from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FormConta } from "../components/FormConta";

export function NovaContaScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrapper}>
            <Ionicons name="create" size={20} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.headerSubtitle}>
              Cadastro de movimentação
            </Text>
            <Text style={styles.headerTitle}>
              Nova conta
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <FormConta onSalvo={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  headerRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconWrapper: {
    marginRight: 12,
    borderRadius: 16,
    padding: 8,
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});



