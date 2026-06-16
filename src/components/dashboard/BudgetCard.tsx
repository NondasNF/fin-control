import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '../common/ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import { useData } from '../../context/DataContext';

interface BudgetCardProps {
  title: string;
  limit: number;
  actual: number;
  percentage: number;
  remaining: number;
  color: string;
}

export function BudgetCard({ title, limit, actual, percentage, remaining, color }: BudgetCardProps) {
  const { theme } = useData();
  const isOverBudget = remaining < 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {!(title === "Guardar") ?
          <Text style={[styles.remaining, isOverBudget ? { color: theme.danger } : { color: theme.success }]}>
            {isOverBudget ? 'Excedido: ' : 'Restante: '}
            {formatCurrency(Math.abs(remaining))}
          </Text>
          :
          <Text style={[styles.remaining, isOverBudget ? { color: theme.danger } : { color: theme.success }]}>
            {isOverBudget ? 'Excedido: ' : 'Faltante: '}
            {formatCurrency(Math.abs(remaining))}
          </Text>
        }
      </View>

      <ProgressBar progress={percentage} color={color} />

      <View style={styles.footer}>
        <Text style={[styles.label, { color: theme.subtext }]}>Gasto: {formatCurrency(actual)}</Text>
        <Text style={[styles.label, { color: theme.subtext }]}>Limite: {formatCurrency(limit)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  remaining: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
  },
});
