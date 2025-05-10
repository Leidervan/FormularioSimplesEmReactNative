import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assumindo que você tem expo instalado

export default function FormScreen() {
  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cep: '',
    cpf: '',
    telefoneCelular: '',
    email: '',
    senha: '',
  });

  // Estados para controle de UI
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Verificar se todos os campos estão preenchidos
  const allFieldsFilled = Object.values(formData).every(value => value.trim() !== '');

  // Atualizar os dados do formulário
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real se já foi tocado
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Marcar campo como tocado quando o usuário sair dele
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Formatar entradas enquanto o usuário digita
  const formatCEP = (text) => {
    text = text.replace(/\D/g, '');
    if (text.length > 5) {
      text = text.substring(0, 5) + '-' + text.substring(5, 8);
    }
    return text.substring(0, 9);
  };

  const formatCPF = (text) => {
    text = text.replace(/\D/g, '');
    if (text.length > 9) {
      text = text.substring(0, 3) + '.' + 
             text.substring(3, 6) + '.' + 
             text.substring(6, 9) + '-' + 
             text.substring(9, 11);
    } else if (text.length > 6) {
      text = text.substring(0, 3) + '.' + 
             text.substring(3, 6) + '.' + 
             text.substring(6);
    } else if (text.length > 3) {
      text = text.substring(0, 3) + '.' + text.substring(3);
    }
    return text.substring(0, 14);
  };

  const formatPhone = (text) => {
    text = text.replace(/\D/g, '');
    if (text.length > 10) {
      text = '(' + text.substring(0, 2) + ') ' + 
             text.substring(2, 7) + '-' + 
             text.substring(7, 11);
    } else if (text.length > 6) {
      text = '(' + text.substring(0, 2) + ') ' + 
             text.substring(2, 6) + '-' + 
             text.substring(6);
    } else if (text.length > 2) {
      text = '(' + text.substring(0, 2) + ') ' + text.substring(2);
    } else if (text.length > 0) {
      text = '(' + text;
    }
    return text.substring(0, 16);
  };

  // Validar um campo específico
  const validateField = (field, value) => {
    let newErrors = { ...errors };
    
    switch (field) {
      case 'nomeCompleto':
        if (!value.trim()) {
          newErrors.nomeCompleto = 'Nome completo é obrigatório';
        } else if (value.trim().split(' ').length < 2) {
          newErrors.nomeCompleto = 'Digite nome e sobrenome';
        } else {
          delete newErrors.nomeCompleto;
        }
        break;
        
      case 'cep':
        const cepClean = value.replace(/\D/g, '');
        if (!cepClean) {
          newErrors.cep = 'CEP é obrigatório';
        } else if (cepClean.length !== 8) {
          newErrors.cep = 'CEP deve ter 8 dígitos';
        } else {
          delete newErrors.cep;
        }
        break;
        
      case 'cpf':
        const cpfClean = value.replace(/\D/g, '');
        if (!cpfClean) {
          newErrors.cpf = 'CPF é obrigatório';
        } else if (cpfClean.length !== 11) {
          newErrors.cpf = 'CPF deve ter 11 dígitos';
        } else if (!validarCPF(cpfClean)) {
          newErrors.cpf = 'CPF inválido';
        } else {
          delete newErrors.cpf;
        }
        break;
        
      case 'telefoneCelular':
        const phoneClean = value.replace(/\D/g, '');
        if (!phoneClean) {
          newErrors.telefoneCelular = 'Telefone é obrigatório';
        } else if (phoneClean.length < 10 || phoneClean.length > 11) {
          newErrors.telefoneCelular = 'Telefone inválido';
        } else {
          delete newErrors.telefoneCelular;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'E-mail é obrigatório';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'E-mail inválido';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'senha':
        if (!value) {
          newErrors.senha = 'Senha é obrigatória';
        } else if (value.length !== 8) {
          newErrors.senha = 'Senha deve ter exatamente 8 caracteres';
        } else if (!/[a-z]/.test(value)) {
          newErrors.senha = 'Deve conter letra minúscula';
        } else if (!/[A-Z]/.test(value)) {
          newErrors.senha = 'Deve conter letra maiúscula';
        } else if (!/\d/.test(value)) {
          newErrors.senha = 'Deve conter número';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          newErrors.senha = 'Deve conter caractere especial';
        } else if (/[À-ž]/.test(value) || /[çÇ]/.test(value)) {
          newErrors.senha = 'Não pode conter acentos nem ç';
        } else {
          delete newErrors.senha;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar CPF (algoritmo de validação)
  const validarCPF = (cpf) => {
    // Elimina CPFs inválidos conhecidos
    if (cpf === '00000000000' || 
        cpf === '11111111111' || 
        cpf === '22222222222' || 
        cpf === '33333333333' || 
        cpf === '44444444444' || 
        cpf === '55555555555' || 
        cpf === '66666666666' || 
        cpf === '77777777777' || 
        cpf === '88888888888' || 
        cpf === '99999999999') {
        return false;
    }
    
    // Valida 1o dígito
    let add = 0;
    for (let i = 0; i < 9; i++) {
        add += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) {
        rev = 0;
    }
    if (rev !== parseInt(cpf.charAt(9))) {
        return false;
    }
    
    // Valida 2o dígito
    add = 0;
    for (let i = 0; i < 10; i++) {
        add += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) {
        rev = 0;
    }
    if (rev !== parseInt(cpf.charAt(10))) {
        return false;
    }
    
    return true;
  };

  // Validar todos os campos do formulário
  const validateForm = () => {
    let isValid = true;
    // Validar cada campo
    Object.keys(formData).forEach(field => {
      const fieldIsValid = validateField(field, formData[field]);
      if (!fieldIsValid) isValid = false;
    });
    
    return isValid;
  };

  // Enviar o formulário
  const handleSubmit = async () => {
    // Marcar todos os campos como tocados para mostrar erros
    const touchedFields = {};
    Object.keys(formData).forEach(key => touchedFields[key] = true);
    setTouched(touchedFields);
    
    if (!validateForm()) {
      Alert.alert(
        'Erro de validação',
        'Por favor, corrija os erros destacados antes de enviar.'
      );
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulação de envio para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sucesso
      Alert.alert(
        'Sucesso!',
        'Seus dados foram enviados com sucesso.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Resetar formulário
              setFormData({
                nomeCompleto: '',
                cep: '',
                cpf: '',
                telefoneCelular: '',
                email: '',
                senha: '',
              });
              setTouched({});
              setErrors({});
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao enviar os dados. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Interface de usuário
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />
      
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cadastro</Text>
        
        {/* Nome Completo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={[
              styles.input,
              touched.nomeCompleto && errors.nomeCompleto && styles.inputError
            ]}
            value={formData.nomeCompleto}
            onChangeText={(text) => handleChange('nomeCompleto', text)}
            onBlur={() => handleBlur('nomeCompleto')}
            placeholder="Ex: João Silva"
            autoCapitalize="words"
          />
          {touched.nomeCompleto && errors.nomeCompleto && (
            <Text style={styles.errorText}>{errors.nomeCompleto}</Text>
          )}
        </View>

        {/* CEP */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            style={[
              styles.input,
              touched.cep && errors.cep && styles.inputError
            ]}
            value={formData.cep}
            onChangeText={(text) => handleChange('cep', formatCEP(text))}
            onBlur={() => handleBlur('cep')}
            placeholder="12345-678"
            keyboardType="numeric"
            maxLength={9}
          />
          {touched.cep && errors.cep && (
            <Text style={styles.errorText}>{errors.cep}</Text>
          )}
        </View>

        {/* CPF */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[
              styles.input,
              touched.cpf && errors.cpf && styles.inputError
            ]}
            value={formData.cpf}
            onChangeText={(text) => handleChange('cpf', formatCPF(text))}
            onBlur={() => handleBlur('cpf')}
            placeholder="123.456.789-01"
            keyboardType="numeric"
            maxLength={14}
          />
          {touched.cpf && errors.cpf && (
            <Text style={styles.errorText}>{errors.cpf}</Text>
          )}
        </View>

        {/* Telefone */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefone celular</Text>
          <TextInput
            style={[
              styles.input,
              touched.telefoneCelular && errors.telefoneCelular && styles.inputError
            ]}
            value={formData.telefoneCelular}
            onChangeText={(text) => handleChange('telefoneCelular', formatPhone(text))}
            onBlur={() => handleBlur('telefoneCelular')}
            placeholder="(99) 99999-9999"
            keyboardType="phone-pad"
            maxLength={16}
          />
          {touched.telefoneCelular && errors.telefoneCelular && (
            <Text style={styles.errorText}>{errors.telefoneCelular}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[
              styles.input,
              touched.email && errors.email && styles.inputError
            ]}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text.toLowerCase())}
            onBlur={() => handleBlur('email')}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Senha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha (8 caracteres)</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                touched.senha && errors.senha && styles.inputError
              ]}
              value={formData.senha}
              onChangeText={(text) => handleChange('senha', text)}
              onBlur={() => handleBlur('senha')}
              placeholder="Sua senha"
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.passwordIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#777"
              />
            </TouchableOpacity>
          </View>
          {touched.senha && errors.senha && (
            <Text style={styles.errorText}>{errors.senha}</Text>
          )}
          
          {/* Requisitos de senha */}
          <View style={styles.passwordReqs}>
            <Text style={styles.passwordReqsTitle}>A senha deve conter:</Text>
            <View style={styles.passwordReqItem}>
              <Ionicons
                name={formData.senha.length === 8 ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={formData.senha.length === 8 ? '#4CAF50' : '#888'}
              />
              <Text style={styles.passwordReqText}>Exatamente 8 caracteres</Text>
            </View>
            <View style={styles.passwordReqItem}>
              <Ionicons
                name={/[a-z]/.test(formData.senha) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[a-z]/.test(formData.senha) ? '#4CAF50' : '#888'}
              />
              <Text style={styles.passwordReqText}>Uma letra minúscula</Text>
            </View>
            <View style={styles.passwordReqItem}>
              <Ionicons
                name={/[A-Z]/.test(formData.senha) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[A-Z]/.test(formData.senha) ? '#4CAF50' : '#888'}
              />
              <Text style={styles.passwordReqText}>Uma letra maiúscula</Text>
            </View>
            <View style={styles.passwordReqItem}>
              <Ionicons
                name={/\d/.test(formData.senha) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/\d/.test(formData.senha) ? '#4CAF50' : '#888'}
              />
              <Text style={styles.passwordReqText}>Um número</Text>
            </View>
            <View style={styles.passwordReqItem}>
              <Ionicons
                name={/[!@#$%^&*(),.?":{}|<>]/.test(formData.senha) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={/[!@#$%^&*(),.?":{}|<>]/.test(formData.senha) ? '#4CAF50' : '#888'}
              />
              <Text style={styles.passwordReqText}>Um caractere especial</Text>
            </View>
            <View style={styles.passwordReqItem}>
              <Ionicons
                name={!(/[À-ž]/.test(formData.senha) || /[çÇ]/.test(formData.senha)) ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={!(/[À-ž]/.test(formData.senha) || /[çÇ]/.test(formData.senha)) ? '#4CAF50' : '#888'}
              />
              <Text style={styles.passwordReqText}>Sem acentos ou ç</Text>
            </View>
          </View>
        </View>

        {/* Botão de Envio */}
        <TouchableOpacity
          style={[
            styles.button,
            (!allFieldsFilled || Object.keys(errors).length > 0) && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!allFieldsFilled || Object.keys(errors).length > 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {allFieldsFilled && Object.keys(errors).length === 0 
                ? 'Enviar' 
                : 'Preencha todos os campos corretamente'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  passwordIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  passwordReqs: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  passwordReqsTitle: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
    fontSize: 14,
  },
  passwordReqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  passwordReqText: {
    marginLeft: 5,
    color: '#555',
    fontSize: 13,
  },
  button: {
    marginTop: 25,
    marginBottom: 30,
    backgroundColor: '#4361ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});