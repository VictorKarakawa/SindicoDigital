import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createVisitor, updateVisitor, getVisitorByCpf } from '../../../services/visitors.service';
import { Visitor } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { PhotoPicker } from '../../../components/common/PhotoPicker';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import {
  User as UserIcon, FileText, Smartphone, Mail
} from 'lucide-react-native';
import {
  isValidCPF, isValidEmail, formatCPF, formatPhone
} from '../../../utils/validators';

export const CreateEditVisitorScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: Visitor | undefined = route.params?.visitor;

  // Form state
  const [name, setName] = useState(existing?.name ?? '');
  const [cpf, setCpf] = useState(existing?.cpf ? formatCPF(existing.cpf) : '');
  const [rg, setRg] = useState(existing?.rg ?? '');
  const [phone, setPhone] = useState(existing?.phone ? formatPhone(existing.phone) : '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [photoURL, setPhotoURL] = useState(existing?.photoURL ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Masked inputs ──────────────────────────────────────────────────
  const handleCPFChange = (v: string) => {
    setCpf(formatCPF(v));
    if (errors.cpf) setErrors((p) => ({ ...p, cpf: '' }));
  };

  const handlePhoneChange = (v: string) => {
    setPhone(formatPhone(v));
    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
  };

  // ─── Validation ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Nome é obrigatório';

    const rawCpf = cpf.replace(/\D/g, '');
    if (!rawCpf) e.cpf = 'CPF é obrigatório';
    else if (!isValidCPF(rawCpf)) e.cpf = 'CPF inválido';

    if (email.trim() && !isValidEmail(email)) e.email = 'E-mail inválido';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Corrija os erros no formulário.' });
      return;
    }

    setLoading(true);
    try {
      const rawCpf = cpf.replace(/\D/g, '');
      const rawPhone = phone.replace(/\D/g, '');

      if (existing) {
        // Verifica se CPF não mudou para outro já existente
        if (existing.cpf !== rawCpf) {
          const duplicate = await getVisitorByCpf(rawCpf);
          if (duplicate) {
            setErrors({ cpf: 'CPF já cadastrado em outro visitante.' });
            setLoading(false);
            return;
          }
        }

        await updateVisitor(existing.id, {
          name: name.trim(),
          cpf: rawCpf,
          rg: rg.trim(),
          phone: rawPhone,
          email: email.trim(),
          photoURL,
        });
        navigation.goBack();
        Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Perfil do visitante atualizado.' });
      } else {
        const duplicate = await getVisitorByCpf(rawCpf);
        if (duplicate) {
          setErrors({ cpf: 'CPF já cadastrado no sistema.' });
          setLoading(false);
          return;
        }

        const newId = await createVisitor({
          name: name.trim(),
          cpf: rawCpf,
          rg: rg.trim(),
          phone: rawPhone,
          email: email.trim(),
          photoURL,
          createdAt: Date.now(),
        });
        
        // Se vier de uma tela que quer criar visita imediatamente:
        if (route.params?.onVisitorCreated) {
           route.params.onVisitorCreated(newId);
           navigation.goBack();
        } else {
           navigation.goBack();
           Toast.show({ type: 'success', text1: 'Cadastrado', text2: 'Visitante cadastrado com sucesso.' });
        }
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o visitante.' });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{existing ? 'Editar perfil do visitante' : 'Novo visitante'}</Text>

        <View style={styles.form}>
          {/* Photo */}
          <PhotoPicker
            value={photoURL || undefined}
            onChange={setPhotoURL}
            label="Foto do visitante"
            size={80}
          />

          {/* Name */}
          <Input label="Nome completo *" value={name} onChangeText={(v) => { setName(v); clearError('name'); }}
            placeholder="Nome completo" error={errors.name}
            leftIcon={<UserIcon size={20} color={Colors.textSecondary} />} />

          {/* CPF */}
          <Input label="CPF *" value={cpf} onChangeText={handleCPFChange}
            keyboardType="numeric" placeholder="000.000.000-00" error={errors.cpf}
            leftIcon={<FileText size={20} color={Colors.textSecondary} />} />

          {/* RG */}
          <Input label="RG" value={rg} onChangeText={setRg}
            placeholder="00.000.000-0"
            leftIcon={<FileText size={20} color={Colors.textSecondary} />} />

          {/* Phone */}
          <Input label="Telefone" value={phone} onChangeText={handlePhoneChange}
            keyboardType="phone-pad" placeholder="(18) 99999-9999" error={errors.phone}
            leftIcon={<Smartphone size={20} color={Colors.textSecondary} />} />

          {/* Email */}
          <Input label="E-mail" value={email} onChangeText={(v) => { setEmail(v); clearError('email'); }}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="email@exemplo.com" error={errors.email}
            leftIcon={<Mail size={20} color={Colors.textSecondary} />} />

          <Button
            title={existing ? 'Salvar alterações' : 'Cadastrar visitante'}
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, paddingBottom: 60 },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.xl,
  },
  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  saveBtn: { marginTop: Spacing.md },
});
