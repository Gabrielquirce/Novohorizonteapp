import axios, { isAxiosError } from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import React, { FC, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = 'http://192.168.1.2:8080';

interface Aluno {
  id: number;
  nome: string;
  dataNascimento: string;
  naturalidade: string;
  nacionalidade: string;
  sexo: string;
  cpf: string;
  rg: string;
  anoLetivo: string;
  termo: string;
  folha: string;
  livro: string;
  matricula: string;
  turno: string;
  tipoSanguineo: string;
  raca: string;
}

interface Mae {
  idMae: number;
  nomeMae: string;
  nascimentoMae: string;
  enderecoMae: string;
  cepMae: string;
  cpfMae: string;
  rgMae: string;
  profissaoMae: string;
  telefoneMae: string;
  emailMae: string;
  trabalhoMae: string;
  telefoneTrabalhoMae: string;
}

interface Pai {
  idPai: number;
  nomePai: string;
  nascimentoPai: string;
  enderecoPai: string;
  cepPai: string;
  cpfPai: string;
  rgPai: string;
  profissaoPai: string;
  telefonePai: string;
  emailPai: string;
  trabalhoPai: string;
  telefoneTrabalhoPai: string;
}

interface Observacao {
  idObservacoes: number;
  matriculaTipo: string;
  escola: string;
  temIrmaos: string;
  irmaosNome: string;
  temEspecialista: string;
  especialista: string;
  temAlergias: string;
  alergia: string;
  temMedicamento: string;
  medicamento: string;
  reside: string;
  respNome: string;
  respTelefone: string;
  pessoasAutorizadas: string;
}

interface StudentData extends Aluno {
  mae: Mae;
  pai: Pai;
  observacao: Observacao;
}

const StudentsScreen: FC = () => {
  const [data, setData] = useState<StudentData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alunosRes, maesRes, paisRes, obsRes] = await Promise.all([
          axios.get<Aluno[]>(`${API_URL}/alunos`),
          axios.get<Mae[]>(`${API_URL}/maes`),
          axios.get<Pai[]>(`${API_URL}/pais`),
          axios.get<Observacao[]>(`${API_URL}/observacoes`),
        ]);

        const merged: StudentData[] = alunosRes.data.map(aluno => ({
          ...aluno,
          mae: maesRes.data.find(m => m.idMae === aluno.id) ?? {} as Mae,
          pai: paisRes.data.find(p => p.idPai === aluno.id) ?? {} as Pai,
          observacao: obsRes.data.find(o => o.idObservacoes === aluno.id) ?? {} as Observacao
        }));

        setData(merged);
      } catch (err: unknown) {
        setError(isAxiosError(err) ? err : new Error('Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(student =>
    [student.nome, student.cpf, student.mae.nomeMae, student.pai.nomePai, student.matricula]
      .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportToCSV = async (student: StudentData) => {
    try {
      const sanitizeFileName = (name: string) => {
        return name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .replace(/_+/g, '_')
          .substring(0, 50);
      };

      const fileName = `${sanitizeFileName(student.nome)}_dados.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const formatValue = (value: string | undefined) => {
        if (!value) return '""';
        return `"${value.replace(/"/g, '""')}"`;
      };

      const csvRows = [
        ['Campo', 'Valor'],
        ['Nome do Aluno', formatValue(student.nome)],
        ['Data de Nascimento', formatValue(student.dataNascimento)],
        ['Naturalidade', formatValue(student.naturalidade)],
        ['Nacionalidade', formatValue(student.nacionalidade)],
        ['Sexo', formatValue(student.sexo)],
        ['CPF', formatValue(student.cpf)],
        ['RG', formatValue(student.rg)],
        ['Ano Letivo', formatValue(student.anoLetivo)],
        ['Termo', formatValue(student.termo)],
        ['Folha', formatValue(student.folha)],
        ['Livro', formatValue(student.livro)],
        ['Matrícula', formatValue(student.matricula)],
        ['Turno', formatValue(student.turno)],
        ['Tipo Sanguíneo', formatValue(student.tipoSanguineo)],
        ['Raça/Cor', formatValue(student.raca)],
        ['Nome da Mãe', formatValue(student.mae.nomeMae)],
        ['Nascimento da Mãe', formatValue(student.mae.nascimentoMae)],
        ['Endereço da Mãe', formatValue(student.mae.enderecoMae)],
        ['CEP da Mãe', formatValue(student.mae.cepMae)],
        ['CPF da Mãe', formatValue(student.mae.cpfMae)],
        ['RG da Mãe', formatValue(student.mae.rgMae)],
        ['Profissão da Mãe', formatValue(student.mae.profissaoMae)],
        ['Telefone da Mãe', formatValue(student.mae.telefoneMae)],
        ['Email da Mãe', formatValue(student.mae.emailMae)],
        ['Trabalho da Mãe', formatValue(student.mae.trabalhoMae)],
        ['Telefone do Trabalho da Mãe', formatValue(student.mae.telefoneTrabalhoMae)],
        ['Nome do Pai', formatValue(student.pai.nomePai)],
        ['Nascimento do Pai', formatValue(student.pai.nascimentoPai)],
        ['Endereço do Pai', formatValue(student.pai.enderecoPai)],
        ['CEP do Pai', formatValue(student.pai.cepPai)],
        ['CPF do Pai', formatValue(student.pai.cpfPai)],
        ['RG do Pai', formatValue(student.pai.rgPai)],
        ['Profissão do Pai', formatValue(student.pai.profissaoPai)],
        ['Telefone do Pai', formatValue(student.pai.telefonePai)],
        ['Email do Pai', formatValue(student.pai.emailPai)],
        ['Trabalho do Pai', formatValue(student.pai.trabalhoPai)],
        ['Telefone do Trabalho do Pai', formatValue(student.pai.telefoneTrabalhoPai)],
        ['Tipo de Matrícula', formatValue(student.observacao.matriculaTipo)],
        ['Escola Anterior', formatValue(student.observacao.escola)],
        ['Possui Irmãos', formatValue(student.observacao.temIrmaos)],
        ['Nomes dos Irmãos', formatValue(student.observacao.irmaosNome)],
        ['Acompanhamento Especialista', formatValue(student.observacao.temEspecialista)],
        ['Especialista', formatValue(student.observacao.especialista)],
        ['Possui Alergias', formatValue(student.observacao.temAlergias)],
        ['Tipo de Alergia', formatValue(student.observacao.alergia)],
        ['Usa Medicamento', formatValue(student.observacao.temMedicamento)],
        ['Medicamento', formatValue(student.observacao.medicamento)],
        ['Reside', formatValue(student.observacao.reside)],
        ['Responsável Financeiro', formatValue(student.observacao.respNome)],
        ['Contato do Responsável', formatValue(student.observacao.respTelefone)],
        ['Pessoas Autorizadas', formatValue(student.observacao.pessoasAutorizadas)],
      ];

      const csvContent = `\ufeff${csvRows.map(row => row.join(';')).join('\n')}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar Dados do Aluno',
        UTI: 'public.comma-separated-values-text'
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar CSV!\nVerifique o console para detalhes.');
    }
  };

  const exportToPDF = async (student: StudentData) => {
    try {
      const html = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial; 
              margin: 0;
              padding: 0;
            }
            @page {
              size: A4;
              margin: 50px 30px;
            }
            .page-break {
              page-break-before: always;
              padding-top: 50px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              color: #8B0000;
              border-bottom: 2px solid #8B0000;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              width: 45%;
            }
            .value {
              width: 50%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <h1>Ficha do Aluno - ${student.nome}</h1>
            </div>
            <div class="section">
              <h2 class="section-title">Dados Pessoais</h2>
              ${renderPDFSection(student, [
                'nome', 'dataNascimento', 'naturalidade', 'nacionalidade',
                'sexo', 'cpf', 'rg', 'anoLetivo', 'termo', 'folha',
                'livro', 'matricula', 'turno', 'tipoSanguineo', 'raca'
              ])}
            </div>
            <div class="section">
              <h2 class="section-title">Dados da Mãe</h2>
              ${renderPDFSection(student.mae, [
                'nomeMae', 'nascimentoMae', 'enderecoMae', 'cepMae',
                'cpfMae', 'rgMae', 'profissaoMae', 'telefoneMae',
                'emailMae', 'trabalhoMae', 'telefoneTrabalhoMae'
              ])}
            </div>
          </div>
          <div class="page-break">
            <div class="section">
              <h2 class="section-title">Dados do Pai</h2>
              ${renderPDFSection(student.pai, [
                'nomePai', 'nascimentoPai', 'enderecoPai', 'cepPai',
                'cpfPai', 'rgPai', 'profissaoPai', 'telefonePai',
                'emailPai', 'trabalhoPai', 'telefoneTrabalhoPai'
              ])}
            </div>
            <div class="section">
              <h2 class="section-title">Observações</h2>
              <table>
                ${renderPDFSection(student.observacao, [
                  'matriculaTipo', 'escola', 'temIrmaos', 'irmaosNome',
                  'temEspecialista', 'especialista', 'temAlergias', 'alergia',
                  'temMedicamento', 'medicamento', 'reside', 'respNome',
                  'respTelefone', 'pessoasAutorizadas'
                ], true)}
              </table>
            </div>
          </div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
      });
      await shareAsync(uri);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const renderPDFSection = (data: any, fields: string[], useTable: boolean = false) => {
    return fields.map(field => {
      const label = formatLabel(field);
      const value = data[field] || 'Não informado';
      
      return useTable ? `
        <tr>
          <td><strong>${label}:</strong></td>
          <td>${value}</td>
        </tr>
      ` : `
        <div class="row">
          <span class="label">${label}:</span>
          <span class="value">${value}</span>
        </div>
      `;
    }).join('');
  };

  const formatLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      id: 'ID',
      nome: 'Nome',
      dataNascimento: 'Data de Nascimento',
      naturalidade: 'Naturalidade',
      nacionalidade: 'Nacionalidade',
      sexo: 'Sexo',
      cpf: 'CPF',
      rg: 'RG',
      anoLetivo: 'Ano Letivo',
      termo: 'Termo',
      folha: 'Folha',
      livro: 'Livro',
      matricula: 'Matrícula',
      turno: 'Turno',
      tipoSanguineo: 'Tipo Sanguíneo',
      raca: 'Raça/Cor',
      nomeMae: 'Nome',
      nascimentoMae: 'Data de Nascimento',
      enderecoMae: 'Endereço',
      cepMae: 'CEP',
      cpfMae: 'CPF',
      rgMae: 'RG',
      profissaoMae: 'Profissão',
      telefoneMae: 'Telefone',
      emailMae: 'E-mail',
      trabalhoMae: 'Local de Trabalho',
      telefoneTrabalhoMae: 'Telefone do Trabalho',
      nomePai: 'Nome',
      nascimentoPai: 'Data de Nascimento',
      enderecoPai: 'Endereço',
      cepPai: 'CEP',
      cpfPai: 'CPF',
      rgPai: 'RG',
      profissaoPai: 'Profissão',
      telefonePai: 'Telefone',
      emailPai: 'E-mail',
      trabalhoPai: 'Local de Trabalho',
      telefoneTrabalhoPai: 'Telefone do Trabalho',
      matriculaTipo: 'Tipo de Matrícula',
      escola: 'Escola Anterior',
      temIrmaos: 'Possui Irmãos',
      irmaosNome: 'Nomes dos Irmãos',
      temEspecialista: 'Acompanhamento Especialista',
      especialista: 'Especialista',
      temAlergias: 'Possui Alergias',
      alergia: 'Tipo de Alergia',
      temMedicamento: 'Usa Medicamento',
      medicamento: 'Medicamento Utilizado',
      reside: 'Reside Com',
      respNome: 'Responsável Financeiro',
      respTelefone: 'Contato do Responsável',
      pessoasAutorizadas: 'Pessoas Autorizadas'
    };

    return labels[key] || key
      .replace(/([A-Z])/g, ' $1')
      .replace(/(Mae|Pai)$/gi, '')
      .trim()
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/(Cpf|Cep)/gi, (match) => match.toUpperCase());
  };

  const renderItem = ({ item }: { item: StudentData }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => setSelectedStudent(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>{item.nome}</Text>
        <Text style={styles.studentMatricula}>{item.matricula}</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>CPF: {item.cpf}</Text>
        <Text style={styles.detailText}>Responsável: {item.mae.nomeMae}</Text>
      </View>
    </TouchableOpacity>
  );

  const DetailModal = () => (
    <Modal
      visible={!!selectedStudent}
      animationType="slide"
      onRequestClose={() => setSelectedStudent(null)}
    >
      <ScrollView style={styles.modalContainer}>
        {selectedStudent && (
          <>
            <Text style={styles.modalTitle}>Ficha Completa do Aluno</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados Pessoais</Text>
              <DetailItem label="Nome" value={selectedStudent.nome} />
              <DetailItem label="Data de Nascimento" value={selectedStudent.dataNascimento} />
              <DetailItem label="Naturalidade" value={selectedStudent.naturalidade} />
              <DetailItem label="Nacionalidade" value={selectedStudent.nacionalidade} />
              <DetailItem label="Sexo" value={selectedStudent.sexo} />
              <DetailItem label="CPF" value={selectedStudent.cpf} />
              <DetailItem label="RG" value={selectedStudent.rg} />
              <DetailItem label="Ano Letivo" value={selectedStudent.anoLetivo} />
              <DetailItem label="Termo" value={selectedStudent.termo} />
              <DetailItem label="Folha" value={selectedStudent.folha} />
              <DetailItem label="Livro" value={selectedStudent.livro} />
              <DetailItem label="Matrícula" value={selectedStudent.matricula} />
              <DetailItem label="Turno" value={selectedStudent.turno} />
              <DetailItem label="Tipo Sanguíneo" value={selectedStudent.tipoSanguineo} />
              <DetailItem label="Raça/Cor" value={selectedStudent.raca} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados da Mãe</Text>
              <DetailItem label="Nome" value={selectedStudent.mae.nomeMae} />
              <DetailItem label="Data de Nascimento" value={selectedStudent.mae.nascimentoMae} />
              <DetailItem label="Endereço" value={selectedStudent.mae.enderecoMae} />
              <DetailItem label="CEP" value={selectedStudent.mae.cepMae} />
              <DetailItem label="CPF" value={selectedStudent.mae.cpfMae} />
              <DetailItem label="RG" value={selectedStudent.mae.rgMae} />
              <DetailItem label="Profissão" value={selectedStudent.mae.profissaoMae} />
              <DetailItem label="Telefone" value={selectedStudent.mae.telefoneMae} />
              <DetailItem label="Email" value={selectedStudent.mae.emailMae} />
              <DetailItem label="Trabalho" value={selectedStudent.mae.trabalhoMae} />
              <DetailItem label="Telefone Trabalho" value={selectedStudent.mae.telefoneTrabalhoMae} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do Pai</Text>
              <DetailItem label="Nome" value={selectedStudent.pai.nomePai} />
              <DetailItem label="Data de Nascimento" value={selectedStudent.pai.nascimentoPai} />
              <DetailItem label="Endereço" value={selectedStudent.pai.enderecoPai} />
              <DetailItem label="CEP" value={selectedStudent.pai.cepPai} />
              <DetailItem label="CPF" value={selectedStudent.pai.cpfPai} />
              <DetailItem label="RG" value={selectedStudent.pai.rgPai} />
              <DetailItem label="Profissão" value={selectedStudent.pai.profissaoPai} />
              <DetailItem label="Telefone" value={selectedStudent.pai.telefonePai} />
              <DetailItem label="Email" value={selectedStudent.pai.emailPai} />
              <DetailItem label="Trabalho" value={selectedStudent.pai.trabalhoPai} />
              <DetailItem label="Telefone Trabalho" value={selectedStudent.pai.telefoneTrabalhoPai} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observações</Text>
              <DetailItem label="Tipo de Matrícula" value={selectedStudent.observacao.matriculaTipo} />
              <DetailItem label="Escola Anterior" value={selectedStudent.observacao.escola} />
              <DetailItem label="Possui Irmãos" value={selectedStudent.observacao.temIrmaos} />
              <DetailItem label="Nomes dos Irmãos" value={selectedStudent.observacao.irmaosNome} />
              <DetailItem label="Acompanhamento Especialista" value={selectedStudent.observacao.temEspecialista} />
              <DetailItem label="Especialista" value={selectedStudent.observacao.especialista} />
              <DetailItem label="Possui Alergias" value={selectedStudent.observacao.temAlergias} />
              <DetailItem label="Tipo de Alergia" value={selectedStudent.observacao.alergia} />
              <DetailItem label="Usa Medicamento" value={selectedStudent.observacao.temMedicamento} />
              <DetailItem label="Medicamento" value={selectedStudent.observacao.medicamento} />
              <DetailItem label="Reside Com" value={selectedStudent.observacao.reside} />
              <DetailItem label="Responsável Financeiro" value={selectedStudent.observacao.respNome} />
              <DetailItem label="Contato do Responsável" value={selectedStudent.observacao.respTelefone} />
              <DetailItem label="Pessoas Autorizadas" value={selectedStudent.observacao.pessoasAutorizadas} />
            </View>

            <View style={styles.exportButtonsContainer}>
              <View style={styles.exportRow}>
                <TouchableOpacity
                  style={[styles.exportButton, styles.pdfButton, styles.halfButton]}
                  onPress={() => exportToPDF(selectedStudent)}
                >
                  <Text style={styles.exportButtonText}>Exportar PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.exportButton, styles.csvButton, styles.halfButton]}
                  onPress={() => exportToCSV(selectedStudent)}
                >
                  <Text style={styles.exportButtonText}>Exportar CSV</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedStudent(null)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </Modal>
  );

  const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Não informado'}</Text>
    </View>
  );

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#902121" />
    </View>
  );

  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error.message}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alunos Cadastrados</Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome, CPF ou matrícula..."
        placeholderTextColor="#666"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContainer}
      />
      <DetailModal />
      <TouchableOpacity
                      onPress={() => router.push('/home')}
                      style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Voltar</Text>
                    </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#902121',
    padding: 20,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    elevation: 2,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  studentMatricula: {
    fontSize: 14,
    color: '#666',
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#902121',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  exportButtonsContainer: {
    marginTop: 20,
    marginBottom: 60,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  exportButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  pdfButton: {
    backgroundColor: '#8B0000',
  },
  csvButton: {
    backgroundColor: '#006400',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#902121',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StudentsScreen;