import { FixedExpenseRepository } from '../database/repositories/FixedExpenseRepository';
import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { FixedExpense } from '../types/database';

export class FixedExpenseService {
  constructor(
    private fixedExpenseRepository: FixedExpenseRepository,
    private transactionRepository: TransactionRepository
  ) {}

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
