import type { ContaStatus, ContaTipo } from "../database";

export interface Conta {
  id?: number;
  titulo: string;
  descricao?: string;
  valor: number;
  tipo: ContaTipo;
  categoria?: string;
  data_vencimento: string; // ISO date (YYYY-MM-DD)
  /** Horário do lembrete no dia do vencimento (HH:mm). Opcional. */
  hora_lembrete?: string | null;
  status: ContaStatus;
  /**
   * 0 = não recorrente
   * 1 = mensal
   * 2 = anual
   */
  recorrente: 0 | 1 | 2;
  data_criacao: string; // ISO datetime
}


