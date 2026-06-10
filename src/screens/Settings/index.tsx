import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { backupDatabase, restoreDatabase } from '../../services/backupService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Settings as SettingsIcon, Download, Upload, DollarSign, Info, Trash2 } from 'lucide-react-native';

export function Settings() {
  const { settings, updateMonthlySalary, db, refreshData, resetAllData } = useData();
  const [salary, setSalary] = useState(settings?.monthly_salary.toString() || '0');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleUpdateSalary = async () => {
    const numSalary = parseFloat(salary.replace(',', '.'));
    if (isNaN(numSalary)) {
      Alert.alert('Erro', 'Por favor, insira um valor válido.');
      return;
    }
    await updateMonthlySalary(numSalary);
    setIsModalVisible(false);
    Alert.alert('Sucesso', 'Salário atualizado com sucesso!');
  };

  const handleBackup = async () => {
    try {
      await backupDatabase(db);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o backup.');
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      
      if (!result.canceled) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        await restoreDatabase(db, fileContent);
        await refreshData();
        Alert.alert('Sucesso', 'Dados restaurados com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao restaurar o backup. Verifique o arquivo.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Atenção!',
      'Isso apagará todas as suas transações e gastos fixos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar Tudo', 
          style: 'destructive', 
          onPress: async () => {
            await resetAllData();
            Alert.alert('Limpeza concluída.');
          } 
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <Text style={styles.sectionTitle}>Perfil Financeiro</Text>
      <TouchableOpacity style={styles.card} onPress={() => setIsModalVisible(true)}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: '#E8F9EE' }]}>
            <DollarSign size={22} color="#34C759" />
          </View>
          <View>
            <Text style={styles.cardLabel}>Salário Mensal</Text>
            <Text style={styles.cardValue}>{formatCurrency(settings?.monthly_salary || 0)}</Text>
          </View>
        </View>
        <Text style={styles.editText}>Editar</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Dados e Segurança</Text>
      
      <TouchableOpacity style={styles.card} onPress={handleBackup}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: '#E5F1FF' }]}>
            <Download size={22} color="#007AFF" />
          </View>
          <Text style={styles.cardLabel}>Exportar Backup JSON</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleRestore}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF9E5' }]}>
            <Upload size={22} color="#FF9500" />
          </View>
          <Text style={styles.cardLabel}>Importar Backup JSON</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleResetData}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF2F0' }]}>
            <Trash2 size={22} color="#FF3B30" />
          </View>
          <Text style={[styles.cardLabel, { color: '#FF3B30' }]}>Limpar Todos os Dados</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Info size={20} color="#8E8E93" />
        <Text style={styles.infoText}>
          Seus dados são armazenados apenas localmente neste dispositivo. Recomendamos exportar o backup regularmente.
        </Text>
      </View>

      {/* Modal Editar Salário */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atualizar Salário</Text>
            <Text style={styles.modalLabel}>Insira o valor base mensal para os cálculos do 50/30/20:</Text>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateSalary}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 16 },
  header: { marginTop: 8, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E' },
  sectionTitle: { fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardLabel: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  cardValue: { fontSize: 18, fontWeight: 'bold', color: '#34C759', marginTop: 2 },
  editText: { color: '#007AFF', fontWeight: '600' },
  infoBox: { flexDirection: 'row', backgroundColor: '#E5E5EA', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  infoText: { fontSize: 12, color: '#3A3A3C', marginLeft: 12, flex: 1, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 20, lineHeight: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 16, height: 60, marginBottom: 24 },
  currencyPrefix: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginRight: 8 },
  input: { flex: 1, fontSize: 22, fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#F2F2F7' },
  cancelBtnText: { color: '#8E8E93', fontWeight: '600' },
  saveBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#34C759' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
