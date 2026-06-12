import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useData } from '../../context/DataContext';
import { ReportService, CategorySpending } from '../../services/ReportService';
import { TransactionRepository } from '../../database/repositories/TransactionRepository';
import { formatCurrency, getCurrentMonthName } from '../../utils/formatters';
import { PieChart, ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react-native';

export function Reports() {
  const { transactions, categories, loading, refreshData, db } = useData();
  const [spendingByCategory, setSpendingByCategory] = useState<CategorySpending[]>([]);
  const [monthlyBalance, setMonthlyBalance] = useState({ income: 0, expense: 0, balance: 0 });

  const reportService = useMemo(() => {
    return new ReportService(new TransactionRepository(db));
  }, [db]);

  const currentYearMonth = useMemo(() => new Date().toISOString().substring(0, 7), []);

  useEffect(() => {
    const loadReports = async () => {
      const spending = await reportService.getSpendingByCategory(currentYearMonth, categories);
      const balance = await reportService.getMonthlyBalance(currentYearMonth);
      setSpendingByCategory(spending);
      setMonthlyBalance(balance);
    };

    loadReports();
  }, [transactions, categories, reportService, currentYearMonth]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshData} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>Análise de {getCurrentMonthName()}</Text>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F9EE' }]}>
            <ArrowUpCircle size={20} color="#34C759" />
          </View>
          <Text style={styles.balanceLabel}>Entradas</Text>
          <Text style={[styles.balanceValue, { color: '#34C759' }]}>{formatCurrency(monthlyBalance.income)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.balanceItem}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF2F0' }]}>
            <ArrowDownCircle size={20} color="#FF3B30" />
          </View>
          <Text style={styles.balanceLabel}>Saídas</Text>
          <Text style={[styles.balanceValue, { color: '#FF3B30' }]}>{formatCurrency(monthlyBalance.expense)}</Text>
        </View>
      </View>

      <View style={styles.totalBalanceBox}>
        <Text style={styles.totalBalanceLabel}>Saldo Líquido</Text>
        <Text style={[styles.totalBalanceValue, { color: monthlyBalance.balance >= 0 ? '#1C1C1E' : '#FF3B30' }]}>
          {formatCurrency(monthlyBalance.balance)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
      
      {spendingByCategory.length > 0 ? (
        <View style={styles.categoryList}>
          {spendingByCategory.map((item) => (
            <View key={item.categoryId} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={styles.categoryName}>{item.categoryName}</Text>
              </View>
              <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Sem gastos registrados este mês.</Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 16 },
  header: { marginTop: 8, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E' },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    color: '#1C1C1E',
  },
  balanceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  balanceItem: { flex: 1, alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
  balanceValue: { fontSize: 16, fontWeight: 'bold' },
  divider: { width: 1, height: '100%', backgroundColor: '#F2F2F7' },
  totalBalanceBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  totalBalanceLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  totalBalanceValue: { fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 16 },
  categoryList: { gap: 12 },
  categoryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  categoryName: { fontSize: 16, fontWeight: '500', color: '#1C1C1E' },
  categoryAmount: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#8E8E93', fontSize: 14 },
});
tifyContent: 'space-between', alignItems: 'center' },
  categoryInfo: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  categoryName: { fontSize: 16, fontWeight: '500', color: '#1C1C1E' },
  categoryAmount: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#8E8E93', fontSize: 14 },
});
