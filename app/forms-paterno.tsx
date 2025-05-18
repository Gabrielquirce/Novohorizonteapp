import { router } from 'expo-router';
import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import {
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
  profissaoPai: ''
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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    validateField.flush();

    if (!hasResponsavelPaterno) {
      router.push('/forms-obs');
      setIsSubmitting(false);
      return;
    }

    if (Object.keys(errors).length === 0) {
      try {
        useFormStore.getState().setPai(formData);
        router.push('/forms-obs');
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao avançar para próxima tela');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert('Por favor, corrija os erros antes de enviar.');
      setIsSubmitting(false);
    }
  }, [errors, formData, validateField, hasResponsavelPaterno]);

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

          <TextInput
            style={[styles.inputFull, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="Nome completo"
            value={formData.nomePai}
            onChangeText={(v) => handleChange('nomePai', v)}
            editable={hasResponsavelPaterno}
          />

          <View style={styles.row}>
            <MaskInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="CEP"
              value={formData.cepPai}
              onChangeText={(v) => handleChange('cepPai', v)}
              mask={cepMask}
              keyboardType="number-pad"
              editable={hasResponsavelPaterno}
            />
            <MaskInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="Telefone"
              value={formData.telefonePai}
              onChangeText={(v) => handleChange('telefonePai', v)}
              mask={telefoneMask}
              keyboardType="phone-pad"
              editable={hasResponsavelPaterno}
            />
          </View>

          <TextInput
            style={[styles.inputFull, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="Local de trabalho"
            value={formData.trabalhoPai}
            onChangeText={(v) => handleChange('trabalhoPai', v)}
            editable={hasResponsavelPaterno}
          />

          <View style={styles.row}>
            <MaskInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="Data de nascimento"
              value={formData.nascimentoPai}
              onChangeText={(v) => handleChange('nascimentoPai', v)}
              mask={dataMask}
              keyboardType="number-pad"
              editable={hasResponsavelPaterno}
            />
            <MaskInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="CPF"
              value={formData.cpfPai}
              onChangeText={(v) => handleChange('cpfPai', v)}
              mask={cpfMask}
              keyboardType="number-pad"
              editable={hasResponsavelPaterno}
            />
          </View>

          <TextInput
            style={[styles.inputFull, !hasResponsavelPaterno && styles.disabledInput]}
            placeholder="E-mail"
            value={formData.emailPai}
            onChangeText={(v) => handleChange('emailPai', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={hasResponsavelPaterno}
          />

          <View style={styles.row}>
            <MaskInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="Telefone do trabalho"
              value={formData.telefoneTrabalhoPai}
              onChangeText={(v) => handleChange('telefoneTrabalhoPai', v)}
              mask={telefoneMask}
              keyboardType="phone-pad"
              editable={hasResponsavelPaterno}
            />
            <TextInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="Endereço completo"
              value={formData.enderecoPai}
              onChangeText={(v) => handleChange('enderecoPai', v)}
              editable={hasResponsavelPaterno}
            />
          </View>

          <View style={styles.row}>
            <MaskInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="RG"
              value={formData.rgPai}
              onChangeText={(v) => handleChange('rgPai', v)}
              mask={rgMask}
              keyboardType="number-pad"
              editable={hasResponsavelPaterno}
            />
            <TextInput
              style={[styles.input, !hasResponsavelPaterno && styles.disabledInput]}
              placeholder="Profissão"
              value={formData.profissaoPai}
              onChangeText={(v) => handleChange('profissaoPai', v)}
              editable={hasResponsavelPaterno}
            />
          </View>

          {Object.entries(errors).map(([field, message]) => (
            <Text key={field} style={styles.errorText}>
              {message}
            </Text>
          ))}
        </View>

        <View style={styles.buttonsContainer}>
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
  },
  formDisabled: {
    opacity: 0.6,
  },
  buttonsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    elevation: 2,
  },
  sectionTitle: {
    color: '#902121',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputFull: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#8B0000',
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
    opacity: 1,
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
    marginLeft: 4,
  },
});