import { type SQLiteDatabase } from 'expo-sqlite';

/**
 * Script de inicialização do banco de dados.
 * Define as tabelas, índices e insere dados iniciais (Seed).
 */
export async function initializeDatabase(database: SQLiteDatabase) {
  try {
    // Ativa suporte a chaves estrangeiras
    await database.execAsync('PRAGMA foreign_keys = ON;');

    await database.execAsync(`
      -- Tabela de Configurações (Singleton: apenas 1 registro)
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        monthly_salary REAL DEFAULT 0,
        currency TEXT DEFAULT 'BRL',
        theme TEXT DEFAULT 'light',
        last_backup TEXT
      );

      -- Inicializa configurações se não existirem
      INSERT OR IGNORE INTO settings (id, monthly_salary, currency, theme) VALUES (1, 0, 'BRL', 'light');

      -- Tabela de Categorias
      -- rule_group: define a classificação na metodologia 50/30/20
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        rule_group TEXT CHECK(rule_group IN ('needs', 'wants', 'savings', 'none')) NOT NULL DEFAULT 'none'
      );

      -- Tabela de Despesas Fixas (Modelos recorrentes)
      CREATE TABLE IF NOT EXISTS fixed_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        day_due INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        active INTEGER DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      );

      -- Tabela de Transações (Histórico real de entradas e saídas)
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL, -- Formato ISO: YYYY-MM-DD
        type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
        category_id INTEGER NOT NULL,
        is_fixed INTEGER DEFAULT 0, -- Identifica se veio de um gasto fixo
        fixed_expense_id INTEGER, -- Link direto com o modelo original
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
        FOREIGN KEY (fixed_expense_id) REFERENCES fixed_expenses (id) ON DELETE SET NULL
      );

      -- Índices para otimização de consultas
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_fixed_expenses_category ON fixed_expenses(category_id);
    `);

    // Inserção de categorias padrão (Seed)
    const categoriesCount = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories'
    );

    if (categoriesCount?.count === 0) {
      await database.execAsync(`
        INSERT INTO categories (name, icon, color, type, rule_group) VALUES 
        ('Salário', 'briefcase', '#34C759', 'income', 'none'),
        ('Investimentos', 'trending-up', '#AF52DE', 'income', 'savings'),
        ('Aluguel/Moradia', 'home', '#FF3B30', 'expense', 'needs'),
        ('Alimentação', 'utensils', '#FF9500', 'expense', 'needs'),
        ('Transporte', 'car', '#007AFF', 'expense', 'needs'),
        ('Saúde', 'heart', '#FF2D55', 'expense', 'needs'),
        ('Lazer/Hobby', 'smile', '#4CD964', 'expense', 'wants'),
        ('Assinaturas', 'tv', '#5856D6', 'expense', 'wants'),
        ('Educação', 'book', '#5AC8FA', 'expense', 'needs'),
        ('Outros Ganhos', 'plus', '#8E8E93', 'income', 'none');
      `);
    }

    console.log('[Database] Inicialização concluída com sucesso.');
  } catch (error) {
    console.error('[Database] Erro na inicialização:', error);
    throw error;
  }
}
