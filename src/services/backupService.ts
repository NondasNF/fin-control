import * as FileSystem from 'expo-file-system';
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

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log('Sharing is not available');
    }
  } catch (error) {
    console.error('Error during backup:', error);
    throw error;
  }
};

export const restoreDatabase = async (db: SQLiteDatabase, jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);

    await db.withTransactionAsync(async () => {
      // Clear existing data (optional, depends on requirement - usually yes for restore)
      await db.runAsync('DELETE FROM transactions');
      await db.runAsync('DELETE FROM fixed_expenses');
      await db.runAsync('DELETE FROM categories');
      
      // Restore categories
      for (const cat of data.categories) {
        await db.runAsync(
          'INSERT INTO categories (id, name, icon, color, type, rule_group) VALUES (?, ?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.icon, cat.color, cat.type, cat.rule_group]
        );
      }

      // Restore fixed expenses
      for (const fe of data.fixedExpenses) {
        await db.runAsync(
          'INSERT INTO fixed_expenses (id, description, amount, day_due, category_id, active) VALUES (?, ?, ?, ?, ?, ?)',
          [fe.id, fe.description, fe.amount, fe.day_due, fe.category_id, fe.active]
        );
      }

      // Restore transactions
      for (const t of data.transactions) {
        await db.runAsync(
          'INSERT INTO transactions (id, description, amount, date, type, category_id, is_fixed) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [t.id, t.description, t.amount, t.date, t.type, t.category_id, t.is_fixed || 0]
        );
      }
    });

    console.log('Database restored successfully');
  } catch (error) {
    console.error('Error during restore:', error);
    throw error;
  }
};
