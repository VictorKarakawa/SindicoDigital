import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Modal, FlatList, Alert
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/auth.service';
import { updateUser, isUserCPFTaken, isUserEmailTaken, isApartmentTakenByOwner, countResidentsInApartment } from '../../services/users.service';
import { getApartments, updateApartmentOccupancy } from '../../services/structure.service';
import { UserProfile, UserRole, ResidentType, Apartment } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PhotoPicker } from '../../components/common/PhotoPicker';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import {
  User, Mail, Smartphone, Building, DoorOpen, Key, FileText, Calendar, Shield,
  Home, ClipboardList, CheckCircle2, XCircle,
} from 'lucide-react-native';
import { RoleLabels, ResidentTypeLabels, UserStatusLabels } from '../../constants/roles';
import {
  isValidCPF, isValidEmail, isValidPhone,
  formatCPF, formatPhone, formatDateInput, dateInputToISO, formatDateBR,
} from '../../utils/validators';

const RESIDENT_TYPES: { value: ResidentType; label: string }[] = [
  { value: 'owner', label: 'Proprietário' },
  { value: 'tenant', label: 'Inquilino' },
];

export const CreateEditUserScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: UserProfile | undefined = route.params?.user;
  const roleParam: UserRole = route.params?.role ?? 'resident';
  const role = existing?.role ?? roleParam;

  // ─── Form State ──────────────────────────────────────────────────────
  const [name, setName] = useState(existing?.name ?? '');
  const [cpf, setCpf] = useState(existing?.cpf ? formatCPF(existing.cpf) : '');
  const [rg, setRg] = useState(existing?.rg ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [phone, setPhone] = useState(existing?.phone ? formatPhone(existing.phone) : '');
  const [birthDate, setBirthDate] = useState(existing?.birthDate ? formatDateBR(existing.birthDate) : '');
  const [apartmentId, setApartmentId] = useState(existing?.apartmentId ?? '');
  const [residentType, setResidentType] = useState<ResidentType>(existing?.residentType ?? 'owner');
  const [photoURL, setPhotoURL] = useState<string>(existing?.photoURL ?? '');
  const [status, setStatus] = useState<'active' | 'inactive'>(existing?.status ?? 'active');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (role === 'resident') {
      getApartments().then(setApartments);
    }
  }, [role]);

  // ─── Masked Inputs ───────────────────────────────────────────────────
  const handleCPFChange = (value: string) => {
    setCpf(formatCPF(value));
    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: '' }));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(formatDateInput(value));
    if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: '' }));
  };

  // ─── Validation ──────────────────────────────────────────────────────
  const validate = useCallback(async (): Promise<boolean> => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Nome é obrigatório';

    const rawCpf = cpf.replace(/\D/g, '');
    if (!rawCpf) e.cpf = 'CPF é obrigatório';
    else if (!isValidCPF(rawCpf)) e.cpf = 'CPF inválido';

    if (!rg.trim()) e.rg = 'RG é obrigatório';

    if (!email.trim()) e.email = 'E-mail é obrigatório';
    else if (!isValidEmail(email)) e.email = 'E-mail inválido';

    const rawPhone = phone.replace(/\D/g, '');
    if (!rawPhone) e.phone = 'Telefone é obrigatório';
    else if (!isValidPhone(rawPhone)) e.phone = 'Telefone inválido';

    if (!birthDate.trim()) e.birthDate = 'Data de nascimento é obrigatória';
    else {
      const iso = dateInputToISO(birthDate);
      if (!iso) e.birthDate = 'Data inválida (DD/MM/AAAA)';
    }

    if (role === 'resident') {
      if (!apartmentId) e.apartmentId = 'Unidade/Apartamento é obrigatório';
    }

    if (!existing && !password) e.password = 'Senha é obrigatória';
    else if (!existing && password.length < 6) e.password = 'Mínimo 6 caracteres';

    // Async: check duplicates (only if no basic errors on the field)
    try {
      if (!e.cpf) {
        const taken = await isUserCPFTaken(rawCpf, existing?.uid);
        if (taken) e.cpf = 'Este CPF já está cadastrado';
      }
      if (!e.email && !existing) {
        const taken = await isUserEmailTaken(email.trim());
        if (taken) e.email = 'Este e-mail já está cadastrado';
      }
      
      if (role === 'resident' && apartmentId && residentType === 'owner') {
        const taken = await isApartmentTakenByOwner(apartmentId, existing?.uid);
        if (taken) e.apartmentId = 'Esta unidade já possui um proprietário registrado.';
      }
      
      if (role === 'resident' && apartmentId && !e.apartmentId) {
        const apt = apartments.find(a => a.id === apartmentId);
        if (apt && apt.maxResidents) {
          const currentCount = await countResidentsInApartment(apartmentId);
          const isSameApartment = existing && existing.apartmentId === apartmentId;
          const futureCount = isSameApartment ? currentCount : currentCount + 1;
          if (futureCount > apt.maxResidents) {
            e.apartmentId = `Limite de ${apt.maxResidents} moradores atingido para esta unidade.`;
          }
        }
      }
    } catch (dbError) {
      console.warn('Erro ao acessar o Realtime Database para validar duplicados:', dbError);
      // We don't crash, we just let it show the warning or handle it.
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, cpf, rg, email, phone, birthDate, apartmentId, password, existing, role, residentType]);

  // ─── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    try {
      const isValid = await validate();
      if (!isValid) {
        Toast.show({ type: 'error', text1: 'Atenção', text2: 'Corrija os erros no formulário.' });
        Alert.alert('Atenção', 'Por favor, corrija os erros indicados no formulário.');
        setLoading(false);
        return;
      }

      const rawCpf = cpf.replace(/\D/g, '');
      const rawPhone = phone.replace(/\D/g, '');
      const isoDate = dateInputToISO(birthDate);

      const selectedApartment = apartments.find(a => a.id === apartmentId);

      if (existing) {
        await updateUser(existing.uid, {
          name: name.trim(),
          cpf: rawCpf,
          rg: rg.trim(),
          phone: rawPhone,
          birthDate: isoDate,
          apartmentId: role === 'resident' ? apartmentId : undefined,
          apartment: selectedApartment?.number ?? '', // Legacy support
          block: selectedApartment?.blockName ?? '',  // Legacy support
          residentType: role === 'resident' ? residentType : undefined,
          photoURL,
          status,
        });
        
        if (role === 'resident' && status === 'active' && apartmentId) {
          await updateApartmentOccupancy(apartmentId, 'occupied');
        }
        
        navigation.goBack();
        Toast.show({
          type: 'success',
          text1: 'Atualizado',
          text2: 'Dados atualizados com sucesso.',
        });
      } else {
        await registerUser(email.trim(), password, name.trim(), role, {
          apartmentId: role === 'resident' ? apartmentId : undefined,
          apartment: selectedApartment?.number ?? '', // Legacy support
          block: selectedApartment?.blockName ?? '',  // Legacy support
          phone: rawPhone,
          cpf: rawCpf,
          rg: rg.trim(),
          birthDate: isoDate,
          residentType: role === 'resident' ? residentType : undefined,
          photoURL,
        });
        
        if (role === 'resident' && apartmentId) {
          await updateApartmentOccupancy(apartmentId, 'occupied');
        }

        // Navigate to the listing after creation
        if (role === 'resident') {
          navigation.navigate('ResidentsList');
        } else if (role === 'gatekeeper') {
          navigation.navigate('GatekeepersList');
        } else if (role === 'syndic') {
          navigation.navigate('SyndicsList');
        } else {
          navigation.goBack();
        }

        Toast.show({
          type: 'success',
          text1: 'Cadastrado',
          text2: `${RoleLabels[role]} cadastrado com sucesso.`,
        });
      }
    } catch (err: any) {
      let msg = 'Erro ao salvar. Verifique os dados.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está sendo usado por outra conta.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'O formato do e-mail é inválido.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha informada é muito fraca (mínimo de 6 caracteres).';
      }

      Toast.show({
        type: 'error',
        text1: 'Falha no cadastro',
        text2: msg,
      });
      Alert.alert('Erro ao salvar', msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Clear error on focus ─────────────────────────────────────────────
  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {existing ? 'Editar' : 'Cadastrar'} {RoleLabels[role]}
        </Text>

        <View style={styles.form}>
          {/* Photo */}
          <PhotoPicker
            value={photoURL || undefined}
            onChange={setPhotoURL}
            label={`Foto do ${RoleLabels[role].toLowerCase()}`}
          />

          {/* Name */}
          <Input label="Nome completo *" value={name} onChangeText={(v) => { setName(v); clearError('name'); }}
            placeholder="Nome completo" error={errors.name}
            leftIcon={<User size={20} color={Colors.textSecondary} />} />

          {/* CPF */}
          <Input label="CPF *" value={cpf} onChangeText={handleCPFChange}
            keyboardType="numeric" placeholder="000.000.000-00" error={errors.cpf}
            leftIcon={<FileText size={20} color={Colors.textSecondary} />} />

          {/* RG */}
          <Input label="RG *" value={rg} onChangeText={(v) => { setRg(v); clearError('rg'); }}
            placeholder="00.000.000-0" error={errors.rg}
            leftIcon={<FileText size={20} color={Colors.textSecondary} />} />

          {/* Email */}
          <Input label="E-mail *" value={email} onChangeText={(v) => { setEmail(v); clearError('email'); }}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="email@exemplo.com" error={errors.email}
            leftIcon={<Mail size={20} color={Colors.textSecondary} />}
            editable={!existing} />

          {/* Phone */}
          <Input label="Telefone *" value={phone} onChangeText={handlePhoneChange}
            keyboardType="phone-pad" placeholder="(18) 99999-9999" error={errors.phone}
            leftIcon={<Smartphone size={20} color={Colors.textSecondary} />} />

          {/* Birth Date */}
          <Input label="Data de nascimento *" value={birthDate} onChangeText={handleBirthDateChange}
            keyboardType="numeric" placeholder="DD/MM/AAAA" error={errors.birthDate}
            leftIcon={<Calendar size={20} color={Colors.textSecondary} />} />

          {/* Apartment Selector (for residents) */}
          {role === 'resident' && (
            <>
              <Text style={styles.fieldLabel}>Unidade / Apartamento *</Text>
              <TouchableOpacity
                style={[styles.pickerButton, errors.apartmentId && styles.inputError]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <DoorOpen size={20} color={Colors.textSecondary} />
                <Text style={[styles.pickerText, !apartmentId && { color: Colors.textMuted }]}>
                  {apartmentId
                    ? (() => {
                        const apt = apartments.find(a => a.id === apartmentId);
                        return apt ? `${apt.blockName ? `${apt.blockName} - ` : ''}Apt ${apt.number}` : 'Selecionado';
                      })()
                    : 'Selecione uma unidade'}
                </Text>
              </TouchableOpacity>
              {errors.apartmentId ? <Text style={styles.errorText}>{errors.apartmentId}</Text> : null}

              {/* Resident Type */}
              <Text style={styles.fieldLabel}>Tipo de morador *</Text>
              <View style={styles.selectorRow}>
                {RESIDENT_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt.value}
                    style={[styles.selectorCard, residentType === rt.value && styles.selectorCardActive]}
                    onPress={() => setResidentType(rt.value)}
                    activeOpacity={0.8}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                      {rt.value === 'owner' 
                        ? <Home size={16} color={residentType === rt.value ? Colors.accent : Colors.textSecondary} /> 
                        : <ClipboardList size={16} color={residentType === rt.value ? Colors.accent : Colors.textSecondary} />}
                      <Text style={[styles.selectorLabel, residentType === rt.value && styles.selectorLabelActive]}>
                        {rt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Status (only when editing) */}
          {existing && (
            <>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.selectorRow}>
                {(['active', 'inactive'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.selectorCard, status === s && styles.selectorCardActive,
                      s === 'inactive' && status === s && styles.selectorCardInactive]}
                    onPress={() => setStatus(s)}
                    activeOpacity={0.8}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                      {s === 'active' 
                        ? <CheckCircle2 size={16} color={status === s ? Colors.accent : Colors.textSecondary} /> 
                        : <XCircle size={16} color={status === s ? Colors.error : Colors.textSecondary} />}
                      <Text style={[styles.selectorLabel, status === s && styles.selectorLabelActive,
                        s === 'inactive' && status === s && { color: Colors.error }]}>
                        {UserStatusLabels[s]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Password (only when creating) */}
          {!existing && (
            <Input label="Senha inicial *" value={password} onChangeText={(v) => { setPassword(v); clearError('password'); }}
              secureTextEntry placeholder="Mínimo 6 caracteres" error={errors.password}
              leftIcon={<Key size={20} color={Colors.textSecondary} />}
              hint="O usuário poderá alterar sua senha depois." />
          )}

          {/* Submit */}
          <Button
            title={existing ? 'Salvar alterações' : `Cadastrar ${RoleLabels[role]}`}
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
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  fieldLabel: {
    fontSize: Typography.sm, fontWeight: Typography.medium,
    color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.xs,
  },
  errorText: { color: Colors.error, fontSize: Typography.xs, marginTop: 4, marginLeft: 4 },
  aptCard: {
    padding: Spacing.md, backgroundColor: Colors.background, borderWidth: 1,
    borderColor: Colors.border, borderRadius: BorderRadius.md,
  },
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, height: 50, gap: Spacing.sm,
  },
  pickerText: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary },
  inputError: { borderColor: Colors.error, borderWidth: 1 },
  selectorRow: { flexDirection: 'row', gap: Spacing.md },
  selectorCard: {
    flex: 1, paddingVertical: Spacing.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  selectorCardActive: {
    borderColor: Colors.accent, backgroundColor: Colors.accent + '18',
  },
  selectorCardInactive: {
    borderColor: Colors.error, backgroundColor: Colors.error + '18',
  },
  selectorLabel: {
    fontSize: Typography.sm, fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  selectorLabelActive: {
    color: Colors.accent, fontWeight: Typography.semiBold,
  },
  saveBtn: { marginTop: Spacing.md },
});
