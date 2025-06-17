import { FontAwesome } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform, // Import Modal for CustomModal
  Pressable, // Import Pressable for CustomModal buttons
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import api from "./api/axiosInstance";
import CustomPicker from "./components/CustomPicker";
import useFormStore from "./Store/useFormStore";

const cpfMask = [
  /\d/,
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
];
const rgMask = [
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
];
const telefoneMask = [
  "(",
  /\d/,
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

// Define the type for form fields in FormularioCompleto
type FormDataComplete = {
  reside: string;
  respNome: string;
  respCpf: string;
  respTelefone: string;
  pessoasAutorizadas: string;
};

/**
 * Custom Modal component for displaying alerts and confirmations.
 * Replaces native Alert.alert for consistent UI and better control.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.visible - Controls the visibility of the modal.
 * @param {string} props.title - Title text for the modal.
 * @param {string} props.message - Message text for the modal.
 * @param {Array<object>} props.buttons - Array of button configurations.
 * @param {string} props.buttons[].text - Text displayed on the button.
 * @param {function} props.buttons[].onPress - Function to call when the button is pressed.
 * @param {'default' | 'cancel'} [props.buttons[].style] - Optional style for the button (e.g., 'cancel').
 */
const CustomModal = ({
  visible,
  title,
  message,
  buttons,
}: {
  visible: boolean;
  title: string;
  message: string;
  buttons: {
    text: string;
    onPress: () => void;
    style?: "default" | "cancel";
  }[];
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {}} // Handle Android back button
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>{title}</Text>
          <Text style={modalStyles.modalText}>{message}</Text>
          <View style={modalStyles.buttonsContainer}>
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                style={[
                  modalStyles.button,
                  button.style === "cancel" && modalStyles.cancelButton,
                ]}
                onPress={button.onPress}
                accessibilityLabel={`Botão: ${button.text}`}
              >
                <Text
                  style={[
                    modalStyles.textStyle,
                    button.style === "cancel" && modalStyles.cancelText,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const FormularioCompleto = () => {
  const { aluno, mae, pai, clearStore } = useFormStore();
  const [matriculaTipo, setMatriculaTipo] = useState("");
  const [escola, setEscola] = useState("");
  const [temIrmaos, setTemIrmaos] = useState("");
  const [irmaosNome, setIrmaosNome] = useState("");
  const [temEspecialista, setTemEspecialista] = useState("");
  const [especialista, setEspecialista] = useState("");
  const [temAlergias, setTemAlergias] = useState("");
  const [alergia, setAlergia] = useState("");
  const [temMedicamento, setTemMedicamento] = useState("");
  const [medicamento, setMedicamento] = useState("");
  const [formData, setFormData] = useState<FormDataComplete>({
    reside: "",
    respNome: "",
    respCpf: "",
    respTelefone: "",
    pessoasAutorizadas: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // States for modal control
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalButtons, setModalButtons] = useState<
    {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel";
    }[]
  >([]);

  // Ref para ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  /**
   * Helper function to show the custom modal.
   *
   * @param {string} title - Title of the modal.
   * @param {string} message - Message content of the modal.
   * @param {Array<object>} buttons - Array of button objects { text, onPress, style? }.
   */
  const showModal = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel";
    }[]
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  const handleChange = useCallback(
    (field: keyof FormDataComplete, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleEmail = () => {
    showModal(
      "📧 Confirmação de Envio",
      "Tem certeza que deseja abrir o cliente de e-mail para enviar os documentos?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setModalVisible(false),
        },
        {
          text: "Enviar",
          onPress: () => {
            setModalVisible(false);
            Linking.openURL(
              `mailto:vanessalimapsicopedagoga@bol.com.br?` +
                `subject=Envio de Documentos - ${aluno.nome}&` +
                `body=Segue em anexo os documentos necessários para matrícula de (Nome Completo do Aluno) ${aluno.nome}`
            );
          },
        },
      ]
    );
  };

  const handleDownloadTerms = async () => {
    try {
      // 1. Carregar o asset corretamente
      const asset = Asset.fromModule(require("../assets/images/termos.pdf"));
      await asset.downloadAsync();

      // 2. Criar cópia no diretório de cache
      const newUri = FileSystem.cacheDirectory + "termos.pdf";
      await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: newUri,
      });

      // 3. Compartilhar o arquivo
      if (!(await Sharing.isAvailableAsync())) {
        showModal("Erro", "Compartilhamento não disponível neste dispositivo", [
          {
            text: "OK",
            style: "cancel",
            onPress: () => setModalVisible(false),
          },
        ]);
        return;
      }

      await Sharing.shareAsync(newUri, {
        mimeType: "application/pdf",
        dialogTitle: "Baixar Termos",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      showModal("Erro", "Falha ao acessar os termos", [
        { text: "OK", style: "cancel", onPress: () => setModalVisible(false) },
      ]);
      console.error("Erro detalhado:", error);
    }
  };

  const validateStep1 = () => {
    const errors = [];
    if (!matriculaTipo) errors.push("Selecione o tipo de matrícula");
    if (
      (matriculaTipo === "transferencia_municipal_estadual" ||
        matriculaTipo === "transferencia_particular") &&
      !escola.trim()
    ) {
      errors.push("Informe o nome da escola anterior");
    }
    if (!temIrmaos) errors.push("Selecione se possui irmãos");
    if (temIrmaos === "sim" && !irmaosNome.trim())
      errors.push("Informe os nomes dos irmãos");
    if (!temEspecialista)
      errors.push("Selecione se possui acompanhamento especializado");
    if (temEspecialista === "sim" && !especialista.trim())
      errors.push("Informe o tipo de acompanhamento");
    if (!temAlergias) errors.push("Selecione se possui alergias");
    if (temAlergias === "sim" && !alergia.trim())
      errors.push("Descreva as alergias");
    if (!temMedicamento) errors.push("Selecione se usa medicamentos");
    if (temMedicamento === "sim" && !medicamento.trim())
      errors.push("Informe os medicamentos");

    if (errors.length > 0) {
      showModal("🚨 Campos Obrigatórios", `• ${errors.join("\n• ")}`, [
        { text: "OK", style: "cancel", onPress: () => setModalVisible(false) },
      ]);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const errors = [];
    if (!formData.reside.trim())
      errors.push('Campo "Reside com" é obrigatório');
    if (!formData.respNome.trim())
      errors.push("Nome do responsável é obrigatório");
    if (formData.respCpf.replace(/\D/g, "").length !== 11)
      errors.push("CPF do responsável inválido");
    if (formData.respTelefone.replace(/\D/g, "").length !== 11)
      errors.push("Telefone inválido");

    if (errors.length > 0) {
      showModal("🚨 Dados Incompletos", `• ${errors.join("\n• ")}`, [
        { text: "OK", style: "cancel", onPress: () => setModalVisible(false) },
      ]);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const submitData = async () => {
    if (step === 2 && !validateStep2()) return;
    setLoading(true);
    try {
      const alunoResponse = await api.post("/alunos", {
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
        matricula: aluno.matricula,
      });

      const alunoId = alunoResponse.data.id;

      // Mãe
      if (mae && Object.values(mae).filter(Boolean).length > 0) {
        const maeCompleta = {
          nomeMae: mae.nomeMae ?? "Não informado",
          cepMae: mae.cepMae ?? "00000-000",
          telefoneMae: mae.telefoneMae ?? "(00) 00000-0000",
          trabalhoMae: mae.trabalhoMae ?? "Não informado",
          nascimentoMae: mae.nascimentoMae ?? "00/00/0000",
          cpfMae: mae.cpfMae ?? "000.000.000-00",
          emailMae: mae.emailMae ?? "nao@informado.com",
          telefoneTrabalhoMae: mae.telefoneTrabalhoMae ?? "(00) 00000-0000",
          enderecoMae: mae.enderecoMae ?? "Não informado",
          rgMae: mae.rgMae ?? "00.000.000-0",
          profissaoMae: mae.profissaoMae ?? "Não informado",
          numeroCasaMae: mae.numeroCasaMae ?? "0",
          alunoId,
        };
        await api.post("/maes", maeCompleta);
      } else {
        // Envia mãe padrão se não houver dados
        await api.post("/maes", {
          nomeMae: "Não informado",
          cepMae: "00000-000",
          telefoneMae: "(00) 00000-0000",
          trabalhoMae: "Não informado",
          nascimentoMae: "00/00/0000",
          cpfMae: "000.000.000-00",
          emailMae: "nao@informado.com",
          telefoneTrabalhoMae: "(00) 00000-0000",
          enderecoMae: "Não informado",
          rgMae: "00.000.000-0",
          profissaoMae: "Não informado",
          numeroCasaMae: "0",
          alunoId,
        });
      }

      // Pai
      if (pai && Object.values(pai).filter(Boolean).length > 0) {
        const paiCompleto = {
          nomePai: pai.nomePai ?? "Não informado",
          cepPai: pai.cepPai ?? "00000-000",
          telefonePai: pai.telefonePai ?? "(00) 00000-0000",
          trabalhoPai: pai.trabalhoPai ?? "Não informado",
          nascimentoPai: pai.nascimentoPai ?? "00/00/0000",
          cpfPai: pai.cpfPai ?? "000.000.000-00",
          emailPai: pai.emailPai ?? "nao@informado.com",
          telefoneTrabalhoPai: pai.telefoneTrabalhoPai ?? "(00) 00000-0000",
          enderecoPai: pai.enderecoPai ?? "Não informado",
          rgPai: pai.rgPai ?? "00.000.000-0",
          profissaoPai: pai.profissaoPai ?? "Não informado",
          numeroCasaPai: pai.numeroCasaPai ?? "0",
          alunoId,
        };
        await api.post("/pais", paiCompleto);
      } else {
        // Envia pai padrão se não houver dados
        await api.post("/pais", {
          nomePai: "Não informado",
          cepPai: "00000-000",
          telefonePai: "(00) 00000-0000",
          trabalhoPai: "Não informado",
          nascimentoPai: "00/00/0000",
          cpfPai: "000.000.000-00",
          emailPai: "nao@informado.com",
          telefoneTrabalhoPai: "(00) 00000-0000",
          enderecoPai: "Não informado",
          rgPai: "00.000.000-0",
          profissaoPai: "Não informado",
          numeroCasaPai: "0",
          alunoId,
        });
      }

      await api.post("/observacoes", {
        matriculaTipo,
        escola,
        temIrmaos: temIrmaos,
        irmaosNome: temIrmaos === "sim" ? irmaosNome : null,
        temEspecialista: temEspecialista,
        especialista: temEspecialista === "sim" ? especialista : null,
        temAlergias: temAlergias,
        alergia: temAlergias === "sim" ? alergia : null,
        temMedicamento: temMedicamento,
        medicamento: temMedicamento === "sim" ? medicamento : null,
        reside: formData.reside,
        respNome: formData.respNome,
        respCpf: formData.respCpf,
        respTelefone: formData.respTelefone,
        pessoasAutorizadas: formData.pessoasAutorizadas,
        alunoId,
      });

      showModal("✅ Sucesso", "Cadastro completo realizado!", [
        {
          text: "OK",
          onPress: () => {
            setModalVisible(false);
            clearStore();
            router.push("/");
          },
        },
      ]);
    } catch (error) {
      let errorMessage = "Erro no cadastro:";
      if (isAxiosError(error)) {
        errorMessage += `\n${error.response?.data?.message || error.message}`;
      }
      showModal("⛔ Erro", errorMessage, [
        { text: "OK", style: "cancel", onPress: () => setModalVisible(false) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    showModal(
      "🔒 Política de Coleta de Dados",
      `Por questões de segurança, conformidade legal e bem-estar dos alunos, a escola necessita dos seguintes dados:

        • Identificação completa do aluno para registros acadêmicos
        • Dados dos pais/responsáveis para comunicação e autorizações
        • Informações médicas para atendimento emergencial
        • Histórico escolar para adequação pedagógica
        • Contatos atualizados para situações de emergência

Estes dados são protegidos conforme a LGPD e usados exclusivamente para fins educacionais.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setModalVisible(false),
        },
        {
          text: "Confirmar",
          onPress: () => {
            setModalVisible(false);
            submitData();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Observações</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Matrícula</Text>
              <CustomPicker
                items={[
                  { label: "Inicial", value: "inicial" },
                  {
                    label: "Transferência Municipal/Estadual",
                    value: "transferencia_municipal_estadual",
                  },
                  {
                    label: "Transferência Particular",
                    value: "transferencia_particular",
                  },
                ]}
                selectedValue={matriculaTipo}
                onValueChange={setMatriculaTipo}
                placeholder="Selecione o tipo de matrícula"
              />
              {!matriculaTipo && (
                <Text style={styles.errorText}>
                  Selecione o tipo de matrícula
                </Text>
              )}
            </View>

            {(matriculaTipo === "transferencia_municipal_estadual" ||
              matriculaTipo === "transferencia_particular") && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da Escola Anterior</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome da escola"
                  placeholderTextColor="#666"
                  value={escola}
                  onChangeText={setEscola}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Possui Irmãos?</Text>
              <CustomPicker
                items={[
                  { label: "Sim", value: "sim" },
                  { label: "Não", value: "não" },
                ]}
                selectedValue={temIrmaos}
                onValueChange={setTemIrmaos}
                placeholder="Selecione uma opção"
              />
              {!temIrmaos && (
                <Text style={styles.errorText}>Selecione uma opção</Text>
              )}
            </View>

            {temIrmaos === "sim" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nomes dos Irmãos</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Separe por vírgulas"
                  placeholderTextColor="#666"
                  value={irmaosNome}
                  onChangeText={setIrmaosNome}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Acompanhamento Especializado</Text>
              <CustomPicker
                items={[
                  { label: "Sim", value: "sim" },
                  { label: "Não", value: "não" },
                ]}
                selectedValue={temEspecialista}
                onValueChange={setTemEspecialista}
                placeholder="Selecione uma opção"
              />
              {!temEspecialista && (
                <Text style={styles.errorText}>Selecione uma opção</Text>
              )}
            </View>

            {temEspecialista === "sim" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Acompanhamento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Descreva o acompanhamento"
                  placeholderTextColor="#666"
                  value={especialista}
                  onChangeText={setEspecialista}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Possui Alergias?</Text>
              <CustomPicker
                items={[
                  { label: "Sim", value: "sim" },
                  { label: "Não", value: "não" },
                ]}
                selectedValue={temAlergias}
                onValueChange={setTemAlergias}
                placeholder="Selecione uma opção"
              />
              {!temAlergias && (
                <Text style={styles.errorText}>Selecione uma opção</Text>
              )}
            </View>

            {temAlergias === "sim" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição das Alergias</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Descreva as alergias"
                  placeholderTextColor="#666"
                  value={alergia}
                  onChangeText={setAlergia}
                  multiline
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Uso de Medicamentos</Text>
              <CustomPicker
                items={[
                  { label: "Sim", value: "sim" },
                  { label: "Não", value: "não" },
                ]}
                selectedValue={temMedicamento}
                onValueChange={setTemMedicamento}
                placeholder="Selecione uma opção"
              />
              {!temMedicamento && (
                <Text style={styles.errorText}>Selecione uma opção</Text>
              )}
            </View>

            {temMedicamento === "sim" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medicamentos em Uso</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Liste os medicamentos"
                  placeholderTextColor="#666"
                  value={medicamento}
                  onChangeText={setMedicamento}
                  multiline
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleNextStep}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Próximo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/forms-paterno")}
              style={styles.backButton}
            >
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
                placeholderTextColor="#000"
                value={formData.reside}
                onChangeText={(v) => handleChange("reside", v)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responsável Financeiro</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome Completo"
                placeholderTextColor="#000"
                value={formData.respNome}
                onChangeText={(v) => handleChange("respNome", v)}
              />
              <Text style={styles.label}>CPF do Responsável</Text>
              <MaskInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#000"
                value={formData.respCpf}
                onChangeText={(v) => handleChange("respCpf", v)}
                mask={cpfMask}
                keyboardType="number-pad"
              />
              <Text style={styles.label}>Telefone</Text>
              <MaskInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#000"
                value={formData.respTelefone}
                onChangeText={(v) => handleChange("respTelefone", v)}
                mask={telefoneMask}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pessoas Autorizados para Buscar</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Nome completo separado por vírgulas"
                placeholderTextColor="#000"
                value={formData.pessoasAutorizadas}
                onChangeText={(v) => handleChange("pessoasAutorizadas", v)}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Finalizar Cadastro</Text>
              )}
            </TouchableOpacity>

            <View style={styles.obsContainer}>
              <Text style={styles.obsTitle}>OBSERVAÇÕES IMPORTANTES:</Text>
              <Text style={styles.obsText}>
                ✓ Só clique em &quot;Enviar Documentos&quot; se for enviar por
                e-mail{"\n"}✗ Se for entregar pessoalmente ou já entregou, não
                clique!{"\n"}☑ Clique apenas se a escola solicitar envio digital
              </Text>

              <TouchableOpacity
                style={styles.emailButton}
                onPress={handleEmail}
              >
                <Text style={styles.emailButtonText}>Enviar Documentos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadTerms}
            >
              <FontAwesome name="file-pdf-o" size={18} color="white" />
              <Text style={styles.downloadButtonText}>
                Baixar Termos Escolares
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setStep(1)}
            >
              <Text style={styles.buttonText}>Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/")}
              style={styles.backButton}
            >
              <Text style={styles.backLink}>Voltar à Página Principal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Render the CustomModal */}
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  stepContainer: {
    gap: 20,
  },
  sectionTitle: {
    color: "#902121",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 12,
  },
  label: {
    color: "#444",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#000",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  button: {
    backgroundColor: "#8B0000",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: "#902121",
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  backLink: {
    color: "#902121",
    fontSize: 14,
    fontWeight: "500",
  },
  obsContainer: {
    backgroundColor: "#fff8e1",
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ffe082",
    gap: 12,
  },
  obsTitle: {
    color: "#902121",
    fontSize: 16,
    fontWeight: "600",
  },
  obsText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  emailButton: {
    backgroundColor: "#8B0000",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  emailButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  downloadButton: {
    backgroundColor: "#8B0000",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  downloadButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    width: "80%", // Responsive width
    maxWidth: 400, // Max width for larger screens
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12, // Space between buttons
  },
  button: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#8B0000", // Primary button color
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#8B0000", // Border for cancel button
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelText: {
    color: "#8B0000", // Text color for cancel button
  },
});

export default FormularioCompleto;
