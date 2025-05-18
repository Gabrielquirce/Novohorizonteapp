import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import useFormStore from './Store/useFormStore';
type FormField = keyof typeof initialFormState;

const initialFormState = {
  nome: '',
  dataNascimento: '',
  naturalidade: '',
  nacionalidade: '',
  cpf: '',
  rg: '',
  termo: '',
  folha: '',
  livro: '',
  matricula: '',
  sexo: '',
  turno: '',
  tipoSanguineo: '',
  raca: '',
  anoLetivo:'',
};

const racasOptions = [
  { label: 'Branca', value: 'branca' },
  { label: 'Parda', value: 'parda' },
  { label: 'Negra', value: 'negra' },
  { label: 'Indígena', value: 'indigena' },
  { label: 'Amarela', value: 'amarela' }
].sort((a, b) => a.label.localeCompare(b.label));

const cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
const dataMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
const rgMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/];

export default function RegisterScreen() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<FormField, string>>({} as Record<FormField, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useMemo(() => debounce((field: FormField, value: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };

      if (value.trim().length > 0) {
        delete newErrors[field];
      }

      switch(field) {
        case 'cpf':
          if (value.replace(/\D/g, '').length !== 11) {
            newErrors[field] = 'CPF inválido';
          }
          break;

        case 'dataNascimento':
          if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
            newErrors[field] = 'Data inválida';
          }
          break;

        case 'rg':
          if (value.replace(/\D/g, '').length !== 9) {
            newErrors[field] = 'RG inválido';
          }
          break;

        case 'sexo':
        case 'turno':
        case 'tipoSanguineo':
        case 'raca':
          if (!value.trim()) {
            newErrors[field] = 'Selecione uma opção';
          }
          break;

        default:
          if (!value.trim() && field !== 'naturalidade' && field !== 'nacionalidade') {
            newErrors[field] = 'Campo obrigatório';
          }
      }

      return newErrors;
    });
  }, 300), []);

  const handleChange = useCallback((field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    validateField.flush();
  
    if (Object.keys(errors).length === 0) {
      useFormStore.getState().setAluno(formData);
      router.push('/forms-materno');
    } else {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
    }
    
    setIsSubmitting(false);
  }, [errors, formData, validateField]);

  const renderPicker = useCallback(({
    field,
    items,
    placeholder
  }: {
    field: FormField,
    items: { label: string, value: string }[],
    placeholder: string
  }) => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={formData[field]}
        onValueChange={(v) => handleChange(field, v)}
        dropdownIconColor="#666"
        mode="dropdown"
        prompt={placeholder}
      >
        <Picker.Item label={placeholder} value="" />
        {items.map((item) => (
          <Picker.Item
            key={item.value}
            label={item.label}
            value={item.value}
          />
        ))}
      </Picker>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  ), [formData, errors, handleChange]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
    >
      <ScrollView
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
            placeholder=""
            value={formData.nome}
            onChangeText={(v) => handleChange('nome', v)}
            importantForAutofill="yes"
          />
          {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskInput
            style={styles.input}
            placeholder="00/00/0000"
            value={formData.dataNascimento}
            onChangeText={(v) => handleChange('dataNascimento', v)}
            mask={dataMask}
            keyboardType="number-pad"
          />
          {errors.dataNascimento && <Text style={styles.errorText}>{errors.dataNascimento}</Text>}

          <Text style={styles.label}>Naturalidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Teresopolitano"
            value={formData.naturalidade}
            onChangeText={(v) => handleChange('naturalidade', v)}
          />

          <Text style={styles.label}>Nacionalidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Brasileira"
            value={formData.nacionalidade}
            onChangeText={(v) => handleChange('nacionalidade', v)}
          />

          <Text style={styles.label}>Sexo</Text>
          {renderPicker({
            field: 'sexo',
            items: [
              { label: 'Masculino', value: 'M' },
              { label: 'Feminino', value: 'F' },
              { label: 'Não-binário', value: 'Não-binário' },
              { label: 'Outro', value: 'Outro' },
              { label: 'Prefiro não informar', value: 'Prefiro não informar' },
            ],
            placeholder: 'Selecione'
          })}

          <Text style={styles.label}>CPF</Text>
          <MaskInput
            style={styles.input}
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChangeText={(v) => handleChange('cpf', v)}
            mask={cpfMask}
            keyboardType="number-pad"
          />
          {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

          <Text style={styles.label}>RG</Text>
          <MaskInput
            style={styles.input}
            placeholder="00.000.000-0"
            value={formData.rg}
            onChangeText={(v) => handleChange('rg', v)}
            mask={rgMask}
            keyboardType="number-pad"
          />
          {errors.rg && <Text style={styles.errorText}>{errors.rg}</Text>}

          <Text style={styles.label}>Termo</Text>
          <TextInput
            style={styles.input}
            placeholder="Número do termo"
            value={formData.termo}
            onChangeText={(v) => handleChange('termo', v)}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Folha</Text>
          <TextInput
            style={styles.input}
            placeholder="Número da folha"
            value={formData.folha}
            onChangeText={(v) => handleChange('folha', v)}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Livro</Text>
          <TextInput
            style={styles.input}
            placeholder="Número do livro"
            value={formData.livro}
            onChangeText={(v) => handleChange('livro', v)}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            placeholder="Número da matrícula"
            value={formData.matricula}
            onChangeText={(v) => handleChange('matricula', v)}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Turno</Text>
          {renderPicker({
            field: 'turno',
            items: [
              { label: 'Manhã', value: 'Manhã' },
              { label: 'Tarde', value: 'Tarde' },
              { label: 'Integral', value: 'Integral' }
            ],
            placeholder: 'Selecione o Turno'
          })}

          <Text style={styles.label}>Tipo Sanguíneo</Text>
          {renderPicker({
            field: 'tipoSanguineo',
            items: [
              { label: 'A+', value: 'A+' },
              { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' },
              { label: 'O+', value: 'O+' },
              { label: 'O-', value: 'O-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'AB-', value: 'AB-' }
            ],
            placeholder: 'Selecione o Tipo Sanguíneo'
          })}

          <Text style={styles.label}>Raça</Text>
          {renderPicker({
            field: 'raca',
            items: [
              { label: 'Amarela', value: 'Amarela' },
              { label: 'Branca', value: 'Branca' },
              { label: 'Indígena', value: 'Indígena' },
              { label: 'Parda', value: 'Parda' },
              { label: 'Preta', value: 'Preta' },
            ],
            placeholder: 'Selecione a Raça'
          })}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Validando...' : 'Próximo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/home')}
            style={styles.backButton}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#902121',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#8B0000',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  backLink: {
    color: '#902121',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    opacity: 1,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});