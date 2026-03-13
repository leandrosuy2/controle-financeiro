import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Conta } from "../types/conta";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/tokens";

interface Props {
  conta: Conta;
  onPress?: () => void;
}

function statusPill(status: Conta["status"]) {
  switch (status) {
    case "pago":
      return { label: "Pago", icon: "checkmark-circle" as const };
    case "atrasado":
      return { label: "Atrasado", icon: "alert-circle" as const };
    default:
      return { label: "Pendente", icon: "time" as const };
  }
}

export function CardConta({ conta, onPress }: Props) {
  const theme = useTheme();
  const valorFormatado = conta.valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const data = new Date(conta.data_vencimento).toLocaleDateString("pt-BR");
  const status = statusPill(conta.status);

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.lg * 1.5,
    },
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={cardStyle}
      activeOpacity={0.9}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {conta.titulo}
          </Text>
          {conta.descricao ? (
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
              {conta.descricao}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.typePill,
            conta.tipo === "pagar" ? styles.typePillPagar : styles.typePillReceber,
          ]}
        >
          <Ionicons
            name={conta.tipo === "pagar" ? "arrow-down-circle" : "arrow-up-circle"}
            size={14}
            color={conta.tipo === "pagar" ? "#b91c1c" : "#16a34a"}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.typePillText,
              conta.tipo === "pagar" ? styles.typePillTextPagar : styles.typePillTextReceber,
            ]}
          >
            {conta.tipo === "pagar" ? "A pagar" : "A receber"}
          </Text>
        </View>
      </View>

      <View style={styles.middleRow}>
        <View>
          <Text style={[styles.labelSmall, { color: theme.textSecondary }]}>Vencimento</Text>
          <Text style={[styles.valueSmall, { color: theme.text }]}>{data}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.labelSmall, { color: theme.textSecondary }]}>Valor</Text>
          <Text style={[styles.amount, { color: theme.text }]}>
            {valorFormatado}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View
          style={[
            styles.statusPill,
            status.label === "Pago" && styles.statusPillPago,
            status.label === "Atrasado" && styles.statusPillAtrasado,
            status.label === "Pendente" && styles.statusPillPendente,
          ]}
        >
          <Ionicons
            name={status.icon}
            size={14}
            color={status.label === "Pago" ? "#059669" : status.label === "Atrasado" ? "#dc2626" : "#d97706"}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statusText}>
            {status.label}
          </Text>
        </View>
        {conta.categoria ? (
          <View style={[styles.categoryPill, { backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9" }]}>
            <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
              {conta.categoria}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    marginTop: 2,
    fontSize: 12,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typePillPagar: {
    backgroundColor: "#fef2f2",
  },
  typePillReceber: {
    backgroundColor: "#ecfdf3",
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  typePillTextPagar: {
    color: "#b91c1c",
  },
  typePillTextReceber: {
    color: "#15803d",
  },
  middleRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelSmall: {
    fontSize: 11,
  },
  valueSmall: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "500",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillPago: {
    backgroundColor: "#ecfdf3",
  },
  statusPillAtrasado: {
    backgroundColor: "#fef2f2",
  },
  statusPillPendente: {
    backgroundColor: "#fffbeb",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#374151",
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "500",
  },
});



