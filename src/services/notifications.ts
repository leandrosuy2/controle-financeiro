import { Platform } from "react-native";
import Constants from "expo-constants";

/** No Expo Go (SDK 53+) push/notifications não estão disponíveis; use development build para notificações locais. */
const isExpoGo = Constants.appOwnership === "expo";

const CANAL_LEMBRETES = "lembretes_contas";

function getNotifications(): typeof import("expo-notifications") | null {
  if (isExpoGo) return null;
  try {
    return require("expo-notifications");
  } catch {
    return null;
  }
}

/** Configura permissões e canal Android. Chamar ao iniciar o app. No Expo Go não faz nada. */
export async function configureNotifications() {
  if (isExpoGo) return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CANAL_LEMBRETES, {
      name: "Lembretes de contas",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
    }),
  });
}

function buildDateTrigger(dataVencimentoISO: string, horaLembrete?: string): Date {
  const [y, m, d] = dataVencimentoISO.slice(0, 10).split("-").map(Number);
  const [hh, mm] = (horaLembrete || "08:00").split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 8, mm ?? 0, 0, 0);
}

export function getIdConta(id: number): string {
  return `conta-${id}`;
}

/** Agenda notificação local no vencimento. No Expo Go não agenda (use development build). */
export async function agendarNotificacoesConta(
  id: number,
  titulo: string,
  dataVencimentoISO: string,
  horaLembrete?: string,
  tipo?: "pagar" | "receber"
) {
  if (isExpoGo) return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    await cancelarNotificacaoConta(id);

    const date = buildDateTrigger(dataVencimentoISO, horaLembrete);
    if (date.getTime() <= Date.now()) return;

    const tipoTexto = tipo === "receber" ? "a receber" : "a pagar";
    const body = `Conta ${tipoTexto} vence hoje: ${titulo}`;

    await Notifications.scheduleNotificationAsync({
      identifier: getIdConta(id),
      content: {
        title: "Controle Financeiro",
        body,
        sound: "default",
        data: { contaId: String(id) },
        ...(Platform.OS === "android" && { channelId: CANAL_LEMBRETES }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        ...(Platform.OS === "android" && { channelId: CANAL_LEMBRETES }),
      },
    });
  } catch (e) {
    console.warn("Erro ao agendar notificação:", e);
  }
}

/** Cancela a notificação agendada da conta. */
export async function cancelarNotificacaoConta(id: number) {
  if (isExpoGo) return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(getIdConta(id));
  } catch {
    // ignora se não existir
  }
}
