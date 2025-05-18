import { create } from 'zustand';

// Tipos (adaptar conforme suas necessidades)
type AlunoData = {
    nome: string;
    dataNascimento: string;
    naturalidade: string;
    nacionalidade: string;
    cpf: string;
    rg: string;
    termo: string;
    folha: string;
    livro: string;
    matricula: string;
    sexo: string;
    turno: string;
    tipoSanguineo: string;
    raca: string;
    anoLetivo: string;
};

type MaeData = {
    nomeMae: string;
    cepMae: string;
    telefoneMae: string;
    trabalhoMae: string;
    nascimentoMae: string;
    cpfMae: string;
    rgMae: string;
    emailMae: string;   
    telefoneTrabalhoMae: string;
    enderecoMae: string;
    profissaoMae: string;
};

type PaiData = {
    nomePai: string;
    telefonePai: string;
    trabalhoPai: string;
    cepPai: string;
    nascimentoPai: string;
    cpfPai: string;
    rgPai: string;
    emailPai: string;
    telefoneTrabalhoPai: string;
    enderecoPai: string;
    profissaoPai: string;

};

type ObservacoesData = {
    reside: string;
    respNome: string;
    respTelefone: string;
    pessoasAutorizadas: string;
    matriculatipo: string;
    escola: string;
    temIrmaos: string;
    irmaosNome: string;
    temEspecialista: string;
    especialista: string;
    temAlergias: string;
    alergia: string;
    temMedicamento: string;
    medicamento: string;
};

type FormStore = {
  aluno: Partial<AlunoData>;
  mae: Partial<MaeData>;
  pai: Partial<PaiData>;
  observacoes: Partial<ObservacoesData>;
  setAluno: (data: AlunoData) => void;
  setMae: (data: MaeData) => void;
  setPai: (data: PaiData) => void;
  setObservacoes: (data: ObservacoesData) => void;
  clearStore: () => void;
};

// Criação do store
const useFormStore = create<FormStore>((set) => ({
  aluno: {},
  mae: {},
  pai: {},
  observacoes: {},
  
  // Métodos para atualizar cada seção
  setAluno: (data) => set({ aluno: data }),
  setMae: (data) => set({ mae: data }),
  setPai: (data) => set({ pai: data }),
  setObservacoes: (data) => set({ observacoes: data }),
  
  // Limpar dados após o envio
  clearStore: () => set({ 
    aluno: {}, 
    mae: {}, 
    pai: {}, 
    observacoes: {} 
  }),
}));

export default useFormStore;