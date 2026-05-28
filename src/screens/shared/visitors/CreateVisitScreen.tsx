import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createVisit } from '../../../services/visits.service';
import { getResidents } from '../../../services/users.service';
import { useAuth } from '../../../context/AuthContext';
import { Visitor, VisitorType, UserProfile } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { SearchBar } from '../../../components/common/SearchBar';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import {
  User as UserIcon, CalendarDays, Clock, MessageSquare,
  Users, Wrench, Package,
} from 'lucide-react-native';
import {
  formatDateInput, dateInputToISO, formatDateBR
} from '../../../utils/validators';
import { format } from 'date-fns';

const VISITOR_TYPES: { value: VisitorType; label: string; Icon: React.FC<any> }[] = [
  { value: 'family',   label: 'Familiar',             Icon: Users },
  { value: 'service',  label: 'Prestador',            Icon: Wrench },
  { value: 'delivery', label: 'Entregador',           Icon: Package },
  { value: 'common',   label: 'Visitante',            Icon: UserIcon },
];

export const CreateVisitScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const visitor: Visitor = route.params?.visitor;
  const { userProfile } = useAuth();

  // Form state
  const [expectedDate, setExpectedDate] = useState('');
  const [expectedTime, setExpectedTime] = useState('');
  const [visitorType, setVisitorType] = useState<VisitorType>('common');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Host selection
  const [residents, setResidents] = useState<UserProfile[]>([]);
  const [selectedHost, setSelectedHost] = useState<UserProfile | null>(null);
  const [hostSearch, setHostSearch] = useState('');
  const [showHostPicker, setShowHostPicker] = useState(false);

  useEffect(() => {
    if (!visitor) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Visitante não informado.' });
      navigation.goBack();
      return;
    }

    const loadResidents = async () => {
      try {
        const list = await getResidents();
        setResidents(list);

        if (userProfile?.role === 'resident') {
          // Auto-select current user if resident
          const self = list.find((r) => r.uid === userProfile.uid);
          if (self) setSelectedHost(self);
        }
      } catch {
        // Silently fail
      }
    };
    loadResidents();
  }, [visitor, userProfile]);

  const filteredResidents = residents.filter((r) => {
    if (!hostSearch.trim()) return true;
    const q = hostSearch.toLowerCase();
    return r.name.toLowerCase().includes(q) || (r.apartment ?? '').includes(q);
  });

  const handleDateChange = (v: string) => {
    setExpectedDate(formatDateInput(v));
    if (errors.expectedDate) setErrors((p) => ({ ...p, expectedDate: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!expectedDate.trim()) e.expectedDate = 'Data é obrigatória';
    else {
      const iso = dateInputToISO(expectedDate);
      if (!iso) e.expectedDate = 'Data inválida (DD/MM/AAAA)';
    }

    if (!selectedHost) e.host = 'Morador responsável é obrigatório';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Corrija os erros no formulário.' });
      return;
    }

    setLoading(true);
    try {
      const isoDate = dateInputToISO(expectedDate);
      const qrCode = `VISIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await createVisit({
        visitorId: visitor.id,
        visitorName: visitor.name,
        visitorCpf: visitor.cpf,
        visitorPhotoURL: visitor.photoURL,
        expectedDate: isoDate!,
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
      Toast.show({ type: 'success', text1: 'Visita Agendada', text2: 'A visita foi registrada com sucesso.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível registrar a visita.' });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const setNow = () => {
    const now = new Date();
    setExpectedDate(format(now, 'dd/MM/yyyy'));
    setExpectedTime(format(now, 'HH:mm'));
    if (errors.expectedDate) setErrors((p) => ({ ...p, expectedDate: '' }));
  };

  if (!visitor) return null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nova Visita</Text>
        
        <View style={styles.visitorCard}>
           <Text style={styles.visitorName}>{visitor.name}</Text>
           <Text style={styles.visitorDoc}>CPF: {visitor.cpf}</Text>
        </View>

        <View style={styles.form}>
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
          <View style={styles.dateHeader}>
            <TouchableOpacity onPress={setNow} style={styles.nowBtn} activeOpacity={0.7}>
              <Clock size={16} color={Colors.accent} />
              <Text style={styles.nowBtnText}>Preencher com momento atual</Text>
            </TouchableOpacity>
          </View>
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

          <View style={styles.qrHint}>
            <Text style={styles.qrHintText}>
              Um QR Code será gerado automaticamente para esta visita.
            </Text>
          </View>

          <Button
            title="Registrar Visita"
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
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  visitorCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  visitorName: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary
  },
  visitorDoc: {
    fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4
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
  dateHeader: {
    flexDirection: 'row', justifyContent: 'flex-end', marginBottom: Spacing.xs,
  },
  nowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accent + '15', paddingHorizontal: Spacing.sm,
    paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  nowBtnText: {
    color: Colors.accent, fontSize: Typography.xs, fontWeight: Typography.semiBold,
  },
});
