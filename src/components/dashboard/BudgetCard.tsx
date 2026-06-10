import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '../common/ProgressBar';
import { formatCurrency } from '../../utils/formatters';

interface BudgetCardProps {
  title: string;
  limit: number;
  actual: number;
  percentage: number;
  remaining: number;
  color: string;
}

export function BudgetCard({ title, limit, actual, percentage, remaining, color }: BudgetCardProps) {
  const isOverBudget = remaining < 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.remaining, isOverBudget && styles.overBudget]}>
          {isOverBudget ? 'Excedido: ' : 'Restante: '}
          {formatCurrency(Math.abs(remaining))}
        </Text>
      </View>

      <ProgressBar progress={percentage} color={color} />

      <View style={styles.footer}>
        <Text style={styles.label}>Gasto: {formatCurrency(actual)}</Text>
        <Text style={styles.label}>Limite: {formatCurrency(limit)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    color: '#1C1C1E',
  },
  remaining: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  overBudget: {
    color: '#FF3B30',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
