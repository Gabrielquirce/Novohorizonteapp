import { router } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
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
  nomeMae: '',
  cepMae: '',
  telefoneMae: '',
  trabalhoMae: '',
  nascimentoMae: '',
  cpfMae: '',
  emailMae: '',
  telefoneTrabalhoMae: '',
  enderecoMae: '',
  rgMae: '',
  profissaoMae: '',
  numeroCasaMae: '',
};

const cepMask = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
const telefoneMask = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
const cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
const rgMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/];
const dataMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];

export default function FamiliaresMaternoScreen() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<FormField, string>>({} as Record<FormField, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResponsavelMaterno, setHasResponsavelMaterno] = useState(false);
  
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

  // Função para rolar até o campo
  const scrollToInput = (reactNode: any) => {
    if (scrollViewRef.current && reactNode) {
      reactNode.measureLayout(
        scrollViewRef.current.getInnerViewNode(),
        (x: number, y: number) => {
          scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
        }
      );
    }
  };

  const validateField = useCallback(
    ((() => {
      const debounced = debounce((field: FormField, value: string) => {
        setErrors(prev => {
          const newErrors = { ...prev };
          if (!hasResponsavelMaterno) return newErrors;

          if (value.trim().length > 0) {
            delete newErrors[field];
          }

          switch(field) {
            case 'cpfMae':
              if (value.replace(/\D/g, '').length !== 11) {
                newErrors[field] = 'CPF inválido';
              }
              break;

            case 'cepMae': // Validação adicionada para CEP
              if (value.replace(/\D/g, '').length !== 8) {
                newErrors[field] = 'CEP inválido';
              }
              break;

            case 'nascimentoMae':
              if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
                newErrors[field] = 'Data inválida';
              }
              break;

            case 'rgMae':
              if (value.replace(/\D/g, '').length !== 9) {
                newErrors[field] = 'RG inválido';
              }
              break;

            case 'emailMae':
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                newErrors[field] = 'E-mail inválido';
              }
              break;

            default:
              if (!value.trim() && field !== 'trabalhoMae' && field !== 'enderecoMae') {
                newErrors[field] = 'Campo obrigatório';
              }
          }

          return newErrors;
        });
      }, 300);
      (debounced as any).flush = debounced.flush;
      return debounced;
    })()),
    [hasResponsavelMaterno]
  );

  const handleChange = useCallback((field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const toggleResponsavelMaterno = () => {
    const newState = !hasResponsavelMaterno;
    setHasResponsavelMaterno(newState);
    
    if (!newState) {
      setFormData(initialFormState);
      setErrors({} as Record<FormField, string>);
      useFormStore.getState().setMae(initialFormState);
    } else {
      // Focar no primeiro campo ao ativar
      setTimeout(() => nomeRef.current?.focus(), 100);
    }
  };

  const handleSubmit = useCallback(async () => {
    const validateMaeFields = () => {
      if (!hasResponsavelMaterno) return true;
      
      const requiredFields: FormField[] = [
        'nomeMae', 'cepMae', 'telefoneMae', 'nascimentoMae',
        'cpfMae', 'emailMae', 'enderecoMae', 'rgMae', 'numeroCasaMae'
      ];
  
      return requiredFields.every(field => 
        formData[field] && formData[field].trim().length > 0
      );
    };

    setIsSubmitting(true);
    validateField.flush();

    if (!hasResponsavelMaterno) {
      router.push('/forms-paterno');
      setIsSubmitting(false);
      return;
    }

    const isValid = validateMaeFields() && Object.keys(errors).length === 0;

    if (!isValid) {
      const missingFields = [
        !formData.nomeMae && 'Nome Completo',
        !formData.cepMae && 'CEP',
        !formData.telefoneMae && 'Telefone',
        !formData.nascimentoMae && 'Data de Nascimento',
        !formData.cpfMae && 'CPF',
        !formData.emailMae && 'E-mail',
        !formData.enderecoMae && 'Endereço',
        !formData.rgMae && 'RG',
        !formData.numeroCasaMae && 'Número da Casa'
      ].filter(Boolean);

      if (missingFields.length > 0) {
        Alert.alert(
          '🚨 Campos Obrigatórios',
          `Para continuar, preencha os seguintes campos:\n\n• ${missingFields.join('\n• ')}\n\nPor favor, verifique os dados!`,
          [
            {
              text: 'Preencher Agora',
              style: 'default',
            },
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setIsSubmitting(false),
            },
          ]
        );
      } else if (Object.keys(errors).length > 0) {
        Alert.alert(
          '❌ Erro de Validação',
          'Corrija os campos destacados em vermelho antes de continuar',
          [
            {
              text: 'Entendi',
              style: 'cancel',
            }
          ]
        );
      }
      
      setIsSubmitting(false);
      return;
    }

    try {
      useFormStore.getState().setMae(formData);
      router.push('/forms-paterno');
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert(
        '⛔ Erro',
        'Ocorreu um erro ao tentar avançar para a próxima tela',
        [
          {
            text: 'OK',
            style: 'cancel',
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
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
            style={[styles.toggleButton, hasResponsavelMaterno && styles.toggleActive]}
            onPress={toggleResponsavelMaterno}
            accessibilityLabel="Possui responsável materno"
            accessibilityHint="Ative para preencher dados do responsável materno"
          >
            <Text style={styles.toggleText}>
              {hasResponsavelMaterno ? '✓' : ''}
            </Text>
          </TouchableOpacity>
          <Text style={styles.toggleLabel}>Possui Responsável Materno</Text>
        </View>

        <View style={[styles.form, !hasResponsavelMaterno && styles.formDisabled]}>
          <Text style={styles.sectionTitle}>Dados do Responsável Materno</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            ref={nomeRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="Joana Silva"
            placeholderTextColor="#666"
            value={formData.nomeMae}
            onChangeText={(v) => handleChange('nomeMae', v)}
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => cepRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Nome completo do responsável materno"
            accessibilityHint="Digite o nome completo"
          />
          {errors.nomeMae && <Text style={styles.errorText}>{errors.nomeMae}</Text>}

          <Text style={styles.label}>CEP</Text>
          <MaskInput
            ref={cepRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="00000-000"
            placeholderTextColor="#666"
            value={formData.cepMae}
            onChangeText={(v) => handleChange('cepMae', v)}
            mask={cepMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => telefoneRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="CEP"
            accessibilityHint="Digite o CEP no formato 00000-000"
          />
          {errors.cepMae && <Text style={styles.errorText}>{errors.cepMae}</Text>}

          <Text style={styles.label}>Telefone</Text>
          <MaskInput
            ref={telefoneRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            value={formData.telefoneMae}
            onChangeText={(v) => handleChange('telefoneMae', v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => trabalhoRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Telefone"
            accessibilityHint="Digite o telefone no formato (00) 00000-0000"
          />
          {errors.telefoneMae && <Text style={styles.errorText}>{errors.telefoneMae}</Text>}

          <Text style={styles.label}>Local de Trabalho</Text>
          <TextInput
            ref={trabalhoRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="Empresa XYZ"
            placeholderTextColor="#666"
            value={formData.trabalhoMae}
            onChangeText={(v) => handleChange('trabalhoMae', v)}
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => nascimentoRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Local de trabalho"
            accessibilityHint="Digite o local de trabalho"
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskInput
            ref={nascimentoRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="00/00/0000"
            placeholderTextColor="#666"
            value={formData.nascimentoMae}
            onChangeText={(v) => handleChange('nascimentoMae', v)}
            mask={dataMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => cpfRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Data de nascimento"
            accessibilityHint="Digite a data de nascimento no formato DD/MM/AAAA"
          />
          {errors.nascimentoMae && <Text style={styles.errorText}>{errors.nascimentoMae}</Text>}

          <Text style={styles.label}>CPF</Text>
          <MaskInput
            ref={cpfRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="000.000.000-00"
            placeholderTextColor="#666"
            value={formData.cpfMae}
            onChangeText={(v) => handleChange('cpfMae', v)}
            mask={cpfMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="CPF"
            accessibilityHint="Digite o CPF no formato 000.000.000-00"
          />
          {errors.cpfMae && <Text style={styles.errorText}>{errors.cpfMae}</Text>}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            ref={emailRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="joana@email.com"
            placeholderTextColor="#666"
            value={formData.emailMae}
            onChangeText={(v) => handleChange('emailMae', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => telTrabalhoRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="E-mail"
            accessibilityHint="Digite o endereço de e-mail"
          />
          {errors.emailMae && <Text style={styles.errorText}>{errors.emailMae}</Text>}

          <Text style={styles.label}>Telefone do Trabalho</Text>
          <MaskInput
            ref={telTrabalhoRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            value={formData.telefoneTrabalhoMae}
            onChangeText={(v) => handleChange('telefoneTrabalhoMae', v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => enderecoRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Telefone do trabalho"
            accessibilityHint="Digite o telefone do trabalho no formato (00) 00000-0000"
          />
          {errors.telefoneTrabalhoMae && <Text style={styles.errorText}>{errors.telefoneTrabalhoMae}</Text>}

          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            ref={enderecoRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="Rua Exemplo, 123"
            placeholderTextColor="#666"
            value={formData.enderecoMae}
            onChangeText={(v) => handleChange('enderecoMae', v)}
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => numeroRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Endereço completo"
            accessibilityHint="Digite o endereço completo"
          />

          <Text style={styles.label}>Número da Casa</Text>
          <TextInput  
            ref={numeroRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="123"
            placeholderTextColor="#666"
            value={formData.numeroCasaMae}
            onChangeText={(v) => handleChange('numeroCasaMae', v)}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => rgRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Número da casa"
            accessibilityHint="Digite o número da casa"
          />
          {errors.numeroCasaMae && <Text style={styles.errorText}>{errors.numeroCasaMae}</Text>}

          <Text style={styles.label}>RG</Text>
          <MaskInput
            ref={rgRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="00.000.000-0"
            placeholderTextColor="#666"
            value={formData.rgMae}
            onChangeText={(v) => handleChange('rgMae', v)}
            mask={rgMask}
            keyboardType="number-pad"
            editable={hasResponsavelMaterno}
            returnKeyType="next"
            onSubmitEditing={() => profissaoRef.current?.focus()}
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="RG"
            accessibilityHint="Digite o RG no formato 00.000.000-0"
          />
          {errors.rgMae && <Text style={styles.errorText}>{errors.rgMae}</Text>}

          <Text style={styles.label}>Profissão</Text>
          <TextInput
            ref={profissaoRef}
            style={[styles.input, !hasResponsavelMaterno && styles.disabledInput]}
            placeholder="Engenheira"
            placeholderTextColor="#666"
            value={formData.profissaoMae}
            onChangeText={(v) => handleChange('profissaoMae', v)}
            editable={hasResponsavelMaterno}
            returnKeyType="done"
            onFocus={(event) => scrollToInput(event.target)}
            accessibilityLabel="Profissão"
            accessibilityHint="Digite a profissão"
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
            {isSubmitting ? 'Validando...' : 'Próximo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/forms-aluno')}
          style={styles.backButton}
          accessibilityLabel="Voltar"
          accessibilityHint="Voltar para tela anterior"
        >
          <Text style={styles.backLink}>Voltar</Text>
        </TouchableOpacity>
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    borderColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleActive: {
    backgroundColor: '#8B0000',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    gap: 12,
  },
  formDisabled: {
    opacity: 0.6,
  },
  sectionTitle: {
    color: '#902121',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
    color: '#000',
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#666',
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
    marginBottom: 8,
  },
});