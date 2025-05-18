import { router } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
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
  nomePai: '',
  cepPai: '',
  telefonePai: '',
  trabalhoPai: '',
  nascimentoPai: '',
  cpfPai: '',
  emailPai: '',
  telefoneTrabalhoPai: '',
  enderecoPai: '',
  rgPai: '',
  profissaoPai: '',
  numeroCasaPai: ''
};

const cepMask = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
const telefoneMask = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
const cpfMask = [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
const rgMask = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/];
const dataMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];

export default function FamiliaresPaternoScreen() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<FormField, string>>({} as Record<FormField, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResponsavelPaterno, setHasResponsavelPaterno] = useState(false);

  const validateField = useCallback(
    debounce((field: FormField, value: string) => {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (!hasResponsavelPaterno) return newErrors;

        if (value.trim().length > 0) {
          delete newErrors[field];
        }

        switch(field) {
          case 'cpfPai':
            if (value.replace(/\D/g, '').length !== 11) {
              newErrors[field] = 'CPF inválido';
            }
            break;

          case 'nascimentoPai':
            if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) {
              newErrors[field] = 'Data inválida';
            }
            break;

          case 'rgPai':
            if (value.replace(/\D/g, '').length !== 9) {
              newErrors[field] = 'RG inválido';
            }
            break;

          case 'emailPai':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              newErrors[field] = 'E-mail inválido';
            }
            break;

          default:
            if (!value.trim() && field !== 'trabalhoPai' && field !== 'enderecoPai') {
              newErrors[field] = 'Campo obrigatório';
            }
        }

        return newErrors;
      });
    }, 300),
    [hasResponsavelPaterno]
  );

  const handleChange = useCallback((field: FormField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const toggleResponsavelPaterno = () => {
    const newState = !hasResponsavelPaterno;
    setHasResponsavelPaterno(newState);
    
    if (!newState) {
      setFormData(initialFormState);
      setErrors({} as Record<FormField, string>);
      useFormStore.getState().setPai(initialFormState);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validatePaiFields = () => {
    if (!hasResponsavelPaterno) return true;
    
    const requiredFields: FormField[] = [
      'nomePai', 'cepPai', 'telefonePai', 'nascimentoPai',
      'cpfPai', 'emailPai', 'enderecoPai', 'rgPai', 'numeroCasaPai'
    ];

    return requiredFields.every(field => 
      formData[field] && formData[field].trim().length > 0
    );
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    validateField.flush();

    if (!hasResponsavelPaterno) {
      router.push('/forms-obs');
      setIsSubmitting(false);
      return;
    }

    const isValid = validatePaiFields() && Object.keys(errors).length === 0;

    if (!isValid) {
      const missingFields = [
        !formData.nomePai && 'Nome Completo',
        !formData.cepPai && 'CEP',
        !formData.telefonePai && 'Telefone',
        !formData.nascimentoPai && 'Data de Nascimento',
        !formData.cpfPai && 'CPF',
        !formData.emailPai && 'E-mail',
        !formData.enderecoPai && 'Endereço',
        !formData.rgPai && 'RG',
        !formData.numeroCasaPai && 'Número da Casa' 
      ].filter(Boolean);

      if (missingFields.length > 0) {
        Alert.alert(
          '🚨 Campos Obrigatórios',
          `Para continuar, preencha os seguintes campos:\n\n• ${missingFields.join('\n• ')}\n\nVerifique os dados cuidadosamente!`,
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
          'Corrija os campos destacados em vermelho antes de prosseguir',
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
      useFormStore.getState().setPai(formData);
      router.push('/forms-obs');
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
  }, [validateField, hasResponsavelPaterno, validatePaiFields, errors, formData]);

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
          <Text style={styles.headerTitle}>Dados dos Familiares</Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, hasResponsavelPaterno && styles.toggleActive]}
            onPress={toggleResponsavelPaterno}
          >
            <Text style={styles.toggleText}>
              {hasResponsavelPaterno ? '✓' : ''}
            </Text>
          </TouchableOpacity>
          <Text style={styles.toggleLabel}>Possui Responsável Paterno</Text>
        </View>

        <View style={[styles.form, !hasResponsavelPaterno && styles.formDisabled]}>
          <Text style={styles.sectionTitle}>Dados do Responsável Paterno</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="Carlos Silva"
            value={formData.nomePai}
            onChangeText={(v) => handleChange('nomePai', v)}
            editable={hasResponsavelPaterno}
          />
          {errors.nomePai && <Text style={styles.errorText}>{errors.nomePai}</Text>}

          <Text style={styles.label}>CEP</Text>
          <MaskInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="00000-000"
            value={formData.cepPai}
            onChangeText={(v) => handleChange('cepPai', v)}
            mask={cepMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.cepPai && <Text style={styles.errorText}>{errors.cepPai}</Text>}

          <Text style={styles.label}>Telefone</Text>
          <MaskInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="(00) 00000-0000"
            value={formData.telefonePai}
            onChangeText={(v) => handleChange('telefonePai', v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.telefonePai && <Text style={styles.errorText}>{errors.telefonePai}</Text>}

          <Text style={styles.label}>Local de Trabalho</Text>
          <TextInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="Empresa ABC"
            value={formData.trabalhoPai}
            onChangeText={(v) => handleChange('trabalhoPai', v)}
            editable={hasResponsavelPaterno}
          />

          <Text style={styles.label}>Data de Nascimento</Text>
          <MaskInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="00/00/0000"
            value={formData.nascimentoPai}
            onChangeText={(v) => handleChange('nascimentoPai', v)}
            mask={dataMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.nascimentoPai && <Text style={styles.errorText}>{errors.nascimentoPai}</Text>}

          <Text style={styles.label}>CPF</Text>
          <MaskInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="000.000.000-00"
            value={formData.cpfPai}
            onChangeText={(v) => handleChange('cpfPai', v)}
            mask={cpfMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.cpfPai && <Text style={styles.errorText}>{errors.cpfPai}</Text>}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="carlos@email.com"
            value={formData.emailPai}
            onChangeText={(v) => handleChange('emailPai', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={hasResponsavelPaterno}
          />
          {errors.emailPai && <Text style={styles.errorText}>{errors.emailPai}</Text>}

          <Text style={styles.label}>Telefone do Trabalho</Text>
          <MaskInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="(00) 00000-0000"
            value={formData.telefoneTrabalhoPai}
            onChangeText={(v) => handleChange('telefoneTrabalhoPai', v)}
            mask={telefoneMask}
            keyboardType="phone-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.telefoneTrabalhoPai && <Text style={styles.errorText}>{errors.telefoneTrabalhoPai}</Text>}

          <Text style={styles.label}>Endereço Completo</Text>
          <TextInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="Avenida Principal, 456"
            value={formData.enderecoPai}
            onChangeText={(v) => handleChange('enderecoPai', v)}
            editable={hasResponsavelPaterno}
          />

          <Text style={styles.label}>Número da Casa</Text>
          <TextInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="123"
            value={formData.numeroCasaPai}
            onChangeText={(v) => handleChange('numeroCasaPai', v)}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.numeroCasaPai && <Text style={styles.errorText}>{errors.numeroCasaPai}</Text>}
          
          <Text style={styles.label}>RG</Text>
          <MaskInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="00.000.000-0"
            value={formData.rgPai}
            onChangeText={(v) => handleChange('rgPai', v)}
            mask={rgMask}
            keyboardType="number-pad"
            editable={hasResponsavelPaterno}
          />
          {errors.rgPai && <Text style={styles.errorText}>{errors.rgPai}</Text>}

          <Text style={styles.label}>Profissão</Text>
          <TextInput
            style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="Engenheiro"
            value={formData.profissaoPai}
            onChangeText={(v) => handleChange('profissaoPai', v)}
            editable={hasResponsavelPaterno}
          />
        </View>

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
          onPress={() => router.push('/forms-materno')}
          style={styles.backButton}
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
    marginBottom: 8,
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
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
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