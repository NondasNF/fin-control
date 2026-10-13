import { Alert } from 'react-native';
import { FixedExpense, Transaction } from '../types/database';
import { formatCurrency } from '../utils/formatters';

export type BudgetAlertSeverity = 'healthy' | 'warning' | 'critical';

export interface BudgetAlertState {
  severity: BudgetAlertSeverity;
  title: string;
  message: string;
  totalExpense: number;
  monthlySalary: number;
  available: number;
  availablePercent: number;
  spentPercent: number;
}

let lastBudgetAlertKey: string | null = null;

export class BudgetAlertService {
  static buildBudgetAlertState(
    monthlySalary: number,
    transactions: Transaction[],
    fixedExpenses: FixedExpense[]
  ): BudgetAlertState | null {
    return buildBudgetAlertState(monthlySalary, transactions, fixedExpenses);
  }

  static async notifyBudgetAlertIfNeeded(
    alertState: BudgetAlertState | null
  ): Promise<void> {
    await notifyBudgetAlertIfNeeded(alertState);
  }
}

const getExpenseTotal = (transactions: Transaction[], fixedExpenses: FixedExpense[]) => {
  const transactionExpenseTotal = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const fixedExpenseTotal = fixedExpenses
    .filter((fixedExpense) => fixedExpense.active)
    .reduce((total, fixedExpense) => total + fixedExpense.amount, 0);

  return transactionExpenseTotal + fixedExpenseTotal;
};

export function buildBudgetAlertState(
  monthlySalary: number,
  transactions: Transaction[],
  fixedExpenses: FixedExpense[]
): BudgetAlertState | null {
  if (!monthlySalary || monthlySalary <= 0) {
    return null;
  }

  const totalExpense = getExpenseTotal(transactions, fixedExpenses);
  const available = monthlySalary - totalExpense;
  const availablePercent = (available / monthlySalary) * 100;
  const spentPercent = 100 - availablePercent;

  if (available > 0 && availablePercent >= 30) {
    return {
      severity: 'healthy',
      title: 'Orçamento saudável',
      message: `Você ainda pode gastar ${formatCurrency(available)} este mês e continua com ${availablePercent.toFixed(1)}% disponível.`,
      totalExpense,
      monthlySalary,
      available,
      availablePercent,
      spentPercent,
    };
  }

  if (available > 0) {
    return {
      severity: 'warning',
      title: '⚠️ Atenção ao seu orçamento!',
      message: `Você já consumiu ${spentPercent.toFixed(1)}% do seu limite mensal. Você ainda pode gastar ${formatCurrency(available)}.`,
      totalExpense,
      monthlySalary,
      available,
      availablePercent,
      spentPercent,
    };
  }

  return {
    severity: 'critical',
    title: '⛔ Limite excedido!',
    message: `Você ultrapassou o limite mensal. Gasto atual: ${formatCurrency(totalExpense)}.`,
    totalExpense,
    monthlySalary,
    available,
    availablePercent: 0,
    spentPercent: 100,
  };
}

export async function notifyBudgetAlertIfNeeded(
  alertState: BudgetAlertState | null
): Promise<void> {
  if (!alertState || alertState.severity === 'healthy') {
    return;
  }

  const alertKey = `${alertState.severity}:${Math.round(alertState.available)}:${Math.round(alertState.spentPercent)}`;
  if (lastBudgetAlertKey === alertKey) {
    return;
  }

  lastBudgetAlertKey = alertKey;

  try {
    const notifee = require('@notifee/react-native');
    if (notifee?.createChannel && notifee?.displayNotification) {
      const channelId = await notifee.createChannel({
        id: 'budget-alerts',
        name: 'Alertas de orçamento',
      });

      await notifee.displayNotification({
        title: alertState.title,
        body: alertState.message,
        android: {
          channelId,
          pressAction: { id: 'default' },
        },
      });
      return;
    }
  } catch {
    // Fallback visual para ambientes sem a biblioteca nativa.
  }

  Alert.alert(alertState.title, alertState.message);
}
