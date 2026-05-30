import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole, Apartment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { subscribeToApartments, updateApartmentOccupancy } from '../../services/structure.service';
import { countResidentsInApartment } from '../../services/users.service';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { Home, Lock, User, Mail, Smartphone, Building, DoorOpen, Key, EyeOff, Eye, ChevronDown, Check, FileText } from 'lucide-react-native';
import { isValidCPF, formatCPF } from '../../utils/validators';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };



export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsub = subscribeToApartments(list => {
      setApartments(list.filter(a => a.status === 'available'));
    });
    return unsub;
  }, []);

  const handleCPFChange = (value: string) => {
    setCpf(formatCPF(value));
    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome é obrigatório';
    
    const rawCpf = cpf.replace(/\D/g, '');
    if (!rawCpf) e.cpf = 'CPF é obrigatório';
    else if (!isValidCPF(rawCpf)) e.cpf = 'CPF inválido';

    if (!rg.trim()) e.rg = 'RG é obrigatório';

    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!apartmentId) e.apartmentId = 'Selecione uma unidade/apartamento';
    if (!password) e.password = 'Senha é obrigatória';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      Alert.alert('Atenção', 'Corrija os erros no formulário antes de continuar.');
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Corrija os erros no formulário antes de continuar.' });
      return;
    }
    setLoading(true);
    try {
      const selected = apartments.find(a => a.id === apartmentId);

      await signUp(email.trim(), password, name.trim(), 'resident', {
        apartmentId: apartmentId,
        apartment: selected?.number ?? '',
        block: selected?.blockName ?? '',
        phone: phone.trim(),
        cpf: cpf.replace(/\D/g, ''),
        rg: rg.trim(),
        status: 'pending',
      });
      Alert.alert('Sucesso!', 'Seu cadastro foi realizado. Você poderá acessar após aprovação do síndico.');
      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Cadastro aguardando aprovação.' });
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao cadastrar. Verifique sua conexão.';
      Alert.alert('Erro no cadastro', msg);
      Toast.show({ type: 'error', text1: 'Erro no cadastro', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para continuar</Text>
        </View>



        <View style={styles.form}>
          <Input label="Nome completo" value={name} onChangeText={setName}
            placeholder="Seu nome" error={errors.name}
            leftIcon={<User size={20} color={Colors.textMuted} />} />

          <Input label="CPF" value={cpf} onChangeText={handleCPFChange}
            keyboardType="numeric" placeholder="000.000.000-00" error={errors.cpf}
            leftIcon={<FileText size={20} color={Colors.textMuted} />} />

          <Input label="RG" value={rg} onChangeText={(v) => { setRg(v); if(errors.rg) setErrors(prev => ({...prev, rg: ''})); }}
            placeholder="00.000.000-0" error={errors.rg}
            leftIcon={<FileText size={20} color={Colors.textMuted} />} />

          <Input label="E-mail" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="seu@email.com" error={errors.email}
            leftIcon={<Mail size={20} color={Colors.textMuted} />} />

          <Input label="Telefone" value={phone} onChangeText={setPhone}
            keyboardType="phone-pad" placeholder="(18) 99999-9999"
            leftIcon={<Smartphone size={20} color={Colors.textMuted} />} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unidade / Apartamento *</Text>
            <TouchableOpacity
              style={[styles.selectButton, errors.apartmentId && styles.selectButtonError]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.selectContent}>
                <DoorOpen size={20} color={Colors.textMuted} />
                <Text style={[styles.selectText, !apartmentId && styles.placeholderText]}>
                  {apartmentId
                    ? (() => {
                        const apt = apartments.find(a => a.id === apartmentId);
                        return apt ? `${apt.blockName ? `${apt.blockName} - ` : ''}Apt ${apt.number}` : 'Selecionado';
                      })()
                    : 'Selecione uma unidade'}
                </Text>
              </View>
              <ChevronDown size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            {errors.apartmentId ? <Text style={styles.errorText}>{errors.apartmentId}</Text> : null}
          </View>

          <Input label="Senha" value={password} onChangeText={setPassword}
            secureTextEntry={!showPass} placeholder="Mínimo 6 caracteres"
            error={errors.password} leftIcon={<Key size={20} color={Colors.textMuted} />}
            rightIcon={showPass ? <EyeOff size={20} color={Colors.textMuted} /> : <Eye size={20} color={Colors.textMuted} />}
            onRightIconPress={() => setShowPass(!showPass)} />

          <Input label="Confirmar senha" value={confirmPassword}
            onChangeText={setConfirmPassword} secureTextEntry={!showPass}
            placeholder="Repita sua senha" error={errors.confirmPassword}
            leftIcon={<Lock size={20} color={Colors.textMuted} />} />

          <Button title="Cadastrar" onPress={handleRegister} loading={loading}
            fullWidth size="lg" style={styles.registerBtn} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Unidade</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={apartments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: Spacing.md }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma unidade disponível no momento.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.aptItem, apartmentId === item.id && styles.aptItemActive]}
                  onPress={() => {
                    setApartmentId(item.id);
                    setErrors(prev => ({ ...prev, apartmentId: '' }));
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.sm}}>
                    <Building size={20} color={apartmentId === item.id ? Colors.accent : Colors.textSecondary} />
                    <Text style={[styles.aptText, apartmentId === item.id && styles.aptTextActive]}>
                      {item.blockName ? `${item.blockName} - ` : ''}Apt {item.number}
                    </Text>
                  </View>
                  {apartmentId === item.id && <Check size={20} color={Colors.accent} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing['2xl'] },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: Typography['3xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 4 },

  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },

  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  registerBtn: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: Colors.textMuted, fontSize: Typography.base },
  loginLink: { color: Colors.accent, fontSize: Typography.base, fontWeight: Typography.semiBold },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: Spacing.xs, marginLeft: 4 },
  selectButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, height: 50, paddingHorizontal: Spacing.md,
  },
  selectButtonError: { borderColor: Colors.error },
  selectContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  selectText: { fontSize: Typography.base, color: Colors.textPrimary },
  placeholderText: { color: Colors.textMuted },
  errorText: { color: Colors.error, fontSize: Typography.xs, marginTop: 4, marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  modalCloseText: { fontSize: Typography.base, color: Colors.accent, fontWeight: Typography.medium },
  emptyText: { textAlign: 'center', color: Colors.textMuted, fontSize: Typography.base, marginTop: Spacing.xl },
  aptItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  aptItemActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '10' },
  aptText: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
  aptTextActive: { color: Colors.accent },
});
