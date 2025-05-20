
import { FontAwesome } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import api from './api/axiosInstance';
import StandardPicker from './components/StandardPicker';
import useFormStore from './Store/useFormStore';

const cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
const rgMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/];
const telefoneMask = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

const FormularioCompleto = () => {
  const { aluno, mae, pai, clearStore } = useFormStore();
  const [matriculaTipo, setMatriculaTipo] = useState('');
  const [escola, setEscola] = useState('');
  const [temIrmaos, setTemIrmaos] = useState('');
  const [irmaosNome, setIrmaosNome] = useState('');
  const [temEspecialista, setTemEspecialista] = useState('');
  const [especialista, setEspecialista] = useState('');
  const [temAlergias, setTemAlergias] = useState('');
  const [alergia, setAlergia] = useState('');
  const [temMedicamento, setTemMedicamento] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [formData, setFormData] = useState({
    reside: '',
    respNome: '',
    respCpf: '',
    respTelefone: '',
    pessoasAutorizadas: ''
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEmail = () => {
    Alert.alert(
      '📧 Confirmação de Envio',
      'Tem certeza que deseja abrir o cliente de e-mail para enviar os documentos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => {
          Linking.openURL(
            `mailto:vanessalimapsicopedagoga@bol.com.br?` +
            `subject=Envio de Documentos - ${aluno.nome}&` +
            `body=Segue em anexo os documentos necessários para matrícula de (Nome Completo do Aluno) ${aluno.nome}`
          );
        }}
      ]
    );
  };

  // Crie uma nova função:
    const handleDownloadTerms = () => {
      Alert.alert(
        'Baixar Termos',
        'Deseja baixar o arquivo com os termos escolares?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Baixar',
            onPress: () => Linking.openURL('https://termos.tiiny.site') // Seu link aqui
          },
        ]
      );
    };

  const validateStep1 = () => {
    const errors = [];
    if (!matriculaTipo) errors.push('Selecione o tipo de matrícula');
    if ((matriculaTipo === 'transferencia_municipal_estadual' || matriculaTipo === 'transferencia_particular') && !escola.trim()) {
      errors.push('Informe o nome da escola anterior');
    }
    if (temIrmaos === 'sim' && !irmaosNome.trim()) errors.push('Informe os nomes dos irmãos');
    if (temEspecialista === 'sim' && !especialista.trim()) errors.push('Informe o tipo de acompanhamento');
    if (temAlergias === 'sim' && !alergia.trim()) errors.push('Descreva as alergias');
    if (temMedicamento === 'sim' && !medicamento.trim()) errors.push('Informe os medicamentos');

    if (errors.length > 0) {
      Alert.alert('🚨 Campos Obrigatórios', `• ${errors.join('\n• ')}`);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors = [];
    if (!formData.reside.trim()) errors.push('Campo "Reside com" é obrigatório');
    if (!formData.respNome.trim()) errors.push('Nome do responsável é obrigatório');
    if (formData.respCpf.replace(/\D/g, '').length !== 11) errors.push('CPF do responsável inválido');
    if (formData.respTelefone.replace(/\D/g, '').length !== 11) errors.push('Telefone inválido');

    if (errors.length > 0) {
      Alert.alert('🚨 Dados Incompletos', `• ${errors.join('\n• ')}`);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (step === 2 && !validateStep2()) return;

      const alunoResponse = await api.post('/alunos', {
        nome: aluno.nome,
        dataNascimento: aluno.dataNascimento,
        naturalidade: aluno.naturalidade,
        nacionalidade: aluno.nacionalidade,
        cpf: aluno.cpf,
        rg: aluno.rg,
        sexo: aluno.sexo,
        turno: aluno.turno,
        tipoSanguineo: aluno.tipoSanguineo,
        raca: aluno.raca,
        anoLetivo: aluno.anoLetivo,
        termo: aluno.termo,
        folha: aluno.folha, 
        livro: aluno.livro,
        matricula: aluno.matricula
      });

      const alunoId = alunoResponse.data.id;

      if (mae) {
        await api.post('/maes', {
          nomeMae: mae.nomeMae,
          cepMae: mae.cepMae,
          telefoneMae: mae.telefoneMae,
          trabalhoMae: mae.trabalhoMae,
          nascimentoMae: mae.nascimentoMae,
          cpfMae: mae.cpfMae,
          emailMae: mae.emailMae,
          telefoneTrabalhoMae: mae.telefoneTrabalhoMae,
          enderecoMae: mae.enderecoMae,
          rgMae: mae.rgMae,
          profissaoMae: mae.profissaoMae,
          alunoId
        });
      }

      if (pai) {
        await api.post('/pais', {
          nomePai: pai.nomePai,
          cepPai: pai.cepPai,
          telefonePai: pai.telefonePai,
          trabalhoPai: pai.trabalhoPai,
          nascimentoPai: pai.nascimentoPai,
          cpfPai: pai.cpfPai,
          emailPai: pai.emailPai,
          telefoneTrabalhoPai: pai.telefoneTrabalhoPai,
          enderecoPai: pai.enderecoPai,
          rgPai: pai.rgPai,
          profissaoPai: pai.profissaoPai,
          alunoId
        });
      }

      await api.post('/observacoes', {
        matriculaTipo,
        escola,
        temIrmaos: temIrmaos,
        irmaosNome: temIrmaos === 'sim' ? irmaosNome : null,
        temEspecialista: temEspecialista,
        especialista: temEspecialista === 'sim' ? especialista : null,
        temAlergias: temAlergias,
        alergia: temAlergias === 'sim' ? alergia : null,
        temMedicamento: temMedicamento,
        medicamento: temMedicamento === 'sim' ? medicamento : null,
        reside: formData.reside,
        respNome: formData.respNome,
        respCpf: formData.respCpf,
        respTelefone: formData.respTelefone,
        pessoasAutorizadas: formData.pessoasAutorizadas,
        alunoId
      });

      Alert.alert('✅ Sucesso', 'Cadastro completo realizado!');
      clearStore();
      router.push('/home');

    } catch (error) {
      let errorMessage = 'Erro no cadastro:';
      if (isAxiosError(error)) {
        errorMessage += `\n${error.response?.data?.message || error.message}`;
      }
      Alert.alert('⛔ Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 ? (
        <View style={styles.stepContainer}>
          <Text style={styles.sectionTitle}>Observações</Text>

          <StandardPicker
            label="Tipo de Matrícula"
            items={[
              { label: 'Inicial', value: 'inicial' },
              { label: 'Transferência Municipal/Estadual', value: 'transferencia_municipal_estadual' },
              { label: 'Transferência Particular', value: 'transferencia_particular' }
            ]}
            placeholder="Selecione"
            value={matriculaTipo}
            onValueChange={setMatriculaTipo}
            error={!matriculaTipo ? 'Selecione o tipo de matrícula' : undefined}
          />

          {(matriculaTipo === 'transferencia_municipal_estadual' || matriculaTipo === 'transferencia_particular') && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Escola Anterior</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome da escola"
                value={escola}
                onChangeText={setEscola}
              />
            </View>
          )}

          <StandardPicker
            label="Possui Irmãos?"
            items={[
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' }
            ]}
            placeholder="Selecione"
            value={temIrmaos}
            onValueChange={setTemIrmaos}
            error={!temIrmaos ? 'Selecione uma opção' : undefined}
          />

          {temIrmaos === 'sim' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomes dos Irmãos</Text>
              <TextInput
                style={styles.input}
                placeholder="Separe por vírgulas"
                value={irmaosNome}
                onChangeText={setIrmaosNome}
              />
            </View>
          )}

          <StandardPicker
            label="Acompanhamento Especializado"
            items={[
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' }
            ]}
            placeholder="Selecione"
            value={temEspecialista}
            onValueChange={setTemEspecialista}
            error={!temEspecialista ? 'Selecione uma opção' : undefined}
          />

          {temEspecialista === 'sim' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Acompanhamento</Text>
              <TextInput
                style={styles.input}
                placeholder="Descreva o acompanhamento"
                value={especialista}
                onChangeText={setEspecialista}
              />
            </View>
          )}

          <StandardPicker
            label="Possui Alergias?"
            items={[
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' }
            ]}
            placeholder="Selecione"
            value={temAlergias}
            onValueChange={setTemAlergias}
            error={!temAlergias ? 'Selecione uma opção' : undefined}
          />

          {temAlergias === 'sim' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição das Alergias</Text>
              <TextInput
                style={styles.input}
                placeholder="Descreva as alergias"
                value={alergia}
                onChangeText={setAlergia}
              />
            </View>
          )}

          <StandardPicker
            label="Uso de Medicamentos"
            items={[
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'não' }
            ]}
            placeholder="Selecione"
            value={temMedicamento}
            onValueChange={setTemMedicamento}
            error={!temMedicamento ? 'Selecione uma opção' : undefined}
          />

          {temMedicamento === 'sim' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medicamentos em Uso</Text>
              <TextInput
                style={styles.input}
                placeholder="Liste os medicamentos"
                value={medicamento}
                onChangeText={setMedicamento}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleNextStep}
            disabled={loading}>
            <Text style={styles.buttonText}>Próximo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/forms-paterno')}
            style={styles.backButton}>
            <Text style={styles.backLink}>Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.stepContainer}>
          <Text style={styles.sectionTitle}>Composição Familiar</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reside com</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pai, Mãe, Avós"
              value={formData.reside}
              onChangeText={(v) => handleChange('reside', v)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Responsável Financeiro</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              value={formData.respNome}
              onChangeText={(v) => handleChange('respNome', v)}
            />
            <Text style={styles.label}>CPF do Responsável</Text>
            <MaskInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={formData.respCpf}
              onChangeText={(v) => handleChange('respCpf', v)}
              mask={cpfMask}
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Telefone</Text>
            <MaskInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={formData.respTelefone}
              onChangeText={(v) => handleChange('respTelefone', v)}
              mask={telefoneMask}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pessoas Autorizados para Buscar</Text>
            <MaskInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Nome completo separado por vírgulas"
              value={formData.pessoasAutorizadas}
              onChangeText={(v) => handleChange('pessoasAutorizadas', v)}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Finalizar Cadastro</Text>
            )}
          </TouchableOpacity>

          <View style={styles.obsContainer}>
            <Text style={styles.obsTitle}>OBSERVAÇÕES IMPORTANTES:</Text>
            <Text style={styles.obsText}>
              ✓ Só clique em &quot;Enviar Documentos&quot; se for enviar por e-mail{"\n"}
              ✗ Se for entregar pessoalmente ou já entregou, não clique!{"\n"}
              ☑ Clique apenas se a escola solicitar envio digital
            </Text>
            
            {/* Botão Novo */}
           

            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmail}>
              <Text style={styles.emailButtonText}>Enviar Documentos</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadTerms}
            >
              <FontAwesome name="file-pdf-o" size={18} color="white" />
              <Text style={styles.downloadButtonText}>Baixar Termos Escolares</Text>
            </TouchableOpacity>
            
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setStep(1)}>
            <Text style={styles.buttonText}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/home')}
            style={styles.backButton}>
            <Text style={styles.backLink}>Voltar à Página Principal</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  stepContainer: {
    gap: 20,
  },
  sectionTitle: {
    color: '#902121',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#444',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#8B0000',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#902121',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  backLink: {
    color: '#902121',
    fontSize: 14,
    fontWeight: '500',
  },
  obsContainer: {
    backgroundColor: '#fff8e1',
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe082',
    gap: 12,
  },
  obsTitle: {
    color: '#902121',
    fontSize: 16,
    fontWeight: '600',
  },
  obsText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  emailButton: {
    backgroundColor: '#8B0000',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  emailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#8B0000',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FormularioCompleto;