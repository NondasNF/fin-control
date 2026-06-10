import { type SQLiteDatabase } from 'expo-sqlite';
import { Category } from '../../types/database';

export class CategoryRepository {
  constructor(private database: SQLiteDatabase) {}

  async create(data: Omit<Category, 'id'>): Promise<number> {
    const result = await this.database.runAsync(
      'INSERT INTO categories (name, icon, color, type, rule_group) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.icon, data.color, data.type, data.rule_group]
    );
    return result.lastInsertRowId;
  }

  async update(id: number, data: Partial<Omit<Category, 'id'>>): Promise<void> {
    const current = await this.findById(id);
    if (!current) throw new Error('Category not found');

    await this.database.runAsync(
      'UPDATE categories SET name = ?, icon = ?, color = ?, type = ?, rule_group = ? WHERE id = ?',
      [
        data.name ?? current.name,
        data.icon ?? current.icon,
        data.color ?? current.color,
        data.type ?? current.type,
        data.rule_group ?? current.rule_group,
        id
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await this.database.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  }

  async findById(id: number): Promise<Category | null> {
    return await this.database.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  }

  async findAll(): Promise<Category[]> {
    return await this.database.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
  }
}
