import { Picker } from '@react-native-picker/picker';
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
import useFormStore from './Store/useFormStore';

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
    respTelefone: '',
    pessoasAutorizadas: ''
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const telefoneMask = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEmail = () => {
    Linking.openURL(
      `mailto:vanessalimapsicopedagoga@bol.com.br?` +
      `subject=Envio de Documentos - ${aluno.nome}&` +
      `body=Segue em anexo os documentos necessários para matrícula de ${aluno.nome}`
    );
  };

  const validateStep1 = () => {
    if (!matriculaTipo) {
      Alert.alert('Atenção', 'Selecione o tipo de matrícula!');
      return false;
    }
    if ((matriculaTipo === 'transferencia_municipal_estadual' || matriculaTipo === 'transferencia_particular') && !escola.trim()) {
      Alert.alert('Atenção', 'Informe o nome da escola anterior!');
      return false;
    }
    if (temIrmaos === 'sim' && !irmaosNome.trim()) {
      Alert.alert('Atenção', 'Informe os nomes dos irmãos!');
      return false;
    }
    if (temEspecialista === 'sim' && !especialista.trim()) {
      Alert.alert('Atenção', 'Informe o tipo de acompanhamento!');
      return false;
    }
    if (temAlergias === 'sim' && !alergia.trim()) {
      Alert.alert('Atenção', 'Descreva as alergias!');
      return false;
    }
    if (temMedicamento === 'sim' && !medicamento.trim()) {
      Alert.alert('Atenção', 'Informe os medicamentos!');
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
        respTelefone: formData.respTelefone,
        pessoasAutorizadas: formData.pessoasAutorizadas,
        alunoId
      });

      Alert.alert('Sucesso', 'Cadastro completo realizado!');
      clearStore();
      router.push('/home');

    } catch (error) {
      let errorMessage = 'Erro no cadastro:';
      if (isAxiosError(error)) {
        errorMessage += `\n${error.response?.data?.message || error.message}`;
        console.error('Endpoint:', error.config?.url);
        console.error('Payload:', error.config?.data);
      }
      Alert.alert('Erro', errorMessage);
      console.error('Detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Matrícula</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={matriculaTipo}
                  onValueChange={setMatriculaTipo}
                  dropdownIconColor="#666">
                  <Picker.Item label="Selecione" value="" />
                  <Picker.Item label="Inicial" value="inicial" />
                  <Picker.Item label="Transferência Municipal/Estadual" value="transferencia_municipal_estadual" />
                  <Picker.Item label="Transferência Particular" value="transferencia_particular" />
                </Picker>
              </View>
              {(matriculaTipo === 'transferencia_municipal_estadual' || matriculaTipo === 'transferencia_particular') && (
                <TextInput
                  style={styles.input}
                  placeholder="Nome da Escola Anterior"
                  value={escola}
                  onChangeText={setEscola}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Possui Irmãos?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={temIrmaos}
                  onValueChange={setTemIrmaos}
                  dropdownIconColor="#666">
                  <Picker.Item label="Selecione" value="" />
                  <Picker.Item label="Sim" value="sim" />
                  <Picker.Item label="Não" value="não" />
                </Picker>
              </View>
              {temIrmaos === 'sim' && (
                <TextInput
                  style={styles.input}
                  placeholder="Nomes dos Irmãos (separados por vírgula)"
                  value={irmaosNome}
                  onChangeText={setIrmaosNome}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Faz Acompanhamento Especializado?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={temEspecialista}
                  onValueChange={setTemEspecialista}
                  dropdownIconColor="#666">
                  <Picker.Item label="Selecione" value="" />
                  <Picker.Item label="Sim" value="sim" />
                  <Picker.Item label="Não" value="não" />
                </Picker>
              </View>
              {temEspecialista === 'sim' && (
                <TextInput
                  style={styles.input}
                  placeholder="Tipo de Acompanhamento"
                  value={especialista}
                  onChangeText={setEspecialista}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Possui Alergias?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={temAlergias}
                  onValueChange={setTemAlergias}
                  dropdownIconColor="#666">
                  <Picker.Item label="Selecione" value="" />
                  <Picker.Item label="Sim" value="sim" />
                  <Picker.Item label="Não" value="não" />
                </Picker>
              </View>
              {temAlergias === 'sim' && (
                <TextInput
                  style={styles.input}
                  placeholder="Descrição das Alergias"
                  value={alergia}
                  onChangeText={setAlergia}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Faz Uso de Medicamentos?</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={temMedicamento}
                  onValueChange={setTemMedicamento}
                  dropdownIconColor="#666">
                  <Picker.Item label="Selecione" value="" />
                  <Picker.Item label="Sim" value="sim" />
                  <Picker.Item label="Não" value="não" />
                </Picker>
              </View>
              {temMedicamento === 'sim' && (
                <TextInput
                  style={styles.input}
                  placeholder="Medicamentos em Uso"
                  value={medicamento}
                  onChangeText={setMedicamento}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNextStep}
            disabled={loading}>
            <Text style={styles.buttonText}>Próximo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/forms-paterno')}
            style={styles.backButton}
          >
            <Text style={styles.backLink}>Voltar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>

             <View style={styles.section}>
            <Text style={styles.sectionTitle}>Composição Familiar</Text>
            <TextInput
              style={styles.inputFull}
              placeholder="Com quem reside (Ex: Pai, Mãe, Avós)"
              value={formData.reside}
              onChangeText={(v) => handleChange('reside', v)}
            />
          </View>


          <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsável Financeiro</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Nome Completo"
              value={formData.respNome}
              onChangeText={(v) => handleChange('respNome', v)}
            />
            <MaskInput
              style={styles.input}
              placeholder="Telefone (00) 00000-0000"
              value={formData.respTelefone}
              onChangeText={(v) => handleChange('respTelefone', v)}
              mask={telefoneMask}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Autorizados para Buscar</Text>
          <TextInput
            style={[styles.inputFull, { height: 80 }]}
            placeholder="Pessoas autorizadas (Nome completo e documento)"
            value={formData.pessoasAutorizadas}
            onChangeText={(v) => handleChange('pessoasAutorizadas', v)}
            multiline
          />
        </View>

        {/* Botão Finalizar primeiro */}
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

        {/* Seção de Observações depois do botão Finalizar */}
        <View style={styles.section}>
          <Text style={styles.obsTitle}>OBSERVAÇÕES IMPORTANTES:</Text>
          <View style={styles.obsContainer}>
            <Text style={styles.obsText}>
              ✓ Só clique em &quot;Enviar Documentos&quot; se for enviar por e-mail{"\n"}
              ✗ Se for entregar pessoalmente ou já entregou, não clique!{"\n"}
              ☑ Clique apenas se a escola solicitar envio digital
            </Text>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmail}
            >
              <Text style={styles.emailButtonText}>Enviar Documentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Anterior depois das Observações */}
        <TouchableOpacity
          style={[styles.button, styles.backButtonStep2]}
          onPress={() => setStep(1)}
          disabled={loading}>
          <Text style={styles.buttonText}>Anterior</Text>
        </TouchableOpacity>

        {/* Botão Voltar no final */}
        <TouchableOpacity
          onPress={() => router.push('/home')}
          style={styles.backButton}
        >
          <Text style={styles.backLink}>Voltar à Página Principal</Text>
        </TouchableOpacity>
      </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    color: '#902121',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  inputFull: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#8B0000',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  backButtonStep2: {
    backgroundColor: '#902121',
  },
  buttonContainer: {
    flexDirection: 'column-reverse',
    gap: 12,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backLink: {
    color: '#902121',
    textAlign: 'center',
    fontSize: 18,
    
  },
  obsTitle: {
    color: '#902121',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  obsContainer: {
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  obsText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
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
});

export default FormularioCompleto;