import * as SQLite from "expo-sqlite";

// Novo nome de arquivo para evitar problemas com bancos antigos incompatíveis
const DB_NAME = "controle_financeiro_v2.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export type ContaStatus = "pendente" | "pago" | "atrasado";
export type ContaTipo = "pagar" | "receber";

export async function getDb() {
  if (!dbPromise) {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS contas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT,
        valor REAL NOT NULL,
        tipo TEXT NOT NULL,
        categoria TEXT,
        data_vencimento TEXT NOT NULL,
        hora_lembrete TEXT,
        status TEXT NOT NULL,
        recorrente INTEGER DEFAULT 0,
        data_criacao TEXT NOT NULL
      );
    `);
    try {
      await db.execAsync("ALTER TABLE contas ADD COLUMN hora_lembrete TEXT;");
    } catch {
      // coluna já existe (migração já rodou)
    }
    dbPromise = Promise.resolve(db);
  }
  return dbPromise;
}


