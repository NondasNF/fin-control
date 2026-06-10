import { FixedExpenseRepository } from '../database/repositories/FixedExpenseRepository';
import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { FixedExpense } from '../types/database';

export class FixedExpenseService {
  constructor(
    private fixedExpenseRepository: FixedExpenseRepository,
    private transactionRepository: TransactionRepository
  ) {}

  /**
   * Processa despesas fixas para o mês atual.
   * Verifica se cada despesa fixa ativa já foi lançada como transação no mês/ano atual.
   * @param yearMonth Formato 'YYYY-MM'
   */
  async processMonthlyFixedExpenses(yearMonth: string): Promise<void> {
    const activeExpenses = await this.fixedExpenseRepository.findActive();
    const monthlyTransactions = await this.transactionRepository.findByMonth(yearMonth);

    for (const expense of activeExpenses) {
      // Verifica se já existe uma transação vinculada a esta despesa fixa (por descrição e valor no mesmo mês)
      const alreadyProcessed = monthlyTransactions.some(
        t => t.is_fixed === 1 && t.description === expense.description && t.amount === expense.amount
      );

      if (!alreadyProcessed) {
        // Formata a data para o dia do vencimento no mês atual
        const [year, month] = yearMonth.split('-');
        const date = `${year}-${month}-${expense.day_due.toString().padStart(2, '0')}`;

        await this.transactionRepository.create({
          description: expense.description,
          amount: expense.amount,
          date,
          type: 'expense',
          category_id: expense.category_id,
          is_fixed: 1,
        });
      }
    }
  }

  async addFixedExpense(data: Omit<FixedExpense, 'id'>): Promise<number> {
    return await this.fixedExpenseRepository.create(data);
  }

  async getAllFixedExpenses(): Promise<FixedExpense[]> {
    return await this.fixedExpenseRepository.findAll();
  }

  async deleteFixedExpense(id: number): Promise<void> {
    await this.fixedExpenseRepository.delete(id);
  }
}
