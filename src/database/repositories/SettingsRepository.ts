import { type SQLiteDatabase } from 'expo-sqlite';
import { Settings } from '../types/database';

export class SettingsRepository {
  constructor(private database: SQLiteDatabase) {}

  async find(): Promise<Settings | null> {
    return await this.database.getFirstAsync<Settings>('SELECT * FROM settings WHERE id = 1');
  }

  async update(data: Partial<Omit<Settings, 'id'>>): Promise<void> {
    const current = await this.find();
    if (!current) return;

    const {
      monthly_salary = current.monthly_salary,
      currency = current.currency,
      theme = current.theme,
      last_backup = current.last_backup
    } = data;

    await this.database.runAsync(
      'UPDATE settings SET monthly_salary = ?, currency = ?, theme = ?, last_backup = ? WHERE id = 1',
      [monthly_salary, currency, theme, last_backup || null]
    );
  }
}
