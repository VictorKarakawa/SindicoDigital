import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { CheckCircle2, Lock, Mail } from 'lucide-react-native';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { Alert.alert('Atenção', 'Informe seu e-mail.'); return; }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail. Verifique o endereço.');
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
        <View style={styles.form}>
          <View style={styles.iconContainer}>
            {sent ? <CheckCircle2 size={48} color={Colors.success} /> : <Lock size={48} color={Colors.accent} />}
          </View>
          <Text style={styles.title}>{sent ? 'E-mail enviado!' : 'Recuperar senha'}</Text>
          <Text style={styles.subtitle}>
            {sent
              ? `Enviamos um link de redefinição para ${email}. Verifique sua caixa de entrada.`
              : 'Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.'}
          </Text>

          {!sent && (
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu@email.com"
              leftIcon={<Mail size={20} color={Colors.textSecondary} />}
            />
          )}

          <Button
            title={sent ? 'Voltar ao login' : 'Enviar link de recuperação'}
            onPress={sent ? () => navigation.navigate('Login') : handleReset}
            loading={loading}
            fullWidth
            size="lg"
          />

          {!sent && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  iconContainer: { marginBottom: Spacing.base, alignItems: 'center' },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.base, color: Colors.textMuted,
    textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22,
  },
  ico: { fontSize: 16 },
  backBtn: { marginTop: Spacing.lg },
  backText: { color: Colors.accent, fontSize: Typography.base },
});
