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
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { Building2, Mail, Key, EyeOff, Eye } from 'lucide-react-native';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Senha é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'E-mail ou senha incorretos.'
          : err.code === 'auth/user-not-found'
          ? 'Usuário não encontrado.'
          : err.code === 'auth/too-many-requests'
          ? 'Muitas tentativas. Tente novamente mais tarde.'
          : 'Erro ao fazer login. Verifique sua conexão.';
      Alert.alert('Erro de acesso', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Building2 size={36} color={Colors.white} />
          </View>
          <Text style={styles.appName}>Síndico Digital</Text>
          <Text style={styles.tagline}>Gestão do seu condomínio</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre com suas credenciais</Text>

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="seu@email.com"
            error={errors.email}
            leftIcon={<Mail size={20} color={Colors.textSecondary} />}
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            placeholder="Sua senha"
            error={errors.password}
            leftIcon={<Key size={20} color={Colors.textSecondary} />}
            rightIcon={showPassword ? <EyeOff size={20} color={Colors.textSecondary} /> : <Eye size={20} color={Colors.textSecondary} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.loginBtn}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['3xl'],
  },
  logoArea: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.extraBold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  tagline: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 4 },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: { fontSize: Typography.base, color: Colors.textMuted, marginBottom: Spacing.xl },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.lg, marginTop: -Spacing.sm },
  forgotText: { color: Colors.accent, fontSize: Typography.sm, fontWeight: Typography.medium },
  loginBtn: { marginBottom: Spacing.lg },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: Colors.textMuted, fontSize: Typography.base },
  registerLink: { color: Colors.accent, fontSize: Typography.base, fontWeight: Typography.semiBold },
});
