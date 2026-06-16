import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Switch, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { Plus, X, Calendar, Tag, DollarSign, Trash2 } from 'lucide-react-native';
import { FixedExpense } from '../../types/database';

export function FixedExpenses() {
  const { 
    fixedExpenses, 
    categories, 
    loading, 
    refreshData, 
    addFixedExpense, 
    updateFixedExpense, 
    deleteFixedExpense,
    theme
  } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dayDue, setDayDue] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleOpenModal = (expense?: FixedExpense) => {
    if (expense) {
      setEditingId(expense.id);
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setDayDue(expense.day_due.toString());
      setCategoryId(expense.category_id);
      setActive(expense.active === 1);
    } else {
      setEditingId(null);
      setDescription('');
      setAmount('');
      setDayDue('');
      setCategoryId(categories.length > 0 ? categories[0].id : null);
      setActive(true);
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!description || !amount || !dayDue || !categoryId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const numAmount = parseFloat(amount.replace(',', '.'));
      const numDay = parseInt(dayDue);

      if (editingId) {
        await updateFixedExpense(editingId, {
          description,
          amount: numAmount,
          day_due: numDay,
          category_id: categoryId,
          active: active ? 1 : 0
        });
      } else {
        await addFixedExpense({
          description,
          amount: numAmount,
          day_due: numDay,
          category_id: categoryId,
          active: active ? 1 : 0
        });
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving fixed expense:', error);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Excluir Gasto Fixo',
      'Deseja apagar este modelo de gasto? As transações já geradas este mês serão mantidas, a menos que você as apague manualmente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteFixedExpense(id);
            } catch (error) {
              console.error('Error deleting fixed expense:', error);
            }
          } 
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Gastos Fixos</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => handleOpenModal()}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: theme.subtext }]}>
        Estes gastos são gerados automaticamente no início de cada mês.
      </Text>

      <ScrollView style={styles.list}>
        {fixedExpenses.map((expense) => {
          const category = categories.find(c => c.id === expense.category_id);
          return (
            <TouchableOpacity 
              key={expense.id} 
              style={[
                styles.card, 
                { backgroundColor: theme.card },
                expense.active === 0 && styles.inactiveCard
              ]}
              onPress={() => handleOpenModal(expense)}
            >
              <View style={styles.cardInfo}>
                <View style={[styles.categoryBadge, { backgroundColor: category?.color || theme.subtext }]}>
                  <Text style={styles.categoryText}>{category?.name.substring(0, 1)}</Text>
                </View>
                <View>
                  <Text style={[styles.description, { color: theme.text }]}>{expense.description}</Text>
                  <Text style={[styles.details, { color: theme.subtext }]}>Vence dia {expense.day_due} • {category?.name}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.amount, { color: theme.danger }]}>{formatCurrency(expense.amount)}</Text>
                <TouchableOpacity onPress={() => handleDelete(expense.id)}>
                  <Trash2 size={18} color={theme.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingId ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Descrição</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
                  <Tag size={20} color={theme.subtext} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Ex: Aluguel, Netflix..."
                    placeholderTextColor={theme.subtext}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Valor Padrão (R$)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
                  <DollarSign size={20} color={theme.subtext} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="0,00"
                    placeholderTextColor={theme.subtext}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Dia do Vencimento</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
                  <Calendar size={20} color={theme.subtext} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="1 a 28"
                    placeholderTextColor={theme.subtext}
                    keyboardType="numeric"
                    maxLength={2}
                    value={dayDue}
                    onChangeText={setDayDue}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <TouchableOpacity 
                      key={cat.id} 
                      style={[
                        styles.categoryOption, 
                        { backgroundColor: theme.iconBackground.gray },
                        categoryId === cat.id && { backgroundColor: cat.color }
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        { color: theme.text },
                        categoryId === cat.id && { color: '#fff' }
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: theme.text }]}>Ativo (Gerar este mês?)</Text>
                <Switch 
                  value={active} 
                  onValueChange={setActive}
                  trackColor={{ false: theme.border, true: theme.success }}
                  thumbColor={theme.card}
                />
              </View>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Recorrência</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inactiveCard: {
    opacity: 0.5,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    fontSize: 12,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoryList: {
    marginTop: 4,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  saveButton: {
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
