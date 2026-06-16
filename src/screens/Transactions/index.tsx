import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { Plus, X, Tag, DollarSign, Calendar, ArrowUpCircle, ArrowDownCircle, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Transaction } from '../../types/database';

export function Transactions() {
  const { transactions, categories, loading, refreshData, addTransaction, deleteTransaction, selectedMonth, setSelectedMonth, theme } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions;
    return transactions.filter(t => t.type === filterType);
  }, [transactions, filterType]);

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

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handleOpenModal = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategoryId(categories.length > 0 ? categories[0].id : null);
    
    // Define a data padrão como o primeiro dia do mês selecionado
    // Se for o mês atual, usa a data de hoje
    const today = new Date().toISOString().substring(0, 7);
    if (selectedMonth === today) {
      setDate(new Date().toISOString().split('T')[0]);
    } else {
      setDate(`${selectedMonth}-01`);
    }
    
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!description || !amount || !categoryId) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await addTransaction({
        description,
        amount: parseFloat(amount.replace(',', '.')),
        type,
        category_id: categoryId,
        date,
        is_fixed: 0,
      });
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteTransaction(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const category = categories.find(c => c.id === item.category_id);
    const isExpense = item.type === 'expense';

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, { backgroundColor: category?.color || theme.subtext }]}>
            {isExpense ? <ArrowDownCircle size={20} color="#fff" /> : <ArrowUpCircle size={20} color="#fff" />}
          </View>
          <View style={styles.info}>
            <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
            <Text style={[styles.category, { color: theme.subtext }]}>{category?.name} • {item.date}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.amount, { color: isExpense ? theme.danger : theme.success }]}>
            {isExpense ? '-' : '+'} {formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)} 
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Transações</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleOpenModal}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.monthSelector, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
          <ChevronLeft size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Calendar size={20} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.monthText, { color: theme.text }]}>{formatMonth(selectedMonth)}</Text>
        </View>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
          <ChevronRight size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: theme.iconBackground.gray }]}>
        <TouchableOpacity 
          style={[styles.filterTab, filterType === 'all' && [styles.filterTabActive, { backgroundColor: theme.card }]]} 
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && [styles.filterTextActive, { color: theme.text }]]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filterType === 'income' && [styles.filterTabActive, { backgroundColor: theme.card }]]} 
          onPress={() => setFilterType('income')}
        >
          <Text style={[styles.filterText, filterType === 'income' && [styles.filterTextActive, { color: theme.text }]]}>Entradas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filterType === 'expense' && [styles.filterTabActive, { backgroundColor: theme.card }]]} 
          onPress={() => setFilterType('expense')}
        >
          <Text style={[styles.filterText, filterType === 'expense' && [styles.filterTextActive, { color: theme.text }]]}>Saídas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhuma transação encontrada.</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={refreshData}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Nova Transação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, { borderColor: theme.border }, type === 'expense' && [styles.typeBtnExpense, { backgroundColor: theme.danger, borderColor: theme.danger }]]} 
                  onPress={() => setType('expense')}
                >
                  <ArrowDownCircle size={20} color={type === 'expense' ? '#fff' : theme.danger} />
                  <Text style={[styles.typeBtnText, { color: theme.text }, type === 'expense' && { color: '#fff' }]}>Despesa</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, { borderColor: theme.border }, type === 'income' && [styles.typeBtnIncome, { backgroundColor: theme.success, borderColor: theme.success }]]} 
                  onPress={() => setType('income')}
                >
                  <ArrowUpCircle size={20} color={type === 'income' ? '#fff' : theme.success} />
                  <Text style={[styles.typeBtnText, { color: theme.text }, type === 'income' && { color: '#fff' }]}>Receita</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Descrição</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
                  <Tag size={20} color={theme.subtext} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="Ex: Almoço, Salário..."
                    placeholderTextColor={theme.subtext}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Valor</Text>
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
                <Text style={[styles.label, { color: theme.text }]}>Data</Text>
                <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
                  <Calendar size={20} color={theme.subtext} />
                  <TextInput 
                    style={[styles.input, { color: theme.text }]} 
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.subtext}
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                  {categories.filter(c => c.type === type).map(cat => (
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

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Adicionar Transação</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  addButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  filterContainer: { flexDirection: 'row', borderRadius: 8, padding: 2, marginBottom: 16 },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  filterTabActive: { },
  filterText: { fontSize: 13, fontWeight: '500' },
  filterTextActive: { },
  listContent: { paddingBottom: 24 },
  card: { borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  description: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  deleteBtn: { padding: 4 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn: { flex: 1, flexDirection: 'row', height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, gap: 8 },
  typeBtnExpense: { },
  typeBtnIncome: { },
  typeBtnText: { fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  categoryList: { marginTop: 4 },
  categoryOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryOptionText: { fontSize: 13, fontWeight: '500' },
  saveBtn: { borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
