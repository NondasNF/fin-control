import { type SQLiteDatabase } from 'expo-sqlite';
import { FixedExpense } from '../../types/database';

export class FixedExpenseRepository {
  constructor(private database: SQLiteDatabase) {}

  async create(data: Omit<FixedExpense, 'id'>): Promise<number> {
    const result = await this.database.runAsync(
      'INSERT INTO fixed_expenses (description, amount, day_due, category_id, active) VALUES (?, ?, ?, ?, ?)',
      [data.description, data.amount, data.day_due, data.category_id, data.active]
    );
    return result.lastInsertRowId;
  }

  async update(id: number, data: Partial<Omit<FixedExpense, 'id'>>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Fixed expense not found');

    await this.database.runAsync(
      'UPDATE fixed_expenses SET description = ?, amount = ?, day_due = ?, category_id = ?, active = ? WHERE id = ?',
      [
        data.description ?? current.description,
        data.amount ?? current.amount,
        data.day_due ?? current.day_due,
        data.category_id ?? current.category_id,
        data.active ?? current.active,
        id
      ]
    );
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`[FixedExpenseRepository] Executando SQL: DELETE FROM fixed_expenses WHERE id = ${id}`);
      await this.database.runAsync('DELETE FROM fixed_expenses WHERE id = ?', [id]);
      console.log(`[FixedExpenseRepository] Deleção de gasto fixo ${id} concluída com sucesso.`);
    } catch (error) {
      console.error('[FixedExpenseRepository] Erro fatal no SQL de exclusão:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<FixedExpense | null> {
    return await this.database.getFirstAsync<FixedExpense>('SELECT * FROM fixed_expenses WHERE id = ?', [id]);
  }

  async findAll(): Promise<FixedExpense[]> {
    return await this.database.getAllAsync<FixedExpense>('SELECT * FROM fixed_expenses');
  }

  async findActive(): Promise<FixedExpense[]> {
    return await this.database.getAllAsync<FixedExpense>('SELECT * FROM fixed_expenses WHERE active = 1');
  }
}
