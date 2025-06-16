import { router } from "expo-router";
import { debounce } from "lodash";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaskInput from "react-native-mask-input";
import useFormStore from "./Store/useFormStore";
import CustomPicker from "./components/CustomPicker";

type FormField = keyof typeof initialFormState;

const initialFormState = {
  nome: "",
  dataNascimento: "",
  naturalidade: "",
  nacionalidade: "",
  cpf: "",
  rg: "",
  termo: "",
  folha: "",
  livro: "",
  matricula: "",
  sexo: "",
  turno: "",
  tipoSanguineo: "",
  raca: "",
  anoLetivo: "",
};

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
const dataMask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
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
const requiredFields: FormField[] = [
  "nome",
  "dataNascimento",
  "cpf",
  "rg",
  "sexo",
  "turno",
  "tipoSanguineo",
  "raca",
  "anoLetivo",
];

const isValidDate = (dateString: string): boolean => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(dateString)) return false;

  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
};

export default function RegisterScreen() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<FormField, string>>(
    {} as Record<FormField, string>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs para todos os campos de texto
  const naturalidadeRef = useRef<TextInput>(null);
  const nacionalidadeRef = useRef<TextInput>(null);
  const termoRef = useRef<TextInput>(null);
  const folhaRef = useRef<TextInput>(null);
  const livroRef = useRef<TextInput>(null);
  const matriculaRef = useRef<TextInput>(null);
  const anoLetivoRef = useRef<TextInput>(null);

  // Ref para o ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  const validateField = useCallback(
    debounce((field: FormField, value: string) => {
      setErrors((prev) => {
        const newErrors = { ...prev };

        if (value.trim().length > 0) {
          delete newErrors[field];
        }

        switch (field) {
          case "cpf":
            if (value.replace(/\D/g, "").length !== 11) {
              newErrors[field] = "CPF inválido";
            }
            break;

          case "dataNascimento":
            if (!isValidDate(value)) {
              newErrors[field] = "Data inválida";
            }
            break;

          case "rg":
            if (value.replace(/\D/g, "").length !== 9) {
              newErrors[field] = "RG inválido";
            }
            break;

          case "sexo":
          case "turno":
          case "tipoSanguineo":
          case "raca":
            if (!value.trim()) {
              newErrors[field] = "Selecione uma opção";
            }
            break;

          default:
            if (!value.trim() && requiredFields.includes(field)) {
              newErrors[field] = "Campo obrigatório";
            }
        }

        return newErrors;
      });
    }, 300),
    []
  );

  const handleChange = useCallback(
    (field: FormField, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    [validateField]
  );

  const validateRequiredFields = useCallback(() => {
    return requiredFields.every(
      (field) => formData[field] && formData[field].trim().length > 0
    );
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    validateField.flush();

    const isValid =
      validateRequiredFields() && Object.keys(errors).length === 0;

    if (!isValid) {
      const missingFields = requiredFields
        .filter((field) => !formData[field]?.trim())
        .map((field) => {
          switch (field) {
            case "nome":
              return "Nome";
            case "dataNascimento":
              return "Data de Nascimento";
            case "cpf":
              return "CPF";
            case "rg":
              return "RG";
            case "sexo":
              return "Sexo";
            case "turno":
              return "Turno";
            case "tipoSanguineo":
              return "Tipo Sanguíneo";
            case "raca":
              return "Raça";
            case "anoLetivo":
              return "Ano Letivo";
            default:
              return "";
          }
        })
        .filter(Boolean);

      if (missingFields.length > 0) {
        Alert.alert(
          "🚨 Campos Obrigatórios",
          `Para continuar, preencha os seguintes campos:\n\n• ${missingFields.join(
            "\n• "
          )}\n\nVerifique os dados cuidadosamente!`,
          [
            {
              text: "Preencher Agora",
              style: "default",
            },
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => setIsSubmitting(false),
            },
          ]
        );
      } else if (Object.keys(errors).length > 0) {
        Alert.alert(
          "❌ Erro de Validação",
          "Corrija os campos destacados em vermelho antes de prosseguir",
          [
            {
              text: "Entendi",
              style: "cancel",
            },
          ]
        );
      }

      setIsSubmitting(false);
      return;
    }

    try {
      useFormStore.getState().setAluno(formData);
      router.push("/forms-materno");
    } catch (error) {
      Alert.alert("⛔ Erro", "Ocorreu um erro ao tentar avançar", [
        {
          text: "OK",
          style: "cancel",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }, [errors, formData, validateField, validateRequiredFields]);

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
          <Text style={styles.headerTitle}>Dados do Aluno</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#666"
            value={formData.nome}
            onChangeText={(v) => handleChange("nome", v)}
            importantForAutofill="yes"
            returnKeyType="next"
            onSubmitEditing={() => naturalidadeRef.current?.focus()}
            accessibilityLabel="Campo para nome completo"
            accessibilityHint="Digite o nome completo do aluno"
          />
          {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskInput
            style={styles.input}
            placeholder="Data de nascimento (DD/MM/AAAA)"
            placeholderTextColor="#666"
            value={formData.dataNascimento}
            onChangeText={(v) => handleChange("dataNascimento", v)}
            mask={dataMask}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => naturalidadeRef.current?.focus()}
            accessibilityLabel="Campo para data de nascimento"
            accessibilityHint="Digite a data de nascimento no formato DD/MM/AAAA"
          />
          {errors.dataNascimento && (
            <Text style={styles.errorText}>{errors.dataNascimento}</Text>
          )}

          <Text style={styles.label}>Naturalidade</Text>
          <TextInput
            ref={naturalidadeRef}
            style={styles.input}
            placeholder="Naturalidade"
            placeholderTextColor="#666"
            value={formData.naturalidade}
            onChangeText={(v) => handleChange("naturalidade", v)}
            returnKeyType="next"
            onSubmitEditing={() => nacionalidadeRef.current?.focus()}
            accessibilityLabel="Campo para naturalidade"
            accessibilityHint="Digite a naturalidade do aluno"
          />

          <Text style={styles.label}>Nacionalidade</Text>
          <TextInput
            ref={nacionalidadeRef}
            style={styles.input}
            placeholder="Nacionalidade"
            placeholderTextColor="#666"
            value={formData.nacionalidade}
            onChangeText={(v) => handleChange("nacionalidade", v)}
            returnKeyType="next"
            onSubmitEditing={() => termoRef.current?.focus()}
            accessibilityLabel="Campo para nacionalidade"
            accessibilityHint="Digite a nacionalidade do aluno"
          />

          <Text style={styles.label}>Sexo</Text>
          <CustomPicker
            items={[
              { label: "Masculino", value: "M" },
              { label: "Feminino", value: "F" },
              { label: "Não-binário", value: "Não-binário" },
              { label: "Outro", value: "Outro" },
              { label: "Prefiro não informar", value: "Prefiro não informar" },
            ]}
            selectedValue={formData.sexo}
            onValueChange={(v) => handleChange("sexo", v)}
            placeholder="Selecione o sexo"
          />
          {errors.sexo && <Text style={styles.errorText}>{errors.sexo}</Text>}

          <Text style={styles.label}>CPF</Text>
          <MaskInput
            style={styles.input}
            placeholder="CPF (000.000.000-00)"
            placeholderTextColor="#666"
            value={formData.cpf}
            onChangeText={(v) => handleChange("cpf", v)}
            mask={cpfMask}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => termoRef.current?.focus()}
            accessibilityLabel="Campo para CPF"
            accessibilityHint="Digite o CPF no formato 000.000.000-00"
          />
          {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

          <Text style={styles.label}>RG</Text>
          <MaskInput
            style={styles.input}
            placeholder="RG (00.000.000-0)"
            placeholderTextColor="#666"
            value={formData.rg}
            onChangeText={(v) => handleChange("rg", v)}
            mask={rgMask}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => termoRef.current?.focus()}
            accessibilityLabel="Campo para RG"
            accessibilityHint="Digite o RG no formato 00.000.000-0"
          />
          {errors.rg && <Text style={styles.errorText}>{errors.rg}</Text>}

          <Text style={styles.label}>Termo</Text>
          <TextInput
            ref={termoRef}
            style={styles.input}
            placeholder="Número do termo"
            placeholderTextColor="#666"
            value={formData.termo}
            onChangeText={(v) => handleChange("termo", v)}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => folhaRef.current?.focus()}
            accessibilityLabel="Campo para número do termo"
            accessibilityHint="Digite o número do termo"
          />

          <Text style={styles.label}>Folha</Text>
          <TextInput
            ref={folhaRef}
            style={styles.input}
            placeholder="Número da folha"
            placeholderTextColor="#666"
            value={formData.folha}
            onChangeText={(v) => handleChange("folha", v)}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => livroRef.current?.focus()}
            accessibilityLabel="Campo para número da folha"
            accessibilityHint="Digite o número da folha"
          />

          <Text style={styles.label}>Livro</Text>
          <TextInput
            ref={livroRef}
            style={styles.input}
            placeholder="Número do livro"
            placeholderTextColor="#666"
            value={formData.livro}
            onChangeText={(v) => handleChange("livro", v)}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => matriculaRef.current?.focus()}
            accessibilityLabel="Campo para número do livro"
            accessibilityHint="Digite o número do livro"
          />

          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            ref={matriculaRef}
            style={styles.input}
            placeholder="Número da matrícula"
            placeholderTextColor="#666"
            value={formData.matricula}
            onChangeText={(v) => handleChange("matricula", v)}
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => anoLetivoRef.current?.focus()}
            accessibilityLabel="Campo para número da matrícula"
            accessibilityHint="Digite o número da matrícula"
          />

          <Text style={styles.label}>Turno</Text>
          <CustomPicker
            items={[
              { label: "Manhã", value: "Manhã" },
              { label: "Tarde", value: "Tarde" },
              { label: "Integral", value: "Integral" },
            ]}
            selectedValue={formData.turno}
            onValueChange={(v) => handleChange("turno", v)}
            placeholder="Selecione o turno"
          />
          {errors.turno && <Text style={styles.errorText}>{errors.turno}</Text>}

          <Text style={styles.label}>Tipo Sanguíneo</Text>
          <CustomPicker
            items={[
              { label: "A+", value: "A+" },
              { label: "A-", value: "A-" },
              { label: "B+", value: "B+" },
              { label: "B-", value: "B-" },
              { label: "O+", value: "O+" },
              { label: "O-", value: "O-" },
              { label: "AB+", value: "AB+" },
              { label: "AB-", value: "AB-" },
            ]}
            selectedValue={formData.tipoSanguineo}
            onValueChange={(v) => handleChange("tipoSanguineo", v)}
            placeholder="Selecione o tipo sanguíneo"
          />
          {errors.tipoSanguineo && (
            <Text style={styles.errorText}>{errors.tipoSanguineo}</Text>
          )}

          <Text style={styles.label}>Raça/Cor</Text>
          <CustomPicker
            items={[
              { label: "Amarela", value: "Amarela" },
              { label: "Branca", value: "Branca" },
              { label: "Indígena", value: "Indígena" },
              { label: "Parda", value: "Parda" },
              { label: "Preta", value: "Preta" },
            ]}
            selectedValue={formData.raca}
            onValueChange={(v) => handleChange("raca", v)}
            placeholder="Selecione a raça/cor"
          />
          {errors.raca && <Text style={styles.errorText}>{errors.raca}</Text>}

          <Text style={styles.label}>Ano Letivo</Text>
          <TextInput
            ref={anoLetivoRef}
            style={styles.input}
            placeholder="Ano letivo atual"
            placeholderTextColor="#666"
            value={formData.anoLetivo}
            onChangeText={(v) => handleChange("anoLetivo", v)}
            keyboardType="number-pad"
            returnKeyType="done"
            accessibilityLabel="Campo para ano letivo"
            accessibilityHint="Digite o ano letivo atual"
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="Avançar para próxima etapa"
            accessibilityHint="Clique para enviar os dados e avançar"
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Validando..." : "Próximo"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.backButton}
            accessibilityLabel="Cancelar cadastro"
            accessibilityHint="Voltar para tela inicial"
          >
            <Text style={styles.backLink}>Cancelar e Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  form: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    gap: 16,
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
    marginTop: 4,
    marginBottom: 8,
  },
});
