import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Switch,
} from "react-native";

const DateTimePicker =
  Platform.OS === "ios"
    ? require("@react-native-community/datetimepicker/src/datetimepicker.ios").default
    : require("@react-native-community/datetimepicker/src/datetimepicker.android").default;
import Toast from "react-native-toast-message";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import type { Conta } from "../types/conta";
import { criarConta, atualizarConta } from "../services/contas";
import { useTheme } from "../theme/ThemeContext";
import { colors, radius, typography } from "../theme/tokens";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  contaInicial?: Conta;
  onSalvo?: () => void;
}

export function FormConta({ contaInicial, onSalvo }: Props) {
  const theme = useTheme();
  const [titulo, setTitulo] = useState(contaInicial?.titulo ?? "");
  const [descricao, setDescricao] = useState(contaInicial?.descricao ?? "");
  // valor em duas formas:
  // - valorDigits: apenas dígitos (centavos) para cálculo
  // - valor: texto formatado em moeda BRL (ex: 1.234,56)
  const [valorDigits, setValorDigits] = useState<string>(() =>
    contaInicial ? Math.round(contaInicial.valor * 100).toString() : ""
  );
  const [valor, setValor] = useState<string>(() =>
    contaInicial
      ? contaInicial.valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).replace("R$", "").trim()
      : ""
  );
  const [tipo, setTipo] = useState<"pagar" | "receber">(
    contaInicial?.tipo ?? "pagar"
  );
  const [categoria, setCategoria] = useState(contaInicial?.categoria ?? "");
  const [dataVencimento, setDataVencimento] = useState(
    contaInicial?.data_vencimento.slice(0, 10) ?? ""
  );
  const [recorrente, setRecorrente] = useState<0 | 1 | 2>(
    contaInicial?.recorrente ?? 0
  );
  const [salvando, setSalvando] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [definirHorario, setDefinirHorario] = useState(
    !!(contaInicial?.hora_lembrete && contaInicial.hora_lembrete.trim() !== "")
  );
  const [horarioLembrete, setHorarioLembrete] = useState(
    contaInicial?.hora_lembrete?.slice(0, 5) ?? "09:00"
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [erroTitulo, setErroTitulo] = useState("");
  const [erroValor, setErroValor] = useState("");
  const [erroData, setErroData] = useState("");

  function formatValorFromDigits(digits: string): string {
    if (!digits) return "";
    const intVal = parseInt(digits, 10);
    if (isNaN(intVal)) return "";
    const cents = intVal % 100;
    const reais = Math.floor(intVal / 100);
    const reaisStr = reais.toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    });
    const centsStr = cents.toString().padStart(2, "0");
    return `${reaisStr},${centsStr}`;
  }

  function dataParaDate(str: string): Date {
    if (!str || str.length < 10) return new Date();
    const [y, m, d] = str.slice(0, 10).split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  function dateParaYYYYMMDD(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function horaParaDate(hhmm: string): Date {
    const [h, m] = (hhmm || "09:00").split(":").map(Number);
    const d = new Date();
    d.setHours(h ?? 9, m ?? 0, 0, 0);
    return d;
  }

  function dateParaHHmm(d: Date): string {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function validar(): boolean {
    setErroTitulo("");
    setErroValor("");
    setErroData("");
    if (!titulo.trim()) {
      setErroTitulo("Informe o nome da conta.");
      return false;
    }
    if (!valorDigits || isNaN(parseInt(valorDigits, 10))) {
      setErroValor("Informe um valor numérico válido.");
      return false;
    }
    if (!dataVencimento) {
      setErroData("Escolha a data de vencimento.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validar()) return;
    try {
      setSalvando(true);
      const valorNumero =
        valorDigits && !isNaN(parseInt(valorDigits, 10))
          ? parseInt(valorDigits, 10) / 100
          : 0;
      const base = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        valor: valorNumero,
        tipo,
        categoria: categoria.trim(),
        data_vencimento: dataVencimento,
        hora_lembrete: definirHorario ? horarioLembrete : null,
        recorrente,
      };

      if (contaInicial?.id) {
        await atualizarConta(contaInicial.id, base);
        Toast.show({ type: "success", text1: "Conta atualizada" });
      } else {
        await criarConta(base as any);
        Toast.show({ type: "success", text1: "Conta cadastrada" });
      }

      onSalvo?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[FormConta] Erro ao salvar conta:", e);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: __DEV__ ? msg : "Não foi possível salvar a conta.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Input
        label="Nome da conta"
        value={titulo}
        onChangeText={(t) => { setTitulo(t); setErroTitulo(""); }}
        placeholder="Ex: Aluguel, Internet..."
        iconName="pricetag-outline"
        error={erroTitulo}
      />
      <Input
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Opcional"
        multiline
        iconName="document-text-outline"
      />

      <Input
        label="Valor (R$)"
        value={valor}
        onChangeText={(v) => {
          // Mantém apenas dígitos e formata como moeda BRL enquanto digita
          const cleaned = v.replace(/\D/g, "");
          setErroValor("");
          if (!cleaned) {
            setValorDigits("");
            setValor("");
            return;
          }
          setValorDigits(cleaned);
          setValor(formatValorFromDigits(cleaned));
        }}
        keyboardType="decimal-pad"
        placeholder="0,00"
        iconName="cash-outline"
        error={erroValor}
      />

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>Tipo</Text>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setTipo("pagar")}
            style={[
              styles.typeButton,
              { borderColor: theme.border, backgroundColor: theme.surface },
              tipo === "pagar" && { borderColor: colors.danger, backgroundColor: theme.isDark ? "rgba(239,68,68,0.15)" : "#fef2f2" },
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: theme.text },
                tipo === "pagar" && { color: colors.danger },
              ]}
            >
              Conta a pagar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTipo("receber")}
            style={[
              styles.typeButton,
              { borderColor: theme.border, backgroundColor: theme.surface },
              tipo === "receber" && { borderColor: colors.success, backgroundColor: theme.isDark ? "rgba(34,197,94,0.15)" : "#ecfdf3" },
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: theme.text },
                tipo === "receber" && { color: colors.success },
              ]}
            >
              Conta a receber
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Input
        label="Categoria"
        value={categoria}
        onChangeText={setCategoria}
        placeholder="Ex: Moradia, Lazer, Salário..."
        iconName="albums-outline"
      />

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>
          Data de vencimento
        </Text>
        <TouchableOpacity
          onPress={() => { setShowDatePicker(true); setErroData(""); }}
          style={[
            styles.dateTouchable,
            {
              borderColor: erroData ? colors.danger : (theme.isDark ? colors.zinc700 : colors.slate200),
              backgroundColor: theme.isDark ? "rgba(0,0,0,0.6)" : colors.lightSurface,
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={theme.textSecondary}
            style={styles.dateIcon}
          />
          <Text style={[styles.dateText, { color: dataVencimento ? theme.text : theme.textSecondary }]}>
            {dataVencimento
              ? new Date(dataVencimento + "T12:00:00").toLocaleDateString("pt-BR")
              : "Toque para escolher a data"}
          </Text>
        </TouchableOpacity>
        {erroData ? <Text style={styles.dateError}>{erroData}</Text> : null}
      </View>

      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>
          Definir horário para lembrete
        </Text>
        <Switch
          value={definirHorario}
          onValueChange={setDefinirHorario}
          trackColor={{ false: theme.border, true: theme.isDark ? "rgba(34,197,94,0.5)" : colors.primarySoft }}
          thumbColor={definirHorario ? colors.primary : (theme.isDark ? "#71717a" : "#cbd5e1")}
        />
      </View>

      {definirHorario && (
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>
            Horário do lembrete
          </Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={[
              styles.dateTouchable,
              {
                borderColor: theme.isDark ? colors.zinc700 : colors.slate200,
                backgroundColor: theme.isDark ? "rgba(0,0,0,0.6)" : colors.lightSurface,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={theme.textSecondary}
              style={styles.dateIcon}
            />
            <Text style={[styles.dateText, { color: theme.text }]}>
              {horarioLembrete} — notificação no vencimento
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showDatePicker && (
        Platform.OS === "ios" ? (
          <Modal transparent visible animationType="slide">
            <TouchableOpacity
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={[styles.datePickerContainer, { backgroundColor: theme.surface }]}>
              <View style={[styles.datePickerHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: theme.primary, fontWeight: "600" }}>Concluir</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dataParaDate(dataVencimento)}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) setDataVencimento(dateParaYYYYMMDD(selectedDate));
                }}
                locale="pt-BR"
              />
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={dataParaDate(dataVencimento)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type === "set" && selectedDate) {
                setDataVencimento(dateParaYYYYMMDD(selectedDate));
              }
            }}
          />
        )
      )}

      {showTimePicker && (
        Platform.OS === "ios" ? (
          <Modal transparent visible animationType="slide">
            <TouchableOpacity
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            />
            <View style={[styles.datePickerContainer, { backgroundColor: theme.surface }]}>
              <View style={[styles.datePickerHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={{ color: theme.primary, fontWeight: "600" }}>Concluir</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={horaParaDate(horarioLembrete)}
                mode="time"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) setHorarioLembrete(dateParaHHmm(selectedDate));
                }}
                is24Hour
              />
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={horaParaDate(horarioLembrete)}
            mode="time"
            display="default"
            is24Hour
            onChange={(event, selectedDate) => {
              setShowTimePicker(false);
              if (event.type === "set" && selectedDate) {
                setHorarioLembrete(dateParaHHmm(selectedDate));
              }
            }}
          />
        )
      )}

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>Repetição</Text>
        <View style={styles.row}>
          {[
            { id: 0 as 0, label: "Nenhuma" },
            { id: 1 as 1, label: "Mensal" },
            { id: 2 as 2, label: "Anual" },
          ].map((opt) => {
            const ativo = recorrente === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setRecorrente(opt.id)}
                style={[
                  styles.repeatButton,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  ativo && {
                    borderColor: theme.primary,
                    backgroundColor: theme.isDark ? "rgba(34,197,94,0.25)" : colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.repeatButtonText,
                    { color: theme.text },
                    ativo && { color: "#FFFFFF" },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Button
        title={contaInicial ? "Salvar alterações" : "Cadastrar conta"}
        onPress={handleSubmit}
        disabled={salvando}
        variant={theme.isDark ? "primary" : "outline"}
        textColorOverride={theme.isDark ? "#FFFFFF" : theme.primary}
        iconColorOverride={theme.isDark ? "#FFFFFF" : theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  group: {
    marginBottom: 16,
  },
  groupLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    columnGap: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  typeButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  repeatButton: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  repeatButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  dateTouchable: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingLeft: 40,
    paddingVertical: 12,
  },
  dateIcon: {
    position: "absolute",
    left: 12,
  },
  dateText: {
    fontSize: typography.body.fontSize,
  },
  dateError: {
    marginTop: 4,
    fontSize: 12,
    color: colors.danger,
  },
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  datePickerContainer: {
    borderTopLeftRadius: radius.lg * 1.5,
    borderTopRightRadius: radius.lg * 1.5,
    paddingBottom: 24,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});


