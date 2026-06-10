import { Category, Transaction } from '../types/database';

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
   */
  calculateBudgetSummary(
    monthlySalary: number,
    transactions: Transaction[],
    categories: Category[]
  ): BudgetSummary {
    const needsLimit = monthlySalary * 0.5;
    const wantsLimit = monthlySalary * 0.3;
    const savingsLimit = monthlySalary * 0.2;

    // Mapeia categorias por ID para facilitar busca
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    const actuals = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const category = categoryMap.get(t.category_id);
        if (category) {
          if (category.rule_group === 'needs') actuals.needs += t.amount;
          if (category.rule_group === 'wants') actuals.wants += t.amount;
          if (category.rule_group === 'savings') actuals.savings += t.amount;
        }
      }
    });

    actuals.savings = (monthlySalary - (actuals.needs + actuals.wants)) > savingsLimit ? savingsLimit : (monthlySalary - (actuals.needs + actuals.wants));

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
