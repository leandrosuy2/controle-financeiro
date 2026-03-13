import { getDb, ContaStatus, ContaTipo } from "../database";
import type { Conta } from "../types/conta";
import {
  agendarNotificacoesConta,
  cancelarNotificacaoConta,
} from "./notifications";

export type FiltroPeriodo = "dia" | "semana" | "mes" | "todos";

export interface FiltrosContas {
  periodo?: FiltroPeriodo;
  categoria?: string;
  tipo?: ContaTipo;
  status?: ContaStatus;
  dataBase?: string; // ISO date para filtros de período
}

function hojeISO() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje.toISOString().slice(0, 10);
}

function calcularStatus(dataVencimentoISO: string, statusAtual: ContaStatus): ContaStatus {
  if (statusAtual === "pago") return "pago";

  const hoje = new Date(hojeISO());
  const vencimento = new Date(dataVencimentoISO);

  if (vencimento < hoje) return "atrasado";
  return "pendente";
}

export async function criarConta(conta: Omit<Conta, "id" | "data_criacao" | "status">) {
  const db = await getDb();
  const agora = new Date().toISOString();
  const status: ContaStatus = calcularStatus(conta.data_vencimento, "pendente");

  const result = await db.runAsync(
    `INSERT INTO contas 
    (titulo, descricao, valor, tipo, categoria, data_vencimento, hora_lembrete, status, recorrente, data_criacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      conta.titulo,
      conta.descricao ?? "",
      conta.valor,
      conta.tipo,
      conta.categoria ?? "",
      conta.data_vencimento,
      conta.hora_lembrete ?? null,
      status,
      conta.recorrente ?? 0,
      agora,
    ]
  );

  const id = Number(result.lastInsertRowId);

  await agendarNotificacoesConta(id, conta.titulo, conta.data_vencimento, conta.hora_lembrete ?? undefined, conta.tipo);

  return id;
}

export async function atualizarConta(id: number, conta: Partial<Omit<Conta, "id">>) {
  const db = await getDb();
  const contaAtual = await obterContaPorId(id);
  if (!contaAtual) return;

  const atualizada: Conta = {
    ...contaAtual,
    ...conta,
  };

  const novoStatus = calcularStatus(atualizada.data_vencimento, atualizada.status);

  await db.runAsync(
    `UPDATE contas SET 
      titulo = ?, 
      descricao = ?, 
      valor = ?, 
      tipo = ?, 
      categoria = ?, 
      data_vencimento = ?, 
      hora_lembrete = ?,
      status = ?, 
      recorrente = ?
    WHERE id = ?`,
    [
      atualizada.titulo,
      atualizada.descricao ?? "",
      atualizada.valor,
      atualizada.tipo,
      atualizada.categoria ?? "",
      atualizada.data_vencimento,
      atualizada.hora_lembrete ?? null,
      novoStatus,
      atualizada.recorrente ?? 0,
      id,
    ]
  );

  await agendarNotificacoesConta(id, atualizada.titulo, atualizada.data_vencimento, atualizada.hora_lembrete ?? undefined, atualizada.tipo);
}

export async function excluirConta(id: number) {
  await cancelarNotificacaoConta(id);
  const db = await getDb();
  await db.runAsync("DELETE FROM contas WHERE id = ?", [id]);
}

export async function marcarContaComo(
  id: number,
  novoStatus: Exclude<ContaStatus, "atrasado">
) {
  const db = await getDb();

  let statusFinal: ContaStatus = novoStatus;
  if (novoStatus === "pendente") {
    const conta = await obterContaPorId(id);
    if (!conta) return;
    statusFinal = calcularStatus(conta.data_vencimento, "pendente");
  }

  await db.runAsync("UPDATE contas SET status = ? WHERE id = ?", [statusFinal, id]);

  if (statusFinal === "pago") {
    await cancelarNotificacaoConta(id);
  }
}

function montarClausulasFiltro(filtros?: FiltrosContas) {
  const where: string[] = [];
  const params: any[] = [];

  if (!filtros) return { whereSql: "", params };

  const dataBase = filtros.dataBase ?? hojeISO();

  if (filtros.periodo && filtros.periodo !== "todos") {
    if (filtros.periodo === "dia") {
      where.push("date(data_vencimento) = date(?)");
      params.push(dataBase);
    } else if (filtros.periodo === "semana") {
      where.push(
        `date(data_vencimento) BETWEEN date(?, '-6 days') AND date(?)`
      );
      params.push(dataBase, dataBase);
    } else if (filtros.periodo === "mes") {
      where.push(
        `strftime('%Y-%m', data_vencimento) = strftime('%Y-%m', ?)`
      );
      params.push(dataBase);
    }
  }

  if (filtros.categoria) {
    where.push("categoria = ?");
    params.push(filtros.categoria);
  }

  if (filtros.tipo) {
    where.push("tipo = ?");
    params.push(filtros.tipo);
  }

  if (filtros.status) {
    where.push("status = ?");
    params.push(filtros.status);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export async function listarContas(filtros?: FiltrosContas): Promise<Conta[]> {
  const db = await getDb();
  const { whereSql, params } = montarClausulasFiltro(filtros);

  const rows = await db.getAllAsync<Conta>(
    `SELECT * FROM contas ${whereSql} ORDER BY date(data_vencimento) ASC`,
    params
  );

  const atualizadas = rows.map((row) => ({
    ...row,
    status: calcularStatus(row.data_vencimento, row.status),
  }));

  for (const conta of atualizadas) {
    if (conta.status !== rows.find((r) => r.id === conta.id)?.status) {
      await db.runAsync("UPDATE contas SET status = ? WHERE id = ?", [
        conta.status,
        conta.id,
      ]);
    }
  }

  return atualizadas;
}

export async function obterContaPorId(id: number): Promise<Conta | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<Conta>("SELECT * FROM contas WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  const conta = rows[0];
  const status = calcularStatus(conta.data_vencimento, conta.status);
  if (status !== conta.status) {
    await db.runAsync("UPDATE contas SET status = ? WHERE id = ?", [status, id]);
  }
  return { ...conta, status };
}

export interface ResumoMensal {
  totalPagar: number;
  totalReceber: number;
  saldoPrevisto: number;
  vencendoHoje: number;
  atrasadas: number;
}

export async function obterResumoMensal(
  referenciaISO: string = hojeISO()
): Promise<ResumoMensal> {
  const db = await getDb();

  const rows = await db.getAllAsync<Conta>(
    `SELECT * FROM contas 
     WHERE strftime('%Y-%m', data_vencimento) = strftime('%Y-%m', ?)`,
    [referenciaISO]
  );

  let totalPagar = 0;
  let totalReceber = 0;
  let vencendoHoje = 0;
  let atrasadas = 0;

  const hoje = hojeISO();

  rows.forEach((conta) => {
    const status = calcularStatus(conta.data_vencimento, conta.status);
    if (conta.tipo === "pagar") {
      totalPagar += conta.valor;
    } else {
      totalReceber += conta.valor;
    }

    if (status !== conta.status) {
      db.runAsync("UPDATE contas SET status = ? WHERE id = ?", [status, conta.id]);
    }

    if (conta.data_vencimento.slice(0, 10) === hoje) {
      vencendoHoje += 1;
    }
    if (status === "atrasado") {
      atrasadas += 1;
    }
  });

  return {
    totalPagar,
    totalReceber,
    saldoPrevisto: totalReceber - totalPagar,
    vencendoHoje,
    atrasadas,
  };
}

/** Contas pendentes/atrasadas que vencem nos próximos N dias (a partir de hoje). */
export async function obterProximasVencer(dias: number = 7): Promise<Conta[]> {
  const db = await getDb();
  const hoje = hojeISO();
  const fim = new Date();
  fim.setDate(fim.getDate() + dias);
  const fimISO = fim.toISOString().slice(0, 10);

  const rows = await db.getAllAsync<Conta>(
    `SELECT * FROM contas 
     WHERE date(data_vencimento) BETWEEN date(?) AND date(?)
     AND status != 'pago'
     ORDER BY date(data_vencimento) ASC
     LIMIT 15`,
    [hoje, fimISO]
  );

  return rows.map((c) => ({
    ...c,
    status: calcularStatus(c.data_vencimento, c.status),
  }));
}

