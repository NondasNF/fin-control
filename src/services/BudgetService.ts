import { FixedExpense, Transaction } from '../types/database';

export interface BudgetSummary {
  monthlySalary: number;
  needs: {
    limit: number;
    actual: number;
    percentage: number;
    remaining: number;
  };
  wants: {
    limit: number;
    actual: number;
    percentage: number;
    remaining: number;
  };
  savings: {
    limit: number;
    actual: number;
    percentage: number;
    remaining: number;
  };
  totalExpense: number;
}

export class BudgetService {
  /**
   * Calcula o resumo do orçamento com base na metodologia 50/30/20.
   * - Needs (Necessidades): Soma de todas as despesas fixas ATIVAS.
   * - Wants (Desejos): Soma de todas as transações de despesa manuais.
   * - Savings (Reserva/Investimento): O que sobra do salário após Needs e Wants.
   */
  calculateBudgetSummary(
    monthlySalary: number,
    transactions: Transaction[],
    fixedExpenses: FixedExpense[]
  ): BudgetSummary {
    const needsLimit = monthlySalary * 0.5;
    const wantsLimit = monthlySalary * 0.3;
    const savingsLimit = monthlySalary * 0.2;

    const actuals = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    // Needs: Soma das despesas fixas ativas
    fixedExpenses.forEach(fe => {
      if (fe.active) {
        actuals.needs += fe.amount;
      }
    });

    // Wants: Soma das transações de despesa (agora todas são consideradas Wants)
    transactions.forEach(t => {
      if (t.type === 'expense') {
        actuals.wants += t.amount;
      }
    });

    // Savings: Alvo de 20%. Se estourar Needs ou Wants, subtrai do que seria guardado.
    const potentialSavings = savingsLimit;
    const needsExcess = actuals.needs > needsLimit ? actuals.needs - needsLimit : 0;
    const wantsExcess = actuals.wants > wantsLimit ? actuals.wants - wantsLimit : 0;
    
    actuals.savings = Math.max(0, potentialSavings - (needsExcess + wantsExcess));

    return {
      monthlySalary,
      needs: {
        limit: needsLimit,
        actual: actuals.needs,
        percentage: needsLimit > 0 ? (actuals.needs / needsLimit) * 100 : 0,
        remaining: needsLimit - actuals.needs,
      },
      wants: {
        limit: wantsLimit,
        actual: actuals.wants,
        percentage: wantsLimit > 0 ? (actuals.wants / wantsLimit) * 100 : 0,
        remaining: wantsLimit - actuals.wants,
      },
      savings: {
        limit: savingsLimit,
        actual: actuals.savings,
        percentage: savingsLimit > 0 ? (actuals.savings / savingsLimit) * 100 : 0,
        remaining: savingsLimit - actuals.savings,
      },
      totalExpense: actuals.needs + actuals.wants + actuals.savings,
    };
  }
}
