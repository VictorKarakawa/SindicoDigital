import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, FlatList,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createVisitor, updateVisitor } from '../../../services/visitors.service';
import { getResidents } from '../../../services/users.service';
import { useAuth } from '../../../context/AuthContext';
import { Visitor, VisitorType, UserProfile } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { PhotoPicker } from '../../../components/common/PhotoPicker';
import { SearchBar } from '../../../components/common/SearchBar';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { VisitorTypeLabels } from '../../../constants/roles';
import {
  User as UserIcon, FileText, Smartphone, CalendarDays, Clock, Mail, MessageSquare,
  Users, Wrench, Package,
} from 'lucide-react-native';
import {
  isValidCPF, isValidEmail, formatCPF, formatPhone, formatDateInput, dateInputToISO,
  formatDateBR,
} from '../../../utils/validators';

const VISITOR_TYPES: { value: VisitorType; label: string; Icon: React.FC<any> }[] = [
  { value: 'family',   label: 'Familiar',             Icon: Users },
  { value: 'service',  label: 'Prestador',            Icon: Wrench },
  { value: 'delivery', label: 'Entregador',           Icon: Package },
  { value: 'common',   label: 'Visitante',            Icon: UserIcon },
];

export const CreateEditVisitorScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: Visitor | undefined = route.params?.visitor;
  const { userProfile } = useAuth();

  // Form state
  const [name, setName] = useState(existing?.name ?? '');
  const [cpf, setCpf] = useState(existing?.cpf ? formatCPF(existing.cpf) : '');
  const [rg, setRg] = useState(existing?.rg ?? '');
  const [phone, setPhone] = useState(existing?.phone ? formatPhone(existing.phone) : '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [photoURL, setPhotoURL] = useState(existing?.photoURL ?? '');
  const [expectedDate, setExpectedDate] = useState(
    existing?.expectedDate ? formatDateBR(existing.expectedDate) : ''
  );
  const [expectedTime, setExpectedTime] = useState(existing?.expectedTime ?? '');
  const [visitorType, setVisitorType] = useState<VisitorType>(existing?.visitorType ?? 'common');
  const [observations, setObservations] = useState(existing?.observations ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Host selection
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [selectedHost, setSelectedHost] = useState<UserProfile | null>(null);
  const [hostSearch, setHostSearch] = useState('');
  const [showHostPicker, setShowHostPicker] = useState(false);

  useEffect(() => {
    const loadResidents = async () => {
      try {
        const list = await getResidents();
        setResidents(list);

        // Pre-select host if editing
        if (existing?.hostUserId) {
          const host = list.find((r) => r.uid === existing.hostUserId);
          if (host) setSelectedHost(host);
        } else if (userProfile?.role === 'resident') {
          // Auto-select current user if resident
          const self = list.find((r) => r.uid === userProfile.uid);
          if (self) setSelectedHost(self);
        }
      } catch {
        // Silently fail
      }
    };
    loadResidents();
  }, []);

  const filteredResidents = residents.filter((r) => {
    if (!hostSearch.trim()) return true;
    const q = hostSearch.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.apartment ?? '').includes(q);
  });

  // ─── Masked inputs ──────────────────────────────────────────────────
  const handleCPFChange = (v: string) => {
    setCpf(formatCPF(v));
    if (errors.cpf) setErrors((p) => ({ ...p, cpf: '' }));
  };

  const handlePhoneChange = (v: string) => {
    setPhone(formatPhone(v));
    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
  };

  const handleDateChange = (v: string) => {
    setExpectedDate(formatDateInput(v));
    if (errors.expectedDate) setErrors((p) => ({ ...p, expectedDate: '' }));
  };

  // ─── Validation ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Nome é obrigatório';

    const rawCpf = cpf.replace(/\D/g, '');
    if (!rawCpf) e.cpf = 'CPF é obrigatório';
    else if (!isValidCPF(rawCpf)) e.cpf = 'CPF inválido';

    if (email.trim() && !isValidEmail(email)) e.email = 'E-mail inválido';

    if (!expectedDate.trim()) e.expectedDate = 'Data é obrigatória';
    else {
      const iso = dateInputToISO(expectedDate);
      if (!iso) e.expectedDate = 'Data inválida (DD/MM/AAAA)';
    }

    if (!selectedHost) e.host = 'Morador responsável é obrigatório';

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
      const isoDate = dateInputToISO(expectedDate);
      const qrCode = `VISITOR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (existing) {
        await updateVisitor(existing.id, {
          name: name.trim(),
          cpf: rawCpf,
          rg: rg.trim(),
          phone: rawPhone,
          email: email.trim(),
          photoURL,
          expectedDate: isoDate,
          expectedTime,
          visitorType,
          observations: observations.trim(),
          hostUserId: selectedHost!.uid,
          hostName: selectedHost!.name,
          hostApartment: selectedHost!.apartment,
          hostBlock: selectedHost!.block,
        });
        navigation.goBack();
        Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Visitante atualizado com sucesso.' });
      } else {
        await createVisitor({
          name: name.trim(),
          cpf: rawCpf,
          rg: rg.trim(),
          phone: rawPhone,
          email: email.trim(),
          photoURL,
          expectedDate: isoDate,
          expectedTime,
          visitorType,
          observations: observations.trim(),
          hostUserId: selectedHost!.uid,
          hostName: selectedHost!.name,
          hostApartment: selectedHost!.apartment,
          hostBlock: selectedHost!.block,
          status: 'pending',
          qrCode,
          createdAt: Date.now(),
        });
        navigation.goBack();
        Toast.show({ type: 'success', text1: 'Cadastrado', text2: 'Visitante cadastrado com sucesso.' });
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
        <Text style={styles.title}>{existing ? 'Editar visitante' : 'Novo visitante'}</Text>

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

          {/* Visitor Type */}
          <Text style={styles.fieldLabel}>Tipo de visitante *</Text>
          <View style={styles.typeGrid}>
            {VISITOR_TYPES.map((vt) => (
              <TouchableOpacity
                key={vt.value}
                style={[styles.typeCard, visitorType === vt.value && styles.typeCardActive]}
                onPress={() => setVisitorType(vt.value)}
                activeOpacity={0.8}
              >
                <vt.Icon size={24} color={visitorType === vt.value ? Colors.accent : Colors.textSecondary} />
                <Text style={[styles.typeLabel, visitorType === vt.value && styles.typeLabelActive]}>
                  {vt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Host Selection */}
          <Text style={styles.fieldLabel}>Morador responsável *</Text>
          {selectedHost ? (
            <TouchableOpacity
              style={styles.hostSelected}
              onPress={() => setShowHostPicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{selectedHost.name}</Text>
                <Text style={styles.hostDetail}>
                  Bloco {selectedHost.block} – Apt. {selectedHost.apartment}
                </Text>
              </View>
              <Text style={styles.hostChange}>Alterar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.hostEmpty}
              onPress={() => setShowHostPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.hostEmptyText}>Selecionar morador</Text>
            </TouchableOpacity>
          )}
          {errors.host ? <Text style={styles.errorText}>{errors.host}</Text> : null}

          {/* Host Picker Dropdown */}
          {showHostPicker && (
            <View style={styles.hostDropdown}>
              <SearchBar
                value={hostSearch}
                onChangeText={setHostSearch}
                placeholder="Buscar morador..."
                debounceMs={200}
              />
              <View style={styles.hostList}>
                {filteredResidents.slice(0, 8).map((r) => (
                  <TouchableOpacity
                    key={r.uid}
                    style={styles.hostOption}
                    onPress={() => {
                      setSelectedHost(r);
                      setShowHostPicker(false);
                      setHostSearch('');
                      clearError('host');
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.hostOptionName}>{r.name}</Text>
                    <Text style={styles.hostOptionDetail}>
                      Bloco {r.block} – Apt. {r.apartment}
                    </Text>
                  </TouchableOpacity>
                ))}
                {filteredResidents.length === 0 && (
                  <Text style={styles.hostNoResults}>Nenhum morador encontrado</Text>
                )}
              </View>
            </View>
          )}

          {/* Date & Time */}
          <View style={styles.row}>
            <View style={styles.half}>
              <Input label="Data da visita *" value={expectedDate} onChangeText={handleDateChange}
                keyboardType="numeric" placeholder="DD/MM/AAAA" error={errors.expectedDate}
                leftIcon={<CalendarDays size={20} color={Colors.textSecondary} />} />
            </View>
            <View style={styles.half}>
              <Input label="Horário previsto" value={expectedTime} onChangeText={setExpectedTime}
                placeholder="14:00"
                leftIcon={<Clock size={20} color={Colors.textSecondary} />} />
            </View>
          </View>

          {/* Observations */}
          <Input label="Observações" value={observations} onChangeText={setObservations}
            placeholder="Informações adicionais..." multiline numberOfLines={3}
            leftIcon={<MessageSquare size={20} color={Colors.textSecondary} />}
            style={{ minHeight: 80, textAlignVertical: 'top' }} />

          {!existing && (
            <View style={styles.qrHint}>
              <Text style={styles.qrHintText}>
                Um QR Code será gerado automaticamente após o cadastro.
              </Text>
            </View>
          )}

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
  fieldLabel: {
    color: Colors.textSecondary, fontSize: Typography.sm,
    fontWeight: Typography.medium, marginBottom: Spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  typeCard: {
    flexBasis: '47%', flexGrow: 1,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.card,
    alignItems: 'center', gap: 4,
  },
  typeCardActive: {
    borderColor: Colors.accent, backgroundColor: Colors.accent + '18',
  },
  typeLabel: {
    fontSize: Typography.xs, fontWeight: Typography.medium,
    color: Colors.textSecondary, textAlign: 'center',
  },
  typeLabelActive: {
    color: Colors.accent, fontWeight: Typography.semiBold,
  },
  hostSelected: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.accent,
    marginBottom: Spacing.base, justifyContent: 'space-between',
  },
  hostInfo: { flex: 1 },
  hostName: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  hostDetail: { fontSize: Typography.sm, color: Colors.textSecondary },
  hostChange: { color: Colors.accent, fontSize: Typography.sm, fontWeight: Typography.semiBold },
  hostEmpty: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: Spacing.base, alignItems: 'center',
    borderStyle: 'dashed',
  },
  hostEmptyText: { color: Colors.textMuted, fontSize: Typography.base },
  errorText: { color: Colors.error, fontSize: Typography.xs, marginTop: -Spacing.sm, marginBottom: Spacing.sm },
  hostDropdown: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.sm,
    marginBottom: Spacing.base, maxHeight: 300,
  },
  hostList: { marginTop: Spacing.sm },
  hostOption: {
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  hostOptionName: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
  hostOptionDetail: { fontSize: Typography.sm, color: Colors.textSecondary },
  hostNoResults: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center', padding: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  qrHint: {
    backgroundColor: Colors.primaryLight + '22',
    borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  qrHintText: { color: Colors.primaryLight, fontSize: Typography.sm },
  saveBtn: { marginTop: Spacing.md },
});
