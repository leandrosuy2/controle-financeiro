import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { listarContas, FiltrosContas, FiltroPeriodo } from "../services/contas";
import type { Conta } from "../types/conta";
import Toast from "react-native-toast-message";
import { CardConta } from "../components/CardConta";
import { FormConta } from "../components/FormConta";
import { useTheme } from "../theme/ThemeContext";
import { colors, radius } from "../theme/tokens";

const periodos: { id: FiltroPeriodo; label: string }[] = [
  { id: "dia", label: "Dia" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mês" },
  { id: "todos", label: "Todos" },
];

const statusOptions = [
  { id: undefined, label: "Todos" },
  { id: "pendente", label: "Pendentes" },
  { id: "pago", label: "Pagos/Recebidos" },
  { id: "atrasado", label: "Atrasados" },
];

const tipoOptions = [
  { id: undefined, label: "Todos" },
  { id: "pagar", label: "A pagar" },
  { id: "receber", label: "A receber" },
];

export function ListaContasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ abrirNova?: string }>();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mostrarModalNova, setMostrarModalNova] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosContas>({
    periodo: "mes",
    tipo: undefined,
  });

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const { itens, hasMore } = await listarContas(filtros, {
        limit: pageSize,
        offset: 0,
      });
      setContas(itens);
      setHasMore(hasMore);
      setPage(0);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function carregarMais() {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { itens, hasMore: more } = await listarContas(filtros, {
        limit: pageSize,
        offset: nextPage * pageSize,
      });
      setContas((prev) => [...prev, ...itens]);
      setHasMore(more);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

  // Abrir modal "Nova conta" quando vier da Dashboard com ?abrirNova=1
  useEffect(() => {
    if (params.abrirNova === "1") {
      setMostrarModalNova(true);
      router.replace("/contas");
    }
  }, [params.abrirNova]);

  function alterarPeriodo(periodo: FiltroPeriodo) {
    setFiltros((prev) => ({ ...prev, periodo }));
  }

  function alterarStatus(status: any) {
    setFiltros((prev) => ({ ...prev, status }));
  }

  function alterarTipo(tipo: any) {
    setFiltros((prev) => ({ ...prev, tipo }));
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
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Visão geral das movimentações
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Minhas contas
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setMostrarModalNova(true)}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.filtersCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.lg * 1.5 }]}>
        {/* Abas internas: Todas / A pagar / A receber */}
        <View style={[styles.internalTabsRow, { backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9" }]}>
          {[
            { id: undefined, label: "Todas" as any },
            { id: "pagar" as const, label: "A pagar" },
            { id: "receber" as const, label: "A receber" },
          ].map((opt) => {
            const ativo = filtros.tipo === opt.id;
            return (
              <TouchableOpacity
                key={opt.label}
                onPress={() => alterarTipo(opt.id)}
                style={[
                  styles.internalTab,
                  ativo && { backgroundColor: theme.surface, ...(theme.isDark ? {} : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }) },
                ]}
              >
                <Text
                  style={[
                    styles.internalTabText,
                    { color: ativo ? theme.primary : theme.textSecondary },
                    ativo && styles.internalTabTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.filtersTitle, { color: theme.textSecondary }]}>Período</Text>
        <View style={styles.chipsRow}>
          {periodos.map((p) => {
            const ativo = filtros.periodo === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => alterarPeriodo(p.id)}
                style={[
                  styles.chip,
                  { backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9" },
                  ativo && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: ativo ? "#fff" : theme.text },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.filtersBottomRow}>
          <View style={styles.filtersColumn}>
            <Text style={[styles.filtersLabel, { color: theme.textSecondary }]}>
              Status
            </Text>
            <View style={styles.smallChipsRow}>
              {statusOptions.map((opt) => {
                const ativo = filtros.status === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    onPress={() => alterarStatus(opt.id)}
                    style={[
                      styles.smallChip,
                      { backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9" },
                      ativo && { backgroundColor: theme.isDark ? "rgba(34,197,94,0.25)" : colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallChipText,
                        { color: ativo ? "#FFFFFF" : theme.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {contas.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={36} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Nenhuma conta encontrada com esses filtros.
          </Text>
          <TouchableOpacity
            onPress={() => setMostrarModalNova(true)}
            style={[styles.emptyButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.emptyButtonText}>
              Cadastrar primeira conta
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {contas.map((conta) => (
            <CardConta
              key={conta.id}
              conta={conta}
              onPress={() => router.push(`/contas/${conta.id}`)}
            />
          ))}
          {hasMore && (
            <TouchableOpacity
              style={[styles.loadMoreButton, { borderColor: theme.primary }]}
              onPress={carregarMais}
              disabled={loadingMore}
            >
              <Text style={[styles.loadMoreText, { color: theme.primary }]}>
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal para nova conta (centralizado, responsivo com teclado) */}
      <Modal
        visible={mostrarModalNova}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalNova(false)}
        statusBarTranslucent
      >
        {/* Backdrop cobre a tela inteira e bem escuro */}
        <View style={styles.modalBackdrop} pointerEvents="box-none">
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            pointerEvents="box-none"
          >
            <View style={[styles.modalCard, { backgroundColor: theme.surface, borderRadius: radius.lg * 1.5 }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Nova conta</Text>
                <TouchableOpacity onPress={() => setMostrarModalNova(false)}>
                  <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <FormConta
                  onSalvo={async () => {
                    setMostrarModalNova(false);
                    await carregar();
                  }}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
          {/* Toast dentro do modal para mensagens aparecerem acima do conteúdo */}
          <Toast />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "600",
  },
  addButton: {
    padding: 8,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  filtersCard: {
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filtersTitle: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filtersBottomRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filtersColumn: {
    flex: 1,
  },
  filtersLabel: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: "600",
  },
  smallChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 4,
    rowGap: 4,
  },
  smallChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  internalTabsRow: {
    flexDirection: "row",
    marginBottom: 8,
    borderRadius: 999,
    padding: 4,
  },
  internalTab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  internalTabText: {
    fontSize: 12,
    fontWeight: "500",
  },
  internalTabTextActive: {
    fontWeight: "600",
  },
  emptyState: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadMoreButton: {
    marginTop: 12,
    marginBottom: 8,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    marginTop: 4,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalCard: {
    maxHeight: "85%",
    padding: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    paddingBottom: 16,
  },
});



