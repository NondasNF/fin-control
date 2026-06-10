export type RuleGroup = 'needs' | 'wants' | 'savings' | 'none';

export type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  rule_group: RuleGroup;
};

export type Settings = {
  id: 1;
  monthly_salary: number;
  currency: string;
  theme: 'light' | 'dark';
  last_backup?: string;
};

export type FixedExpense = {
  id: number;
  description: string;
  amount: number;
  day_due: number;
  category_id: number;
  active: number; // 0 or 1
};

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category_id: number;
  is_fixed: number; // 0 or 1
  fixed_expense_id?: number;
};
