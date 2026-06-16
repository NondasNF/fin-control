import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { backupDatabase, restoreDatabase } from '../../services/backupService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Settings as SettingsIcon, Download, Upload, DollarSign, Info, Trash2 } from 'lucide-react-native';

export function Settings() {
  const { settings, updateMonthlySalary, db, refreshData, resetAllData, theme } = useData();
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
        console.log('[Settings] Arquivo selecionado:', result.assets[0].name);
        
        // Usando a API estável via import de legacy
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        
        await restoreDatabase(db, fileContent);
        await refreshData();
        Alert.alert('Sucesso', 'Dados restaurados com sucesso!');
      }
    } catch (error: any) {
      console.error('[Settings] Erro ao restaurar:', error);
      Alert.alert('Falha na Restauração', error.message || 'Verifique o formato do arquivo JSON.');
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Perfil Financeiro</Text>
      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={() => setIsModalVisible(true)}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: theme.iconBackground.green }]}>
            <DollarSign size={22} color={theme.success} />
          </View>
          <View>
            <Text style={[styles.cardLabel, { color: theme.text }]}>Salário Mensal</Text>
            <Text style={[styles.cardValue, { color: theme.success }]}>{formatCurrency(settings?.monthly_salary || 0)}</Text>
          </View>
        </View>
        <Text style={[styles.editText, { color: theme.primary }]}>Editar</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Dados e Segurança</Text>
      
      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={handleBackup}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: theme.iconBackground.blue }]}>
            <Download size={22} color={theme.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.text }]}>Exportar Backup JSON</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={handleRestore}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: theme.iconBackground.orange }]}>
            <Upload size={22} color={theme.warning} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.text }]}>Importar Backup JSON</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={handleResetData}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconBox, { backgroundColor: theme.iconBackground.red }]}>
            <Trash2 size={22} color={theme.danger} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.danger }]}>Limpar Todos os Dados</Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.infoBox, { backgroundColor: theme.iconBackground.gray }]}>
        <Info size={20} color={theme.subtext} />
        <Text style={[styles.infoText, { color: theme.text }]}>
          Seus dados são armazenados apenas localmente neste dispositivo. Recomendamos exportar o backup regularmente.
        </Text>
      </View>

      {/* Modal Editar Salário */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Atualizar Salário</Text>
            <Text style={[styles.modalLabel, { color: theme.subtext }]}>Insira o valor base mensal para os cálculos do 50/30/20:</Text>
            
            <View style={[styles.inputWrapper, { backgroundColor: theme.background }]}>
              <Text style={[styles.currencyPrefix, { color: theme.text }]}>R$</Text>
              <TextInput 
                style={[styles.input, { color: theme.text }]}
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                autoFocus
                placeholderTextColor={theme.subtext}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.background }]} onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.subtext }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.success }]} onPress={handleUpdateSalary}>
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
  container: { flex: 1, padding: 16 },
  header: { marginTop: 8, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, fontWeight: '600' },
  card: { borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500' },
  cardValue: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  editText: { fontWeight: '600' },
  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  infoText: { fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalLabel: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 60, marginBottom: 24 },
  currencyPrefix: { fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  input: { flex: 1, fontSize: 22, fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
