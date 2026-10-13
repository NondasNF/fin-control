import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useData } from '../../context/DataContext';
import { BudgetCard } from '../../components/dashboard/BudgetCard';
import { formatCurrency, getCurrentMonthName } from '../../utils/formatters';
import { Wallet, TrendingUp, Landmark, Calculator, Calendar } from 'lucide-react-native';

export function Dashboard() {
  const { dashboardSummary, budgetAlert, loading, refreshData, settings, theme } = useData();

  const dailyLimitData = useMemo(() => {
    if (!dashboardSummary) return null;
    
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = lastDayOfMonth - today.getDate() + 1;
    
    const consumptionSpending = dashboardSummary.needs.actual + dashboardSummary.wants.actual + dashboardSummary.savings.actual;
    const remainingForConsumption = dashboardSummary.monthlySalary - consumptionSpending;
    
    const dailyLimit = remainingForConsumption > 0 ? remainingForConsumption / daysRemaining : 0;
    
    return {
      dailyLimit,
      daysRemaining
    };
  }, [dashboardSummary]);

  if (!dashboardSummary) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} tintColor={theme.primary} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.month, { color: theme.text }]}>{getCurrentMonthName()}</Text>
          <Text style={[styles.welcome, { color: theme.subtext }]}>Seu resumo financeiro</Text>
        </View>
        <TouchableOpacity style={[styles.salaryContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.salaryLabel, { color: theme.subtext }]}>Salário Mensal</Text>
          <Text style={[styles.salaryValue, { color: theme.success }]}>{formatCurrency(settings?.monthly_salary || 0)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryItem, { backgroundColor: theme.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.iconBackground.blue }]}>
            <Wallet size={20} color={theme.primary} />
          </View>
          <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Total Gasto</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{formatCurrency(dashboardSummary.totalExpense)}</Text>
        </View>

        <View style={[styles.summaryItem, { backgroundColor: theme.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.iconBackground.green }]}>
            <Calculator size={20} color={theme.success} />
          </View>
          <Text style={[styles.summaryLabel, { color: theme.subtext }]}>Limite p/ Dia</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{formatCurrency(dailyLimitData?.dailyLimit || 0)}</Text>
          <Text style={[styles.daysRemaining, { color: theme.subtext }]}>Restam {dailyLimitData?.daysRemaining} dias</Text>
        </View>
      </View>

      {budgetAlert && (
        <View style={[
          styles.alertBox,
          {
            backgroundColor: budgetAlert.severity === 'critical' ? theme.iconBackground.red :
              budgetAlert.severity === 'warning' ? theme.iconBackground.orange : theme.iconBackground.green,
          }
        ]}>
          <Text style={[styles.alertTitle, { color: budgetAlert.severity === 'critical' ? theme.danger : budgetAlert.severity === 'warning' ? theme.warning : theme.success }]}>
            {budgetAlert.title}
          </Text>
          <Text style={[styles.alertMessage, { color: theme.text }]}>{budgetAlert.message}</Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Regra 50/30/20</Text>

      <BudgetCard 
        title="Gastos Fixos"
        limit={dashboardSummary.needs.limit}
        actual={dashboardSummary.needs.actual}
        percentage={dashboardSummary.needs.percentage}
        remaining={dashboardSummary.needs.remaining}
        color={dashboardSummary.needs.percentage > 95 ? theme.danger: theme.primary}
      />

      <BudgetCard 
        title="Gastos Mensais"
        limit={dashboardSummary.wants.limit}
        actual={dashboardSummary.wants.actual}
        percentage={dashboardSummary.wants.percentage}
        remaining={dashboardSummary.wants.remaining}
        color={dashboardSummary.wants.percentage > 95 ? theme.danger: theme.warning}
      />

      <BudgetCard 
        title="Guardar"
        limit={dashboardSummary.savings.limit}
        actual={dashboardSummary.savings.actual}
        percentage={dashboardSummary.savings.percentage}
        remaining={dashboardSummary.savings.remaining}
        color={theme.success}
      />

      <View style={[styles.infoBox, { backgroundColor: theme.iconBackground.gray }]}>
        <Landmark size={20} color={theme.subtext} />
        <Text style={[styles.infoText, { color: theme.text }]}>
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
  },
  welcome: {
    fontSize: 14,
  },
  salaryContainer: {
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
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  alertBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  summaryItem: {
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
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  daysRemaining: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});
