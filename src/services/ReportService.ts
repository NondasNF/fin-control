import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { FixedExpenseRepository } from '../database/repositories/FixedExpenseRepository';
import { Category } from '../types/database';

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  amount: number;
  color: string;
}

export class ReportService {
  constructor(
    private transactionRepository: TransactionRepository,
    private fixedExpenseRepository: FixedExpenseRepository
  ) {}

  /**
   * Agrupa gastos por categoria para um determinado mês.
   * Inclui transações E despesas fixas ativas.
   */
  async getSpendingByCategory(yearMonth: string, categories: Category[]): Promise<CategorySpending[]> {
    const [transactions, fixedExpenses] = await Promise.all([
      this.transactionRepository.findByMonth(yearMonth),
      this.fixedExpenseRepository.findActive()
    ]);

    const spendingMap = new Map<number, number>();
    
    // Soma transações de despesa
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const current = spendingMap.get(t.category_id) || 0;
      spendingMap.set(t.category_id, current + t.amount);
    });

    // Soma despesas fixas
    fixedExpenses.forEach(fe => {
      const current = spendingMap.get(fe.category_id) || 0;
      spendingMap.set(fe.category_id, current + fe.amount);
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
   * Calcula o balanço mensal (Total Receitas - (Total Despesas + Despesas Fixas)).
   */
  async getMonthlyBalance(yearMonth: string): Promise<{ income: number; expense: number; balance: number }> {
    const [transactions, fixedExpenses] = await Promise.all([
      this.transactionRepository.findByMonth(yearMonth),
      this.fixedExpenseRepository.findActive()
    ]);
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const transactionExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const fixedExpenseTotal = fixedExpenses.reduce((sum, fe) => sum + fe.amount, 0);

    const totalExpense = transactionExpense + fixedExpenseTotal;

    return {
      income,
      expense: totalExpense,
      balance: income - totalExpense,
    };
  }
}
