import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { Transaction } from '../types/database';

export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  async addTransaction(data: Omit<Transaction, 'id'>): Promise<number> {
    // Validações básicas de negócio podem entrar aqui
    if (data.amount <= 0) throw new Error('O valor deve ser maior que zero');
    return await this.transactionRepository.create(data);
  }

  async getTransactionsByMonth(yearMonth: string): Promise<Transaction[]> {
    return await this.transactionRepository.findByMonth(yearMonth);
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }

  async updateTransaction(id: number, data: Partial<Omit<Transaction, 'id'>>): Promise<void> {
    await this.transactionRepository.update(id, data);
  }
}
