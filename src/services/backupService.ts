import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SQLiteDatabase } from 'expo-sqlite';
import { Category, Transaction, FixedExpense, Settings } from '../types/database';

export const backupDatabase = async (db: SQLiteDatabase) => {
  try {
    const categories = await db.getAllAsync<Category>('SELECT * FROM categories');
    const transactions = await db.getAllAsync<Transaction>('SELECT * FROM transactions');
    const fixedExpenses = await db.getAllAsync<FixedExpense>('SELECT * FROM fixed_expenses');
    const settings = await db.getAllAsync<Settings>('SELECT * FROM settings');

    const backupData = {
      categories,
      transactions,
      fixedExpenses,
      settings,
      exportDate: new Date().toISOString(),
    };

    const fileName = `fin-control-backup-${new Date().getTime()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Usando a API estável via import de legacy
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
 else {
      console.log('Sharing is not available');
    }
  } catch (error) {
    console.error('Error during backup:', error);
    throw error;
  }
};

export const restoreDatabase = async (db: SQLiteDatabase, jsonString: string) => {
  try {
    console.log('[BackupService] Iniciando restauração...');
    const data = JSON.parse(jsonString);

    await db.withTransactionAsync(async () => {
      console.log('[BackupService] Limpando dados antigos...');
      await db.runAsync('DELETE FROM transactions');
      await db.runAsync('DELETE FROM fixed_expenses');
      await db.runAsync('DELETE FROM categories');
      
      console.log(`[BackupService] Restaurando ${data.categories.length} categorias...`);
      for (const cat of data.categories) {
        await db.runAsync(
          'INSERT INTO categories (id, name, icon, color, type, rule_group) VALUES (?, ?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.icon, cat.color, cat.type, cat.rule_group]
        );
      }

      console.log(`[BackupService] Restaurando ${data.fixedExpenses.length} gastos fixos...`);
      for (const fe of data.fixedExpenses) {
        await db.runAsync(
          'INSERT INTO fixed_expenses (id, description, amount, day_due, category_id, active) VALUES (?, ?, ?, ?, ?, ?)',
          [fe.id, fe.description, fe.amount, fe.day_due, fe.category_id, fe.active]
        );
      }

      if (data.settings) {
        console.log('[BackupService] Restaurando configurações...');
        const s = Array.isArray(data.settings) ? data.settings[0] : data.settings;
        await db.runAsync(
          'UPDATE settings SET monthly_salary = ?, currency = ?, theme = ? WHERE id = 1',
          [s.monthly_salary || 0, s.currency || 'BRL', s.theme || 'light']
        );
      }

      console.log(`[BackupService] Restaurando ${data.transactions.length} transações...`);
      for (const t of data.transactions) {
        await db.runAsync(
          'INSERT INTO transactions (description, amount, date, type, category_id, is_fixed, fixed_expense_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [t.description, t.amount, t.date, t.type, t.category_id, t.is_fixed || 0, t.fixed_expense_id || null]
        );
      }
    });

    console.log('[BackupService] Restauração concluída com sucesso!');
  } catch (error: any) {
    console.error('[BackupService] Erro detalhado na restauração:', error);
    // Re-lança o erro com mensagem mais clara para o Alert da UI
    throw new Error(`Falha no JSON: ${error.message}`);
  }
};
