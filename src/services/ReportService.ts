import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { Category } from '../types/database';

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  amount: number;
  color: string;
}

export class ReportService {
  constructor(private transactionRepository: TransactionRepository) {}

  /**
   * Agrupa gastos por categoria para um determinado mês.
   */
  async getSpendingByCategory(yearMonth: string, categories: Category[]): Promise<CategorySpending[]> {
    const transactions = await this.transactionRepository.findByMonth(yearMonth);
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const spendingMap = new Map<number, number>();
    
    expenses.forEach(t => {
      const current = spendingMap.get(t.category_id) || 0;
      spendingMap.set(t.category_id, current + t.amount);
    });

    return Array.from(spendingMap.entries()).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name || 'Outros',
        amount,
        color: category?.color || '#8E8E93',
      };
    }).sort((a, b) => b.amount - a.amount);
  }

  /**
   * Calcula o balanço mensal (Total Receitas - Total Despesas).
   */
  async getMonthlyBalance(yearMonth: string): Promise<{ income: number; expense: number; balance: number }> {
    const transactions = await this.transactionRepository.findByMonth(yearMonth);
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }
}
