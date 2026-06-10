import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { BudgetCard } from '../../components/dashboard/BudgetCard';
import { formatCurrency, getCurrentMonthName } from '../../utils/formatters';
import { Wallet, TrendingUp, Landmark } from 'lucide-react-native';

export function Dashboard() {
  const { budgetSummary, loading, refreshData, settings } = useData();

  if (!budgetSummary) {
    return (
      <View style={styles.center}>
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.month}>{getCurrentMonthName()}</Text>
          <Text style={styles.welcome}>Seu resumo financeiro</Text>
        </View>
        <TouchableOpacity style={styles.salaryContainer}>
          <Text style={styles.salaryLabel}>Salário Mensal</Text>
          <Text style={styles.salaryValue}>{formatCurrency(settings?.monthly_salary || 0)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#E5F1FF' }]}>
            <Wallet size={20} color="#007AFF" />
          </View>
          <Text style={styles.summaryLabel}>Total Gasto</Text>
          <Text style={styles.summaryValue}>{formatCurrency(budgetSummary.totalExpense)}</Text>
        </View>

        <View style={styles.summaryItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#E8F9EE' }]}>
            <TrendingUp size={20} color="#34C759" />
          </View>
          <Text style={styles.summaryLabel}>Economia</Text>
          <Text style={styles.summaryValue}>{formatCurrency(budgetSummary.savings.actual)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Regra 50/30/20</Text>

      <BudgetCard 
        title="Necessidades (50%)"
        limit={budgetSummary.needs.limit}
        actual={budgetSummary.needs.actual}
        percentage={budgetSummary.needs.percentage}
        remaining={budgetSummary.needs.remaining}
        color="#007AFF"
      />

      <BudgetCard 
        title="Lazer / Desejos (30%)"
        limit={budgetSummary.wants.limit}
        actual={budgetSummary.wants.actual}
        percentage={budgetSummary.wants.percentage}
        remaining={budgetSummary.wants.remaining}
        color="#FF9500"
      />

      <BudgetCard 
        title="Investimentos (20%)"
        limit={budgetSummary.savings.limit}
        actual={budgetSummary.savings.actual}
        percentage={budgetSummary.savings.percentage}
        remaining={budgetSummary.savings.remaining}
        color="#34C759"
      />

      <View style={styles.infoBox}>
        <Landmark size={20} color="#8E8E93" />
        <Text style={styles.infoText}>
          A regra 50/30/20 ajuda você a equilibrar suas necessidades, desejos e futuro financeiro.
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 8,
  },
  month: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  welcome: {
    fontSize: 14,
    color: '#8E8E93',
  },
  salaryContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  salaryLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#3A3A3C',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});
