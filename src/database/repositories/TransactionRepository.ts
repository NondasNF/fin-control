import { type SQLiteDatabase } from 'expo-sqlite';
import { Transaction } from '../../types/database';

export class TransactionRepository {
  constructor(private database: SQLiteDatabase) {}

  async create(data: Omit<Transaction, 'id'>): Promise<number> {
    const result = await this.database.runAsync(
      'INSERT INTO transactions (description, amount, date, type, category_id, is_fixed, fixed_expense_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.description, data.amount, data.date, data.type, data.category_id, data.is_fixed, data.fixed_expense_id || null]
    );
    return result.lastInsertRowId;
  }

  async update(id: number, data: Partial<Omit<Transaction, 'id'>>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Transaction not found');

    await this.database.runAsync(
      'UPDATE transactions SET description = ?, amount = ?, date = ?, type = ?, category_id = ?, is_fixed = ?, fixed_expense_id = ? WHERE id = ?',
      [
        data.description ?? current.description,
        data.amount ?? current.amount,
        data.date ?? current.date,
        data.type ?? current.type,
        data.category_id ?? current.category_id,
        data.is_fixed ?? current.is_fixed,
        data.fixed_expense_id ?? current.fixed_expense_id,
        id
      ]
    );
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`[TransactionRepository] Executando SQL: DELETE FROM transactions WHERE id = ${id}`);
      await this.database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      console.log(`[TransactionRepository] Deleção de transação ${id} concluída com sucesso.`);
    } catch (error) {
      console.error('[TransactionRepository] Erro fatal no SQL de exclusão:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Transaction | null> {
    return await this.database.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
  }

  async findAll(): Promise<Transaction[]> {
    return await this.database.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
  }

  async findByMonth(yearMonth: string): Promise<Transaction[]> {
    // yearMonth format: 'YYYY-MM'
    return await this.database.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC",
      [yearMonth]
    );
  }

  async findByCategory(categoryId: number): Promise<Transaction[]> {
    return await this.database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC',
      [categoryId]
    );
  }
}
