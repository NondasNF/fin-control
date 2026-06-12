import { Alert, View } from 'react-native';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { Category, Transaction, FixedExpense, Settings } from '../types/database';
import { CategoryRepository } from '../database/repositories/CategoryRepository';
import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { FixedExpenseRepository } from '../database/repositories/FixedExpenseRepository';
import { SettingsRepository } from '../database/repositories/SettingsRepository';
import { BudgetService, BudgetSummary } from '../services/BudgetService';
import { FixedExpenseService } from '../services/FixedExpenseService';

interface DataContextData {
  db: SQLiteDatabase;
  categories: Category[];
  transactions: Transaction[]; // Transações do mês selecionado
  fixedExpenses: FixedExpense[];
  settings: Settings | null;
  budgetSummary: BudgetSummary | null;
  dashboardSummary: BudgetSummary | null;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateMonthlySalary: (amount: number) => Promise<void>;
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => Promise<void>;
  updateFixedExpense: (id: number, expense: Partial<Omit<FixedExpense, 'id'>>) => Promise<void>;
  deleteFixedExpense: (id: number) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextData>({} as DataContextData);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  
  // Repositories
  const categoryRepo = useMemo(() => new CategoryRepository(db), [db]);
  const transactionRepo = useMemo(() => new TransactionRepository(db), [db]);
  const fixedExpenseRepo = useMemo(() => new FixedExpenseRepository(db), [db]);
  const settingsRepo = useMemo(() => new SettingsRepository(db), [db]);

  // Services
  const budgetService = useMemo(() => new BudgetService(), []);
  const fixedExpenseService = useMemo(() => new FixedExpenseService(fixedExpenseRepo, transactionRepo), [fixedExpenseRepo, transactionRepo]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>([]);
  const [selectedMonthTransactions, setSelectedMonthTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      
      const currentYearMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      
      await fixedExpenseService.processMonthlyFixedExpenses(currentYearMonth);

      const [categoriesData, currentTransactionsData, selectedTransactionsData, fixedExpensesData, settingsData] = await Promise.all([
        categoryRepo.findAll(),
        transactionRepo.findByMonth(currentYearMonth),
        selectedMonth === currentYearMonth ? transactionRepo.findByMonth(currentYearMonth) : transactionRepo.findByMonth(selectedMonth),
        fixedExpenseRepo.findAll(),
        settingsRepo.find()
      ]);

      setCategories(categoriesData);
      setCurrentTransactions(currentTransactionsData);
      setSelectedMonthTransactions(selectedTransactionsData);
      setFixedExpenses(fixedExpensesData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryRepo, transactionRepo, fixedExpenseRepo, settingsRepo, fixedExpenseService, selectedMonth]);

  const budgetSummary = useMemo(() => {
    if (!settings || categories.length === 0) return null;
    return budgetService.calculateBudgetSummary(settings.monthly_salary, selectedMonthTransactions, categories);
  }, [settings, selectedMonthTransactions, categories, budgetService]);

  const dashboardSummary = useMemo(() => {
    if (!settings || categories.length === 0) return null;
    return budgetService.calculateBudgetSummary(settings.monthly_salary, currentTransactions, categories);
  }, [settings, currentTransactions, categories, budgetService]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      await transactionRepo.create(transaction);
      await refreshData();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      console.log(`[DataContext] Deletando transação ID: ${id}`);
      await transactionRepo.delete(id);
      await refreshData();
      console.log('[DataContext] Refresh após deleção concluído');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Erro ao excluir', error.message || 'Erro desconhecido');
    }
  };

  const updateMonthlySalary = async (amount: number) => {
    try {
      await settingsRepo.update({ monthly_salary: amount });
      await refreshData();
    } catch (error: any) {
      console.error('Error updating salary:', error);
      Alert.alert('Erro ao salvar salário', error.message || 'Erro desconhecido');
    }
  };

  const addFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => {
    try {
      await fixedExpenseRepo.create(expense);
      await refreshData();
    } catch (error: any) {
      console.error('Error adding fixed expense:', error);
      Alert.alert('Erro ao salvar gasto fixo', error.message || 'Erro desconhecido');
    }
  };

  const updateFixedExpense = async (id: number, expense: Partial<Omit<FixedExpense, 'id'>>) => {
    try {
      await fixedExpenseRepo.update(id, expense);
      await refreshData();
    } catch (error: any) {
      console.error('Error updating fixed expense:', error);
      Alert.alert('Erro ao atualizar gasto fixo', error.message || 'Erro desconhecido');
    }
  };

  const deleteFixedExpense = async (id: number) => {
    try {
      console.log(`[DataContext] Deletando gasto fixo ID: ${id}`);
      await fixedExpenseRepo.delete(id);
      await refreshData();
      console.log('[DataContext] Refresh após deleção de gasto fixo concluído');
    } catch (error: any) {
      console.error('Error deleting fixed expense:', error);
      Alert.alert('Erro ao excluir gasto fixo', error.message || 'Erro desconhecido');
    }
  };

  const resetAllData = async () => {
    try {
      await db.execAsync('DELETE FROM transactions; DELETE FROM fixed_expenses;');
      await refreshData();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider
      value={{
        db,
        categories,
        transactions: selectedMonthTransactions,
        fixedExpenses,
        settings,
        budgetSummary,
        dashboardSummary,
        selectedMonth,
        setSelectedMonth,
        loading,
        refreshData,
        addTransaction,
        deleteTransaction,
        updateMonthlySalary,
        addFixedExpense,
        updateFixedExpense,
        deleteFixedExpense,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
