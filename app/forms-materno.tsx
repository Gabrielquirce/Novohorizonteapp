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
  Pressable // Import Pressable for CustomModal buttons
} from "react-native";
import MaskInput from "react-native-mask-input";
import useFormStore from "./Store/useFormStore";

// Define the type for form fields
type FormField = keyof typeof initialFormState;

// Initial state for the form data
const initialFormState = {
  nomeMae: "",
  cepMae: "",
  telefoneMae: "",
  trabalhoMae: "",
  nascimentoMae: "",
  cpfMae: "",
  emailMae: "",
  telefoneTrabalhoMae: "",
  enderecoMae: "",
  rgMae: "",
  profissaoMae: "",
  numeroCasaMae: "",
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
  buttons
}: {
  visible: boolean;
  title: string;
  message: string;
  buttons: { text: string; onPress: () => void; style?: 'default' | 'cancel' }[];
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
                  button.style === 'cancel' && modalStyles.cancelButton
                ]}
                onPress={button.onPress}
                accessibilityLabel={`Botão: ${button.text}`}
              >
                <Text style={[
                  modalStyles.textStyle,
                  button.style === 'cancel' && modalStyles.cancelText
                ]}>
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


export default function FamiliaresMaternoScreen() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<FormField, string>>(
    {} as Record<FormField, string>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResponsavelMaterno, setHasResponsavelMaterno] = useState(false);

  // States for modal control
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel'
  }[]>([]);

  // Refs for all input fields
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

  // Ref for ScrollView
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
    buttons: { text: string; onPress: () => void; style?: 'default' | 'cancel' }[]
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  /**
   * Validates a single form field with debounce.
   * Ensures validations are not triggered too frequently while typing.
   * @param {FormField} field - The name of the field to validate.
   * @param {string} value - The current value of the field.
   */
  const validateField = useCallback(
    (() => {
      const debounced = debounce((field: FormField, value: string) => {
        setErrors((prev) => {
          const newErrors = { ...prev };
          // If responsible is not active, skip validation
          if (!hasResponsavelMaterno) return newErrors;

          // Clear error if value is not empty
          if (value.trim().length > 0) {
            delete newErrors[field];
          }

          // Specific field validations
          switch (field) {
            case "cpfMae":
              if (value.replace(/\D/g, "").length !== 11) {
                newErrors[field] = "CPF inválido";
              }
              break;

            case "cepMae":
              if (value.replace(/\D/g, "").length !== 8) {
                newErrors[field] = "CEP inválido";
              }
              break;

            case "nascimentoMae":
              // Basic date format validation (DD/MM/AAAA)
              if (
                !/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(
                  value
                )
              ) {
                newErrors[field] = "Data inválida";
              }
              break;

            case "rgMae":
              if (value.replace(/\D/g, "").length !== 9) {
                newErrors[field] = "RG inválido";
              }
              break;

            case "emailMae":
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[field] = "E-mail inválido";
              }
              break;

            default:
              // General required field validation: remove 'enderecoMae' from optional exclusions
              // as it is treated as required in handleSubmit's validateMaeFields and missingFields array.
              if (
                !value.trim() &&
                field !== "trabalhoMae" && // Optional
                field !== "telefoneTrabalhoMae" && // Optional
                field !== "profissaoMae" // Optional
              ) {
                newErrors[field] = "Campo obrigatório";
              }
          }

          return newErrors;
        });
      }, 300);
      // Attach flush method for immediate execution when needed
      (debounced as any).flush = debounced.flush;
      return debounced;
    })(),
    [hasResponsavelMaterno] // Re-create if hasResponsavelMaterno changes
  );

  /**
   * Handles changes to form input fields.
   * Updates formData and triggers field validation.
   * @param {FormField} field - The name of the field being changed.
   * @param {string} value - The new value of the field.
   */
  const handleChange = useCallback(
    (field: FormField, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    [validateField]
  );

  /**
   * Toggles the state of hasResponsavelMaterno.
   * Clears form data and errors if disabled.
   * Focuses on the first field if enabled.
   */
  const toggleResponsavelMaterno = () => {
    const newState = !hasResponsavelMaterno;
    setHasResponsavelMaterno(newState);

    if (!newState) {
      // Clear all fields and errors if the toggle is off
      setFormData(initialFormState);
      setErrors({} as Record<FormField, string>);
      // Also clear the stored data if no responsible is selected
      useFormStore.getState().setMae(initialFormState);
    } else {
      // Focus on the first field when activated
      setTimeout(() => nomeRef.current?.focus(), 100);
    }
  };

  /**
   * Handles the form submission logic.
   * Validates all required fields and displays appropriate modals for errors or success.
   */
  const handleSubmit = useCallback(async () => {
    /**
     * Internal helper to validate all required fields for the mother.
     * @returns {boolean} True if all required fields are filled, false otherwise.
     */
    const validateMaeFields = () => {
      // If responsible is not selected, no fields are required for this section
      if (!hasResponsavelMaterno) return true;

      // Define required fields for the maternal responsible
      const requiredFields: FormField[] = [
        "nomeMae",
        "cepMae",
        "telefoneMae",
        "nascimentoMae",
        "cpfMae",
        "emailMae",
        "enderecoMae", // This is consistently treated as required
        "rgMae",
        "numeroCasaMae",
      ];

      return requiredFields.every(
        (field) => formData[field] && formData[field].trim().length > 0
      );
    };

    setIsSubmitting(true); // Indicate submission is in progress
    validateField.flush(); // Force any pending debounced validations to run immediately

    // If no maternal responsible, skip validation and navigate
    if (!hasResponsavelMaterno) {
      router.push("/forms-paterno");
      setIsSubmitting(false);
      return;
    }

    // Check overall form validity (required fields filled and no validation errors)
    const isValid = validateMaeFields() && Object.keys(errors).length === 0;

    if (!isValid) {
      // Identify missing required fields
      const missingFields = [
        !formData.nomeMae && "Nome Completo",
        !formData.cepMae && "CEP",
        !formData.telefoneMae && "Telefone",
        !formData.nascimentoMae && "Data de Nascimento",
        !formData.cpfMae && "CPF",
        !formData.emailMae && "E-mail",
        !formData.enderecoMae && "Endereço",
        !formData.rgMae && "RG",
        !formData.numeroCasaMae && "Número da Casa",
      ].filter(Boolean); // Filter out false/null values

      if (missingFields.length > 0) {
        // Show modal for missing fields
        showModal(
          "🚨 Campos Obrigatórios",
          `Para continuar, preencha os seguintes campos:\n\n• ${missingFields.join(
            "\n• "
          )}\n\nPor favor, verifique os dados!`,
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
                setIsSubmitting(false); // Re-enable button on cancel
              },
            },
          ]
        );
      } else if (Object.keys(errors).length > 0) {
        // Show modal for validation errors (e.g., invalid CPF format)
        showModal(
          "❌ Erro de Validação",
          "Corrija os campos destacados em vermelho antes de continuar",
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

      // Important: Stop submission if validation fails
      return;
    }

    // If validation passes, attempt to save data and navigate
    try {
      useFormStore.getState().setMae(formData); // Save data to global store
      router.push("/forms-paterno"); // Navigate to next screen
    } catch (error) {
      console.error("Erro:", error); // Log the error for debugging
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
      setIsSubmitting(false); // Ensure button is re-enabled after attempt
    }
  }, [validateField, hasResponsavelMaterno, errors, formData]);

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
              hasResponsavelMaterno && styles.toggleActive,
            ]}
            onPress={toggleResponsavelMaterno}
            accessibilityLabel="Possui responsável materno"
            accessibilityHint="Ative para preencher dados do responsável materno"
          >
            <Text style={styles.toggleText}>
              {hasResponsavelMaterno ? "✓" : ""}
            </Text>
          </TouchableOpacity>
          <Text style={styles.toggleLabel}>Possui Responsável Materno</Text>
        </View>

        {/* Form fields, disabled if hasResponsavelMaterno is false */}
        <View
          style={[styles.form, !hasResponsavelMaterno && styles.formDisabled]}
        >
          <Text style={styles.sectionTitle}>Dados do Responsável Materno</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            ref={nomeRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="Joana Silva"
            placeholderTextColor="#666"
            value={formData.nomeMae}
            onChangeText={(v) => handleChange("nomeMae", v)}
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => cepRef.current?.focus()}
            // Removed onFocus to avoid ref.measureLayout error, as per previous code's comment
            accessibilityLabel="Campo para nome da mãe"
            accessibilityHint="Digite o nome completo da mãe"
          />
          {errors.nomeMae && (
            <Text style={styles.errorText}>{errors.nomeMae}</Text>
          )}

          <Text style={styles.label}>CEP</Text>
          <MaskInput
            ref={cepRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="00000-000"
            placeholderTextColor="#666"
            value={formData.cepMae}
            onChangeText={(v) => handleChange("cepMae", v)}
            mask={cepMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => telefoneRef.current?.focus()}
            accessibilityLabel="Campo para CEP"
            accessibilityHint="Digite o CEP da mãe"
          />
          {errors.cepMae && (
            <Text style={styles.errorText}>{errors.cepMae}</Text>
          )}

          <Text style={styles.label}>Telefone</Text>
          <MaskInput
            ref={telefoneRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            value={formData.telefoneMae}
            onChangeText={(v) => handleChange("telefoneMae", v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => trabalhoRef.current?.focus()}
            accessibilityLabel="Campo para telefone da mãe"
            accessibilityHint="Digite o telefone da mãe"
          />
          {errors.telefoneMae && (
            <Text style={styles.errorText}>{errors.telefoneMae}</Text>
          )}

          <Text style={styles.label}>Local de Trabalho</Text>
          <TextInput
            ref={trabalhoRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="Empresa XYZ"
            placeholderTextColor="#666"
            value={formData.trabalhoMae}
            onChangeText={(v) => handleChange("trabalhoMae", v)}
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => nascimentoRef.current?.focus()}
            accessibilityLabel="Campo para local de trabalho da mãe"
            accessibilityHint="Digite o local de trabalho da mãe"
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskInput
            ref={nascimentoRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="00/00/0000"
            placeholderTextColor="#666"
            value={formData.nascimentoMae}
            onChangeText={(v) => handleChange("nascimentoMae", v)}
            mask={dataMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => cpfRef.current?.focus()}
            accessibilityLabel="Campo para data de nascimento da mãe"
            accessibilityHint="Digite a data de nascimento da mãe"
          />
          {errors.nascimentoMae && (
            <Text style={styles.errorText}>{errors.nascimentoMae}</Text>
          )}

          <Text style={styles.label}>CPF</Text>
          <MaskInput
            ref={cpfRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="000.000.000-00"
            placeholderTextColor="#666"
            value={formData.cpfMae}
            onChangeText={(v) => handleChange("cpfMae", v)}
            mask={cpfMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            accessibilityLabel="Campo para CPF da mãe"
            accessibilityHint="Digite o CPF da mãe"
          />
          {errors.cpfMae && (
            <Text style={styles.errorText}>{errors.cpfMae}</Text>
          )}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            ref={emailRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="joana@email.com"
            placeholderTextColor="#666"
            value={formData.emailMae}
            onChangeText={(v) => handleChange("emailMae", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => telTrabalhoRef.current?.focus()}
            accessibilityLabel="Campo para e-mail da mãe"
            accessibilityHint="Digite o e-mail da mãe"
          />
          {errors.emailMae && (
            <Text style={styles.errorText}>{errors.emailMae}</Text>
          )}

          <Text style={styles.label}>Telefone do Trabalho</Text>
          <MaskInput
            ref={telTrabalhoRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            value={formData.telefoneTrabalhoMae}
            onChangeText={(v) => handleChange("telefoneTrabalhoMae", v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => enderecoRef.current?.focus()}
            accessibilityLabel="Campo para telefone do trabalho da mãe"
            accessibilityHint="Digite o telefone do trabalho da mãe"
          />
          {errors.telefoneTrabalhoMae && (
            <Text style={styles.errorText}>{errors.telefoneTrabalhoMae}</Text>
          )}

          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            ref={enderecoRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="Rua Exemplo, 123"
            placeholderTextColor="#666"
            value={formData.enderecoMae}
            onChangeText={(v) => handleChange("enderecoMae", v)}
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => numeroRef.current?.focus()}
            accessibilityLabel="Campo para endereço da mãe"
            accessibilityHint="Digite o endereço da mãe"
          />

          <Text style={styles.label}>Número da Casa</Text>
          <TextInput
            ref={numeroRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="123"
            placeholderTextColor="#666"
            value={formData.numeroCasaMae}
            onChangeText={(v) => handleChange("numeroCasaMae", v)}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => rgRef.current?.focus()}
            accessibilityLabel="Campo para número da casa da mãe"
            accessibilityHint="Digite o número da casa da mãe"
          />
          {errors.numeroCasaMae && (
            <Text style={styles.errorText}>{errors.numeroCasaMae}</Text>
          )}

          <Text style={styles.label}>RG</Text>
          <MaskInput
            ref={rgRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="00.000.000-0"
            placeholderTextColor="#666"
            value={formData.rgMae}
            onChangeText={(v) => handleChange("rgMae", v)}
            mask={rgMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => profissaoRef.current?.focus()}
            accessibilityLabel="Campo para RG da mãe"
            accessibilityHint="Digite o RG da mãe"
          />
          {errors.rgMae && <Text style={styles.errorText}>{errors.rgMae}</Text>}

          <Text style={styles.label}>Profissão</Text>
          <TextInput
            ref={profissaoRef}
            style={[
              styles.input,
              !hasResponsavelMaterno && styles.disabledInput,
            ]}
            placeholder="Engenheira"
            placeholderTextColor="#666"
            value={formData.profissaoMae}
            onChangeText={(v) => handleChange("profissaoMae", v)}
            editable={hasResponsavelMaterno}
            returnKeyType="done"
            accessibilityLabel="Campo para profissão da mãe"
            accessibilityHint="Digite a profissão da mãe"
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
          onPress={() => router.push("/forms-aluno")}
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
    marginBottom: 16,
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
    marginBottom: 8,
    color: "#000",
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
    marginTop: 8,
    alignItems: "center",
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    width: '80%', // Responsive width
    maxWidth: 400, // Max width for larger screens
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12, // Space between buttons
  },
  button: {
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8B0000', // Primary button color
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B0000', // Border for cancel button
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelText: {
    color: '#8B0000', // Text color for cancel button
  },
});
