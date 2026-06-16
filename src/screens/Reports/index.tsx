import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { ReportService, CategorySpending } from '../../services/ReportService';
import { TransactionRepository } from '../../database/repositories/TransactionRepository';
import { FixedExpenseRepository } from '../../database/repositories/FixedExpenseRepository';
import { formatCurrency, formatMonthYear } from '../../utils/formatters';
import { PieChart, ArrowDownCircle, ArrowUpCircle, Wallet, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';

export function Reports() {
  const { transactions, categories, loading, refreshData, db, selectedMonth, setSelectedMonth, theme } = useData();
  const [spendingByCategory, setSpendingByCategory] = useState<CategorySpending[]>([]);
  const [monthlyBalance, setMonthlyBalance] = useState({ income: 0, expense: 0, balance: 0 });

  const reportService = useMemo(() => {
    return new ReportService(
      new TransactionRepository(db),
      new FixedExpenseRepository(db)
    );
  }, [db]);

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setSelectedMonth(date.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setSelectedMonth(date.toISOString().substring(0, 7));
  };

  useEffect(() => {
    const loadReports = async () => {
      const spending = await reportService.getSpendingByCategory(selectedMonth, categories);
      const balance = await reportService.getMonthlyBalance(selectedMonth);
      setSpendingByCategory(spending);
      setMonthlyBalance(balance);
    };

    loadReports();
  }, [transactions, categories, reportService, selectedMonth]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Relatórios</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>Análise de {formatMonthYear(selectedMonth)}</Text>
      </View>

      <View style={[styles.monthSelector, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
          <ChevronLeft size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Calendar size={20} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.monthText, { color: theme.text }]}>{formatMonthYear(selectedMonth)}</Text>
        </View>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
          <ChevronRight size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
        <View style={styles.balanceItem}>
          <View style={[styles.iconBox, { backgroundColor: theme.iconBackground.green }]}>
            <ArrowUpCircle size={20} color={theme.success} />
          </View>
          <Text style={[styles.balanceLabel, { color: theme.subtext }]}>Entradas</Text>
          <Text style={[styles.balanceValue, { color: theme.success }]}>{formatCurrency(monthlyBalance.income)}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.background }]} />

        <View style={styles.balanceItem}>
          <View style={[styles.iconBox, { backgroundColor: theme.iconBackground.red }]}>
            <ArrowDownCircle size={20} color={theme.danger} />
          </View>
          <Text style={[styles.balanceLabel, { color: theme.subtext }]}>Saídas</Text>
          <Text style={[styles.balanceValue, { color: theme.danger }]}>{formatCurrency(monthlyBalance.expense)}</Text>
        </View>
      </View>

      <View style={[styles.totalBalanceBox, { backgroundColor: theme.card }]}>
        <Text style={[styles.totalBalanceLabel, { color: theme.subtext }]}>Saldo Líquido</Text>
        <Text style={[styles.totalBalanceValue, { color: monthlyBalance.balance >= 0 ? theme.text : theme.danger }]}>
          {formatCurrency(monthlyBalance.balance)}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Gastos por Categoria</Text>
      
      {spendingByCategory.length > 0 ? (
        <View style={styles.categoryList}>
          {spendingByCategory.map((item) => (
            <View key={item.categoryId} style={[styles.categoryCard, { backgroundColor: theme.card }]}>
              <View style={styles.categoryInfo}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={[styles.categoryName, { color: theme.text }]}>{item.categoryName}</Text>
              </View>
              <Text style={[styles.categoryAmount, { color: theme.text }]}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>Sem gastos registrados este mês.</Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginTop: 8, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  monthArrow: {
    padding: 4,
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceCard: { borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  balanceItem: { flex: 1, alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 12, marginBottom: 4 },
  balanceValue: { fontSize: 16, fontWeight: 'bold' },
  divider: { width: 1, height: '100%' },
  totalBalanceBox: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  totalBalanceLabel: { fontSize: 14, marginBottom: 4 },
  totalBalanceValue: { fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  categoryList: { gap: 12 },
  categoryCard: { borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  categoryName: { fontSize: 16, fontWeight: '500' },
  categoryAmount: { fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14 },
});
