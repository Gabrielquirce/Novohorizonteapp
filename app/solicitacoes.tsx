// apps/alteracoes.tsx
import Icon from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SolicitacoesScreen = () => {
  const [solicitacao, setSolicitacao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!solicitacao.trim()) {
      Alert.alert('Campo obrigatório', 'Descreva a alteração solicitada');
      return;
    }

    Alert.alert(
      'Confirmar Envio',
      'Deseja enviar esta solicitação de alteração?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => sendRequest() }
      ]
    );
  };

  const sendRequest = async () => {
    setLoading(true);
    try {
      // Envio por email diretamente
      await Linking.openURL(
        `mailto:escola@example.com?` +
        `subject=Solicitação de Alteração de Dados&` +
        `body=${encodeURIComponent(solicitacao + '\n\nEnviado via App Escola')}`
      );
      
      Alert.alert('✅ Sucesso', 'Solicitação enviada com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Solicitar Alterações</Text>

      <View style={styles.card}>
        <Icon name="info-circle" size={20} color="#2c3e50" />
        <Text style={styles.cardText}>
          Utilize este formulário para:
          {"\n"}• Corrigir dados cadastrais
          {"\n"}• Atualizar informações médicas
          {"\n"}• Alterar contatos de emergência
          {"\n"}• Solicitar exclusão de dados
        </Text>
      </View>

      <Text style={styles.label}>Descreva a alteração necessária:*</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={5}
        placeholder="Ex: Atualizar número de telefone para (21) 98765-4321"
        value={solicitacao}
        onChangeText={setSolicitacao}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Enviar Solicitação</Text>
        )}
      </TouchableOpacity>

      <View style={styles.lgpdSection}>
        <Text style={styles.sectionTitle}>Proteção de Dados (LGPD)</Text>
        
        <Text style={styles.lgpdText}>
          <Icon name="shield" size={16} color="#27ae60" /> {' '}
          Todas as informações coletadas são utilizadas exclusivamente para:
        </Text>
        
        <View style={styles.bulletList}>
          <Text>• Gestão acadêmica do aluno</Text>
          <Text>• Comunicação institucional</Text>
          <Text>• Emergências médicas</Text>
          <Text>• Cumprimento de obrigações legais</Text>
        </View>

        <Text style={styles.lgpdText}>
          Você tem direito a:
          {"\n"}↳ Acesso aos seus dados
          {"\n"}↳ Retificação de informações
          {"\n"}↳ Exclusão dos dados (quando permitido por lei)
          {"\n"}↳ Revogação de consentimento
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd')}
          style={styles.link}
        >
          <Text style={styles.linkText}>
            Leia mais sobre a Lei Geral de Proteção de Dados
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#902121',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#e8f4fc',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardText: {
    flex: 1,
    color: '#2c3e50',
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#34495e',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#902121',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  lgpdSection: {
    borderTopWidth: 1,
    borderTopColor: '#dcdde1',
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  lgpdText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 15,
  },
  bulletList: {
    marginLeft: 15,
    marginVertical: 10,
  },
  link: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
  },
  linkText: {
    color: '#2980b9',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backText: {
    color: '#902121',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    opacity: 1,
  },
});

export default SolicitacoesScreen;