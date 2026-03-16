import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import type { Conta } from "../types/conta";
import {
  obterContaPorId,
  excluirConta,
  marcarContaComo,
} from "../services/contas";
import { Button } from "../components/ui/Button";
import { FormConta } from "../components/FormConta";
import { useTheme } from "../theme/ThemeContext";
import { colors, radius } from "../theme/tokens";

export function DetalheContaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const [conta, setConta] = useState<Conta | null>(null);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function carregar() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await obterContaPorId(Number(id));
      setConta(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [id]);

  useEffect(() => {
    if (conta?.titulo) {
      navigation.setOptions({
        title: conta.titulo,
      });
    } else {
      navigation.setOptions({
        title: "Detalhe da conta",
      });
    }
  }, [conta?.titulo, navigation]);

  function abrirModalExcluir() {
    setMostrarModalExcluir(true);
  }

  async function confirmarExcluir() {
    if (!conta?.id) return;
    try {
      setExcluindo(true);
      await excluirConta(conta.id);
      setMostrarModalExcluir(false);
      Toast.show({ type: "success", text1: "Conta excluída" });
      router.back();
    } catch {
      Toast.show({ type: "error", text1: "Erro", text2: "Não foi possível excluir." });
    } finally {
      setExcluindo(false);
    }
  }

  async function handleMarcarPago() {
    if (!conta?.id) return;
    await marcarContaComo(conta.id, "pago");
    await carregar();
    Toast.show({ type: "success", text1: "Status atualizado" });
  }

  async function handleMarcarPendente() {
    if (!conta?.id) return;
    await marcarContaComo(conta.id, "pendente");
    await carregar();
    Toast.show({ type: "success", text1: "Status atualizado" });
  }

  if (!conta && !loading) {
    return (
      <View style={[styles.notFound, { backgroundColor: theme.bg }]}>
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
          Conta não encontrada.
        </Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  const valorFormatado = conta
    ? conta.valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "";

  const data = conta
    ? new Date(conta.data_vencimento).toLocaleDateString("pt-BR")
    : "";

  const statusColor =
    conta?.status === "pago"
      ? colors.success
      : conta?.status === "atrasado"
      ? colors.danger
      : colors.warning;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {conta && !editando && (
        <>
          <View style={styles.headerRow}>
            <View style={styles.headerCol}>
              <Text style={[styles.headerBadge, { color: theme.textSecondary }]}>
                Detalhes da movimentação
              </Text>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {conta.titulo}
              </Text>
            </View>
            <View style={[styles.iconWrap, { backgroundColor: theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(34,197,94,0.12)" }]}>
              <Ionicons
                name={conta.tipo === "pagar" ? "arrow-down-circle" : "arrow-up-circle"}
                size={22}
                color={conta.tipo === "pagar" ? colors.danger : colors.success}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: radius.lg * 1.5 }]}>
            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Valor</Text>
              <Text style={[styles.cardValue, { color: theme.text }]}>
                {valorFormatado}
              </Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Vencimento</Text>
              <Text style={[styles.cardValueSm, { color: theme.text }]}>{data}</Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Tipo</Text>
              <Text style={[styles.cardValueSm, { color: theme.text }]}>
                {conta.tipo === "pagar" ? "Conta a pagar" : "Conta a receber"}
              </Text>
            </View>

            {conta.categoria ? (
              <View style={styles.cardRow}>
                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Categoria</Text>
                <Text style={[styles.cardValueSm, { color: theme.text }]}>
                  {conta.categoria}
                </Text>
              </View>
            ) : null}

            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Status</Text>
              <Text style={[styles.cardValueSm, { fontWeight: "600", color: statusColor }]}>
                {conta.status}
              </Text>
            </View>

            <View style={styles.cardRow}>
              <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Repetição</Text>
              <Text style={[styles.cardValueSm, { color: theme.text }]}>
                {conta.recorrente === 1
                  ? "Mensal"
                  : conta.recorrente === 2
                  ? "Anual"
                  : "Nenhuma"}
              </Text>
            </View>

            {conta.descricao ? (
              <View style={[styles.descBox, { backgroundColor: theme.isDark ? "rgba(255,255,255,0.06)" : "#f8fafc" }]}>
                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Descrição</Text>
                <Text style={[styles.descText, { color: theme.text }]}>
                  {conta.descricao}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            {conta.status !== "pago" ? (
              <Button
                title={conta.tipo === "pagar" ? "Marcar como paga" : "Marcar como recebida"}
                iconName="checkmark-circle"
                onPress={handleMarcarPago}
              />
            ) : (
              <Button
                title="Marcar como pendente"
                variant="outline"
                iconName="time"
                onPress={handleMarcarPendente}
              />
            )}
            <Button
              title="Editar conta"
              variant="outline"
              iconName="create"
              onPress={() => setEditando(true)}
            />
            <Button
              title="Excluir conta"
              variant="ghost"
              iconName="trash"
              onPress={abrirModalExcluir}
            />
          </View>
        </>
      )}

      <Modal
        visible={mostrarModalExcluir}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarModalExcluir(false)}
      >
        <View style={styles.modalExcluirBackdrop}>
          <View style={[styles.modalExcluirCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalExcluirIconWrap}>
              <Ionicons name="trash-outline" size={32} color={colors.danger} />
            </View>
            <Text style={[styles.modalExcluirTitle, { color: theme.text }]}>Excluir conta</Text>
            <Text style={[styles.modalExcluirMessage, { color: theme.textSecondary }]}>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalExcluirButtons}>
              <TouchableOpacity
                onPress={() => setMostrarModalExcluir(false)}
                style={[styles.modalExcluirBtnCancel, { borderColor: theme.border }]}
              >
                <Text style={[styles.modalExcluirBtnCancelText, { color: theme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmarExcluir}
                disabled={excluindo}
                style={styles.modalExcluirBtnExcluir}
              >
                <Text style={styles.modalExcluirBtnExcluirText}>
                  {excluindo ? "Excluindo..." : "Excluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Toast />
        </View>
      </Modal>

      {conta && editando && (
        <>
          <Text style={[styles.editTitle, { color: theme.text }]}>
            Editar conta
          </Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: radius.lg * 1.5 }]}>
            <FormConta
              contaInicial={conta}
              onSalvo={async () => {
                setEditando(false);
                await carregar();
              }}
            />
          </View>
        </>
      )}
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
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  notFoundText: {
    marginBottom: 12,
    fontSize: 16,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCol: {
    flex: 1,
    paddingRight: 12,
  },
  headerBadge: {
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "600",
  },
  iconWrap: {
    padding: 8,
    borderRadius: radius.lg,
  },
  card: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardValueSm: {
    fontSize: 14,
    fontWeight: "500",
  },
  descBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: radius.md,
  },
  descText: {
    marginTop: 4,
    fontSize: 14,
  },
  actions: {
    gap: 8,
  },
  editTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "600",
  },
  modalExcluirBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalExcluirCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: radius.lg * 1.5,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  modalExcluirIconWrap: {
    marginBottom: 16,
  },
  modalExcluirTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modalExcluirMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalExcluirButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalExcluirBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  modalExcluirBtnCancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalExcluirBtnExcluir: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    alignItems: "center",
  },
  modalExcluirBtnExcluirText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
