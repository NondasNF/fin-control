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
    deleteFixedExpense 
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gastos Fixos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Estes gastos são gerados automaticamente no início de cada mês.
      </Text>

      <ScrollView style={styles.list}>
        {fixedExpenses.map((expense) => {
          const category = categories.find(c => c.id === expense.category_id);
          return (
            <TouchableOpacity 
              key={expense.id} 
              style={[styles.card, expense.active === 0 && styles.inactiveCard]}
              onPress={() => handleOpenModal(expense)}
            >
              <View style={styles.cardInfo}>
                <View style={[styles.categoryBadge, { backgroundColor: category?.color || '#8E8E93' }]}>
                  <Text style={styles.categoryText}>{category?.name.substring(0, 1)}</Text>
                </View>
                <View>
                  <Text style={styles.description}>{expense.description}</Text>
                  <Text style={styles.details}>Vence dia {expense.day_due} • {category?.name}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
                <TouchableOpacity onPress={() => handleDelete(expense.id)}>
                  <Trash2 size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <View style={styles.inputWrapper}>
                  <Tag size={20} color="#8E8E93" />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Ex: Aluguel, Netflix..."
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor Padrão (R$)</Text>
                <View style={styles.inputWrapper}>
                  <DollarSign size={20} color="#8E8E93" />
                  <TextInput 
                    style={styles.input} 
                    placeholder="0,00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dia do Vencimento</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={20} color="#8E8E93" />
                  <TextInput 
                    style={styles.input} 
                    placeholder="1 a 28"
                    keyboardType="numeric"
                    maxLength={2}
                    value={dayDue}
                    onChangeText={setDayDue}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <TouchableOpacity 
                      key={cat.id} 
                      style={[
                        styles.categoryOption, 
                        categoryId === cat.id && { backgroundColor: cat.color }
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        categoryId === cat.id && { color: '#fff' }
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Ativo (Gerar este mês?)</Text>
                <Switch 
                  value={active} 
                  onValueChange={setActive}
                  trackColor={{ false: '#767577', true: '#34C759' }}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    backgroundColor: '#F2F2F7',
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
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#fff',
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
    color: '#1C1C1E',
  },
  details: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#3A3A3C',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
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
    backgroundColor: '#E5E5EA',
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3A3A3C',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
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
