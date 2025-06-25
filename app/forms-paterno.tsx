import { router } from "expo-router";
import { debounce } from "lodash";
import React, { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal, // Import Modal for CustomModal
  Pressable, // Import Pressable for CustomModal buttons
} from "react-native";
import MaskInput from "react-native-mask-input";
import useFormStore from "./Store/useFormStore";

// Define the type for form fields
type FormField = keyof typeof initialFormState;

// Initial state for the form data
const initialFormState = {
  nomePai: "",
  cepPai: "",
  telefonePai: "",
  trabalhoPai: "",
  nascimentoPai: "",
  cpfPai: "",
  emailPai: "",
  telefoneTrabalhoPai: "",
  enderecoPai: "",
  rgPai: "",
  profissaoPai: "",
  numeroCasaPai: "",
};

// Masks for input fields
const cepMask = [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/];
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
const dataMask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];

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

export default function FamiliaresPaternoScreen() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<FormField, string>>(
    {} as Record<FormField, string>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResponsavelPaterno, setHasResponsavelPaterno] = useState(false);

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

  // Refs para todos os campos
  const nomeRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const telefoneRef = useRef<TextInput>(null);
  const trabalhoRef = useRef<TextInput>(null);
  const nascimentoRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const telTrabalhoRef = useRef<TextInput>(null);
  const enderecoRef = useRef<TextInput>(null);
  const numeroRef = useRef<TextInput>(null);
  const rgRef = useRef<TextInput>(null);
  const profissaoRef = useRef<TextInput>(null);

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

  const validateField = useCallback(
    (() => {
      const debounced = debounce((field: FormField, value: string) => {
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (!hasResponsavelPaterno) return newErrors;

          if (value.trim().length > 0) {
            delete newErrors[field];
          }

          switch (field) {
            case "cpfPai":
              if (value.replace(/\D/g, "").length !== 11) {
                newErrors[field] = "CPF inválido";
              }
              break;

            case "cepPai":
              if (value.replace(/\D/g, "").length !== 8) {
                newErrors[field] = "CEP inválido";
              }
              break;

            case "nascimentoPai":
              if (
                !/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(
                  value
                )
              ) {
                newErrors[field] = "Data inválida";
              }
              break;

            case "rgPai":
              if (value.replace(/\D/g, "").length !== 9) {
                newErrors[field] = "RG inválido";
              }
              break;

            case "emailPai":
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[field] = "E-mail inválido";
              }
              break;

            default:
              if (
                !value.trim() &&
                field !== "trabalhoPai" &&
                field !== "telefoneTrabalhoPai" &&
                field !== "profissaoPai"
              ) {
                newErrors[field] = "Campo obrigatório";
              }
          }

          return newErrors;
        });
      }, 300);
      (debounced as any).flush = debounced.flush;
      return debounced;
    })(),
    [hasResponsavelPaterno]
  );

  const handleChange = useCallback(
    (field: FormField, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    [validateField]
  );

  const toggleResponsavelPaterno = () => {
    const newState = !hasResponsavelPaterno;
    setHasResponsavelPaterno(newState);

    if (!newState) {
      setFormData(initialFormState);
      setErrors({} as Record<FormField, string>);
      useFormStore.getState().setPai(initialFormState);
    } else {
      setTimeout(() => nomeRef.current?.focus(), 100);
    }
  };

  const validatePaiFields = useCallback(() => {
    if (!hasResponsavelPaterno) return true;

    const requiredFields: FormField[] = [
      "nomePai",
      "cepPai",
      "telefonePai",
      "nascimentoPai",
      "cpfPai",
      "emailPai",
      "enderecoPai",
      "rgPai",
      "numeroCasaPai",
    ];

    return requiredFields.every(
      (field) => formData[field] && formData[field].trim().length > 0
    );
  }, [hasResponsavelPaterno, formData]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    validateField.flush();

    if (!hasResponsavelPaterno) {
      router.push("/forms-obs");
      setIsSubmitting(false);
      return;
    }

    const isValid = validatePaiFields() && Object.keys(errors).length === 0;

    if (!isValid) {
      const missingFields = [
        !formData.nomePai && "Nome Completo",
        !formData.cepPai && "CEP",
        !formData.telefonePai && "Telefone",
        !formData.nascimentoPai && "Data de Nascimento",
        !formData.cpfPai && "CPF",
        !formData.emailPai && "E-mail",
        !formData.enderecoPai && "Endereço",
        !formData.rgPai && "RG",
        !formData.numeroCasaPai && "Número da Casa",
      ].filter(Boolean);

      if (missingFields.length > 0) {
        showModal(
          "🚨 Campos Obrigatórios",
          `Para continuar, preencha os seguintes campos:\n\n• ${missingFields.join(
            "\n• "
          )}\n\nVerifique os dados cuidadosamente!`,
          [
            {
              text: "Preencher Agora",
              style: "default",
              onPress: () => {
                setModalVisible(false);
                setIsSubmitting(false);
              },
            },
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => {
                setModalVisible(false);
                setIsSubmitting(false);
              },
            },
          ]
        );
      } else if (Object.keys(errors).length > 0) {
        showModal(
          "❌ Erro de Validação",
          "Corrija os campos destacados em vermelho antes de prosseguir",
          [
            {
              text: "Entendi",
              style: "cancel",
              onPress: () => {
                setModalVisible(false);
                setIsSubmitting(false);
              },
            },
          ]
        );
      }

      return; // Ensure return after showing modal
    }

    try {
      useFormStore.getState().setPai(formData);
      router.push("/forms-obs");
    } catch (error) {
      console.error("Erro:", error);
      showModal(
        "⛔ Erro",
        "Ocorreu um erro ao tentar avançar para a próxima tela",
        [
          {
            text: "OK",
            style: "cancel",
            onPress: () => {
              setModalVisible(false);
              setIsSubmitting(false);
            },
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateField,
    hasResponsavelPaterno,
    validatePaiFields,
    errors,
    formData,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dados dos Familiares</Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              hasResponsavelPaterno && styles.toggleActive,
            ]}
            onPress={toggleResponsavelPaterno}
            accessibilityLabel="Possui responsável paterno"
            accessibilityHint="Ative para preencher dados do responsável paterno"
          >
            <Text style={styles.toggleText}>
              {hasResponsavelPaterno ? "✓" : ""}
            </Text>
          </TouchableOpacity>
          <Text style={styles.toggleLabel}>Possui Responsável Paterno</Text>
        </View>

        <View
          style={[styles.form, !hasResponsavelPaterno && styles.formDisabled]}
        >
          <Text style={styles.sectionTitle}>Dados do Responsável Paterno</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            ref={nomeRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="Carlos Silva"
            placeholderTextColor="#666"
            value={formData.nomePai}
            onChangeText={(v) => handleChange("nomePai", v)}
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => cepRef.current?.focus()}
            accessibilityLabel="Campo para nome do pai"
            accessibilityHint="Digite o nome completo do pai"
          />
          {errors.nomePai && (
            <Text style={styles.errorText}>{errors.nomePai}</Text>
          )}

          <Text style={styles.label}>CEP</Text>
          <MaskInput
            ref={cepRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="00000-000"
            placeholderTextColor="#666"
            value={formData.cepPai}
            onChangeText={(v) => handleChange("cepPai", v)}
            mask={cepMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => telefoneRef.current?.focus()}
            accessibilityLabel="Campo para CEP"
            accessibilityHint="Digite o CEP do pai"
          />
          {errors.cepPai && (
            <Text style={styles.errorText}>{errors.cepPai}</Text>
          )}

          <Text style={styles.label}>Telefone</Text>
          <MaskInput
            ref={telefoneRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            value={formData.telefonePai}
            onChangeText={(v) => handleChange("telefonePai", v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => trabalhoRef.current?.focus()}
            accessibilityLabel="Campo para telefone do pai"
            accessibilityHint="Digite o telefone do pai"
          />
          {errors.telefonePai && (
            <Text style={styles.errorText}>{errors.telefonePai}</Text>
          )}

          <Text style={styles.label}>Local de Trabalho</Text>
          <TextInput
            ref={trabalhoRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="Empresa ABC"
            placeholderTextColor="#666"
            value={formData.trabalhoPai}
            onChangeText={(v) => handleChange("trabalhoPai", v)}
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => nascimentoRef.current?.focus()}
            accessibilityLabel="Campo para local de trabalho do pai"
            accessibilityHint="Digite o local de trabalho do pai"
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskInput
            ref={nascimentoRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="00/00/0000"
            placeholderTextColor="#666"
            value={formData.nascimentoPai}
            onChangeText={(v) => handleChange("nascimentoPai", v)}
            mask={dataMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => cpfRef.current?.focus()}
            accessibilityLabel="Campo para data de nascimento do pai"
            accessibilityHint="Digite a data de nascimento do pai"
          />
          {errors.nascimentoPai && (
            <Text style={styles.errorText}>{errors.nascimentoPai}</Text>
          )}

          <Text style={styles.label}>CPF</Text>
          <MaskInput
            ref={cpfRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="000.000.000-00"
            placeholderTextColor="#666"
            value={formData.cpfPai}
            onChangeText={(v) => handleChange("cpfPai", v)}
            mask={cpfMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            accessibilityLabel="Campo para CPF do pai"
            accessibilityHint="Digite o CPF do pai"
          />
          {errors.cpfPai && (
            <Text style={styles.errorText}>{errors.cpfPai}</Text>
          )}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            ref={emailRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="carlos@email.com"
            placeholderTextColor="#666"
            value={formData.emailPai}
            onChangeText={(v) => handleChange("emailPai", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => telTrabalhoRef.current?.focus()}
            accessibilityLabel="Campo para e-mail do pai"
            accessibilityHint="Digite o e-mail do pai"
          />
          {errors.emailPai && (
            <Text style={styles.errorText}>{errors.emailPai}</Text>
          )}

          <Text style={styles.label}>Telefone do Trabalho</Text>
          <MaskInput
            ref={telTrabalhoRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            value={formData.telefoneTrabalhoPai}
            onChangeText={(v) => handleChange("telefoneTrabalhoPai", v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => enderecoRef.current?.focus()}
            accessibilityLabel="Campo para telefone do trabalho do pai"
            accessibilityHint="Digite o telefone do trabalho do pai"
          />
          {errors.telefoneTrabalhoPai && (
            <Text style={styles.errorText}>{errors.telefoneTrabalhoPai}</Text>
          )}

          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            ref={enderecoRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="Avenida Principal, 456"
            placeholderTextColor="#666"
            value={formData.enderecoPai}
            onChangeText={(v) => handleChange("enderecoPai", v)}
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => numeroRef.current?.focus()}
            accessibilityLabel="Campo para endereço do pai"
            accessibilityHint="Digite o endereço do pai"
          />

          <Text style={styles.label}>Número da Casa</Text>
          <TextInput
            ref={numeroRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="123"
            placeholderTextColor="#666"
            value={formData.numeroCasaPai}
            onChangeText={(v) => handleChange("numeroCasaPai", v)}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => rgRef.current?.focus()}
            accessibilityLabel="Campo para número da casa do pai"
            accessibilityHint="Digite o número da casa do pai"
          />
          {errors.numeroCasaPai && (
            <Text style={styles.errorText}>{errors.numeroCasaPai}</Text>
          )}

          <Text style={styles.label}>RG</Text>
          <MaskInput
            ref={rgRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="00.000.000-0"
            placeholderTextColor="#666"
            value={formData.rgPai}
            onChangeText={(v) => handleChange("rgPai", v)}
            mask={rgMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
            returnKeyType="next"
            onSubmitEditing={() => profissaoRef.current?.focus()}
            accessibilityLabel="Campo para RG do pai"
            accessibilityHint="Digite o RG do pai"
          />
          {errors.rgPai && <Text style={styles.errorText}>{errors.rgPai}</Text>}

          <Text style={styles.label}>Profissão</Text>
          <TextInput
            ref={profissaoRef}
            style={[
              styles.input,
              !hasResponsavelPaterno && styles.disabledInput,
            ]}
            placeholder="Engenheiro"
            placeholderTextColor="#666"
            value={formData.profissaoPai}
            onChangeText={(v) => handleChange("profissaoPai", v)}
            editable={hasResponsavelPaterno}
            returnKeyType="done"
            accessibilityLabel="Campo para profissão do pai"
            accessibilityHint="Digite a profissão do pai"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityLabel="Próximo passo"
          accessibilityHint="Avançar para o próximo formulário"
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Validando..." : "Próximo"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/forms-materno")}
          style={styles.backButton}
          accessibilityLabel="Voltar"
          accessibilityHint="Voltar para tela anterior"
        >
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    backgroundColor: "#902121",
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#8B0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toggleActive: {
    backgroundColor: "#8B0000",
  },
  toggleText: {
    color: "white",
    fontWeight: "bold",
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    gap: 12,
  },
  formDisabled: {
    opacity: 0.6,
  },
  sectionTitle: {
    color: "#902121",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#000",
    marginBottom: 8,
  },
  disabledInput: {
    backgroundColor: "#f9f9f9",
    color: "#666",
  },
  button: {
    backgroundColor: "#8B0000",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    position: 'relative',
    marginTop: 20,
    bottom: 15,
    padding: 5,
  },
  backLink: {
    color: "#902121",
    textAlign: "center",
    marginTop: 16,
    fontSize: 18,
    opacity: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
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
