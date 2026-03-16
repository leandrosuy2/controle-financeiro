import React from "react";
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { colors, radius } from "../theme/tokens";
import { criarContasTeste } from "../services/contas";

const appVersion = Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";
const appName = Constants.expoConfig?.name ?? "Finança Pro";

const NOVIDADES_VERSAO: string[] = [
  "Tema claro/escuro com persistência ao fechar o app",
  "Ícone e splash centralizados (sem corte)",
  "Validação de campos direto nos inputs no modal Nova conta",
  "Toasts aparecem acima dos modais",
  "Botões Ver todas e Nova conta na Dashboard corrigidos",
  "Build Android em APK (instalável direto)",
];

export function ConfiguracoesScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Configurações
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Ajustes do aplicativo
        </Text>
      </View>

      {__DEV__ && (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Desenvolvimento
          </Text>
          <TouchableOpacity
            style={[styles.row, styles.rowDevButton]}
            onPress={async () => {
              await criarContasTeste(20);
            }}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="beaker-outline" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                Criar 20 contas de teste
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          O que há de novo
        </Text>
        <Text style={[styles.novidadesVersao, { color: theme.textSecondary }]}>
          Versão {appVersion}
        </Text>
        {NOVIDADES_VERSAO.map((item, i) => (
          <View
            key={i}
            style={[
              styles.row,
              styles.rowNovidade,
              { borderBottomColor: theme.border },
              i === NOVIDADES_VERSAO.length - 1 && styles.rowLast,
            ]}
          >
            <Text style={[styles.bullet, { color: theme.primary }]}>•</Text>
            <Text style={[styles.rowLabel, styles.rowNovidadeLabel, { color: theme.text }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Aparência
        </Text>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Tema escuro</Text>
          </View>
          <Switch
            value={theme.isDark}
            onValueChange={theme.toggleTheme}
            trackColor={{
              false: theme.border,
              true: theme.isDark ? "rgba(34,197,94,0.5)" : colors.primarySoft,
            }}
            thumbColor={theme.isDark ? colors.primary : "#cbd5e1"}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Sobre
        </Text>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>{appName}</Text>
          </View>
        </View>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <View style={styles.rowLeft}>
            <Ionicons name="pricetag-outline" size={22} color={theme.textSecondary} />
            <Text style={[styles.rowLabel, { color: theme.text }]}>Versão</Text>
          </View>
          <Text style={[styles.versionBadge, { color: theme.textSecondary }]}>{appVersion}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={[styles.rowHint, { color: theme.textSecondary }]}>
            Contas a pagar e a receber, resumo mensal, lembretes no vencimento e tema claro/escuro.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowHint: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  versionBadge: {
    fontSize: 15,
    fontWeight: "600",
  },
  novidadesVersao: {
    fontSize: 13,
    marginBottom: 10,
  },
  rowNovidade: {
    alignItems: "flex-start",
  },
  rowNovidadeLabel: {
    flex: 1,
    fontWeight: "400",
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
  },
  rowDevButton: {
    borderBottomWidth: 0,
  },
});
