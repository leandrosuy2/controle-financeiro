import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  obterResumoMensal,
  obterProximasVencer,
  ResumoMensal,
} from "../services/contas";
import type { Conta } from "../types/conta";
import { Button } from "../components/ui/Button";
import { useTheme } from "../theme/ThemeContext";
import { colors, gradientColors, radius } from "../theme/tokens";

export function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [resumo, setResumo] = useState<ResumoMensal | null>(null);
  const [proximas, setProximas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    try {
      setLoading(true);
      const [resumoData, proximasData] = await Promise.all([
        obterResumoMensal(),
        obterProximasVencer(7),
      ]);
      setResumo(resumoData);
      setProximas(proximasData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const totalPagar = resumo?.totalPagar ?? 0;
  const totalReceber = resumo?.totalReceber ?? 0;
  const saldoPrevisto = resumo?.saldoPrevisto ?? 0;

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const positivo = saldoPrevisto >= 0;
  const totalGeral = totalPagar + totalReceber || 1;
  const pctReceber = totalReceber / totalGeral;
  const pctPagar = totalPagar / totalGeral;

  function formatData(str: string) {
    return new Date(str + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={carregar} />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Bem-vindo(a) ao
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            Controle Financeiro
          </Text>
        </View>
        <View
          style={[
            styles.walletIconWrapper,
            {
              backgroundColor: theme.isDark
                ? "rgba(34,197,94,0.3)"
                : colors.primary,
            },
          ]}
        >
          <Ionicons name="wallet" size={22} color="#fff" />
        </View>
      </View>

      <View style={styles.balanceCardOuter}>
        <LinearGradient
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCardInner}
        >
          <Text style={styles.balanceLabel}>Saldo previsto deste mês</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(saldoPrevisto)}
          </Text>
          <Text
            style={[
              styles.balanceHint,
              positivo ? styles.balanceHintPositive : styles.balanceHintNegative,
            ]}
          >
            {positivo
              ? "Você está no azul 👏"
              : "Atenção com os gastos neste mês"}
          </Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceColumn}>
              <Text style={styles.smallLabel}>A receber</Text>
              <Text style={styles.smallValue}>
                {formatCurrency(totalReceber)}
              </Text>
            </View>
            <View style={styles.balanceColumn}>
              <Text style={styles.smallLabel}>A pagar</Text>
              <Text style={styles.smallValue}>
                {formatCurrency(totalPagar)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Gráfico receitas x despesas */}
      {(totalReceber > 0 || totalPagar > 0) && (
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderRadius: radius.lg * 1.5,
            },
          ]}
        >
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Receitas x Despesas (mês)
          </Text>
          <View style={styles.chartBarWrap}>
            <View style={styles.chartBarRow}>
              <View
                style={[
                  styles.chartBarSegment,
                  {
                    flex: pctReceber,
                    backgroundColor: colors.primary,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  },
                ]}
              />
              <View
                style={[
                  styles.chartBarSegment,
                  {
                    flex: pctPagar,
                    backgroundColor: colors.danger,
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.chartLegendItem}>
              <View
                style={[styles.chartLegendDot, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.chartLegendText, { color: theme.textSecondary }]}>
                Receitas {formatCurrency(totalReceber)}
              </Text>
            </View>
            <View style={styles.chartLegendItem}>
              <View
                style={[styles.chartLegendDot, { backgroundColor: colors.danger }]}
              />
              <Text style={[styles.chartLegendText, { color: theme.textSecondary }]}>
                Despesas {formatCurrency(totalPagar)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButtonWrapper}
          onPress={() => router.push("/contas")}
          activeOpacity={0.8}
        >
          <Button
            title="Ver todas as contas"
            iconName="list"
            size="small"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonWrapper}
          onPress={() => router.push("/contas/nova")}
          activeOpacity={0.8}
        >
          <Button
            title="Nova conta"
            iconName="add-circle"
            variant="outline"
            size="small"
          />
        </TouchableOpacity>
      </View>

      {/* Próximas a vencer */}
      <View
        style={[
          styles.proximasCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderRadius: radius.lg * 1.5,
          },
        ]}
      >
        <View style={styles.proximasHeader}>
          <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          <Text style={[styles.proximasTitle, { color: theme.text }]}>
            Próximas a vencer
          </Text>
          <Text style={[styles.proximasSubtitle, { color: theme.textSecondary }]}>
            próximos 7 dias
          </Text>
        </View>
        {proximas.length === 0 ? (
          <Text style={[styles.proximasEmpty, { color: theme.textSecondary }]}>
            Nenhuma conta a vencer nos próximos dias.
          </Text>
        ) : (
          <View style={styles.proximasList}>
            {proximas.slice(0, 5).map((conta) => (
              <TouchableOpacity
                key={conta.id}
                style={[
                  styles.proximasRow,
                  { borderBottomColor: theme.border },
                ]}
                onPress={() => router.push(`/contas/${conta.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.proximasRowLeft}>
                  <View
                    style={[
                      styles.proximasIconWrap,
                      {
                        backgroundColor:
                          conta.tipo === "pagar"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(34,197,94,0.15)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        conta.tipo === "pagar"
                          ? "arrow-down-circle"
                          : "arrow-up-circle"
                      }
                      size={18}
                      color={
                        conta.tipo === "pagar"
                          ? colors.danger
                          : colors.primary
                      }
                    />
                  </View>
                  <View>
                    <Text
                      style={[styles.proximasRowTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {conta.titulo}
                    </Text>
                    <Text
                      style={[
                        styles.proximasRowDate,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {formatData(conta.data_vencimento)}
                      {conta.status === "atrasado" && " • Atrasada"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.proximasRowValue,
                    {
                      color:
                        conta.tipo === "pagar"
                          ? colors.danger
                          : colors.primary,
                    },
                  ]}
                >
                  {formatCurrency(conta.valor)}
                </Text>
              </TouchableOpacity>
            ))}
            {proximas.length > 5 && (
              <TouchableOpacity
                style={styles.proximasVerMais}
                onPress={() => router.push("/contas")}
              >
                <Text style={[styles.proximasVerMaisText, { color: theme.primary }]}>
                  Ver todas ({proximas.length})
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View
        style={[
          styles.alertsCard,
          {
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: radius.lg * 1.5,
          },
        ]}
      >
        <Text style={[styles.alertsTitle, { color: theme.text }]}>
          Alertas rápidos
        </Text>
        <View style={styles.alertsRow}>
          <View style={[styles.alertItem, styles.alertItemAmber]}>
            <Text style={styles.alertLabelAmber}>Vencendo hoje</Text>
            <View style={styles.alertValueRow}>
              <Text style={styles.alertNumberAmber}>
                {resumo?.vencendoHoje ?? 0}
              </Text>
              <Text style={styles.alertUnitAmber}>contas</Text>
            </View>
          </View>
          <View style={[styles.alertItem, styles.alertItemRed]}>
            <Text style={styles.alertLabelRed}>Atrasadas</Text>
            <View style={styles.alertValueRow}>
              <Text style={styles.alertNumberRed}>
                {resumo?.atrasadas ?? 0}
              </Text>
              <Text style={styles.alertUnitRed}>contas</Text>
            </View>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerRow: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  walletIconWrapper: {
    padding: 10,
    borderRadius: 999,
  },
  balanceCardOuter: {
    marginBottom: 16,
    borderRadius: radius.lg * 1.5,
    overflow: "hidden",
  },
  balanceCardInner: {
    borderRadius: radius.lg * 1.5,
    padding: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#dbeafe",
  },
  balanceValue: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  balanceHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  balanceHintPositive: {
    color: "#bbf7d0",
  },
  balanceHintNegative: {
    color: "#fecaca",
  },
  balanceRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 12,
  },
  balanceColumn: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 12,
  },
  smallLabel: {
    fontSize: 11,
    color: "#bfdbfe",
  },
  smallValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  chartBarWrap: {
    height: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  chartBarRow: {
    flexDirection: "row",
    flex: 1,
    height: "100%",
  },
  chartBarSegment: {
    minWidth: 4,
  },
  chartLegend: {
    flexDirection: "row",
    marginTop: 10,
    gap: 16,
  },
  chartLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendText: {
    fontSize: 12,
  },
  actionsRow: {
    marginBottom: 16,
    flexDirection: "row",
    columnGap: 12,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  proximasCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
  },
  proximasHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  proximasTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  proximasSubtitle: {
    fontSize: 12,
  },
  proximasEmpty: {
    fontSize: 14,
    paddingVertical: 12,
  },
  proximasList: {},
  proximasRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  proximasRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  proximasIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  proximasRowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  proximasRowDate: {
    fontSize: 12,
    marginTop: 2,
  },
  proximasRowValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  proximasVerMais: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },
  proximasVerMaisText: {
    fontSize: 14,
    fontWeight: "600",
  },
  alertsCard: {
    marginTop: 0,
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  alertsTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  alertsRow: {
    flexDirection: "row",
    columnGap: 12,
  },
  alertItem: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
  },
  alertItemAmber: {
    backgroundColor: "#fffbeb",
  },
  alertItemRed: {
    backgroundColor: "#fef2f2",
  },
  alertLabelAmber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b45309",
  },
  alertLabelRed: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b91c1c",
  },
  alertValueRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-end",
    columnGap: 4,
  },
  alertNumberAmber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#b45309",
  },
  alertUnitAmber: {
    fontSize: 11,
    color: "#b45309",
  },
  alertNumberRed: {
    fontSize: 22,
    fontWeight: "700",
    color: "#b91c1c",
  },
  alertUnitRed: {
    fontSize: 11,
    color: "#b91c1c",
  },
});
