import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { Home, Lock, User, Mail, Smartphone, Building, DoorOpen, Key, EyeOff, Eye } from 'lucide-react-native';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

const ROLES: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'resident',   label: 'Morador',  icon: '🏠', desc: 'Morador do condomínio' },
  { value: 'gatekeeper', label: 'Porteiro', icon: '🔐', desc: 'Controle de entrada/saída' },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [apartment, setApartment] = useState('');
  const [block, setBlock] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome é obrigatório';
    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Senha é obrigatória';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim(), role, {
        apartment: apartment.trim(),
        block: block.trim(),
        phone: phone.trim(),
      });
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao cadastrar. Verifique sua conexão.';
      Alert.alert('Erro', msg);
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

        {/* Role Selector */}
        <Text style={styles.sectionLabel}>Tipo de usuário</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleCard, role === r.value && styles.roleCardActive]}
              onPress={() => setRole(r.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>{r.icon}</Text>
              <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                {r.label}
              </Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <Input label="Nome completo" value={name} onChangeText={setName}
            placeholder="Seu nome" error={errors.name}
            leftIcon={<Text style={styles.ico}>👤</Text>} />

          <Input label="E-mail" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="seu@email.com" error={errors.email}
            leftIcon={<Text style={styles.ico}>✉️</Text>} />

          <Input label="Telefone" value={phone} onChangeText={setPhone}
            keyboardType="phone-pad" placeholder="(18) 99999-9999"
            leftIcon={<Text style={styles.ico}>📱</Text>} />

          {role === 'resident' && (
            <View style={styles.row}>
              <View style={styles.half}>
                <Input label="Bloco" value={block} onChangeText={setBlock}
                  placeholder="A" leftIcon={<Text style={styles.ico}>🏗️</Text>} />
              </View>
              <View style={styles.half}>
                <Input label="Apartamento" value={apartment} onChangeText={setApartment}
                  placeholder="101" leftIcon={<Text style={styles.ico}>🚪</Text>} />
              </View>
            </View>
          )}

          <Input label="Senha" value={password} onChangeText={setPassword}
            secureTextEntry={!showPass} placeholder="Mínimo 6 caracteres"
            error={errors.password} leftIcon={<Text style={styles.ico}>🔑</Text>}
            rightIcon={<Text style={styles.ico}>{showPass ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowPass(!showPass)} />

          <Input label="Confirmar senha" value={confirmPassword}
            onChangeText={setConfirmPassword} secureTextEntry={!showPass}
            placeholder="Repita sua senha" error={errors.confirmPassword}
            leftIcon={<Text style={styles.ico}>🔒</Text>} />

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing['2xl'] },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: Typography['3xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 4 },
  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.semiBold,
    color: Colors.textSecondary, marginBottom: Spacing.sm,
  },
  roleRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  roleCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1.5,
    borderColor: Colors.border,
  },
  roleCardActive: { borderColor: Colors.accent, backgroundColor: Colors.card },
  roleIcon: { fontSize: 28, marginBottom: Spacing.xs },
  roleLabel: {
    fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textSecondary,
  },
  roleLabelActive: { color: Colors.accent },
  roleDesc: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  ico: { fontSize: 16 },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  registerBtn: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: Colors.textMuted, fontSize: Typography.base },
  loginLink: { color: Colors.accent, fontSize: Typography.base, fontWeight: Typography.semiBold },
});
