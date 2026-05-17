import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createReservation } from '../../../services/reservations.service';
import { subscribeToSpaces } from '../../../services/spaces.service';
import { Space } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { CalendarDays, Waves, Clock, ClipboardList } from 'lucide-react-native';

export const CreateReservationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSpaces(setSpaces);
    return unsub;
  }, []);

  const handleSave = async () => {
    if (!selectedSpace || !date || !startTime || !endTime) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Selecione o espaço, data e horários.' });
      return;
    }
    setLoading(true);
    try {
      await createReservation({
        spaceId: selectedSpace.id,
        spaceName: selectedSpace.name,
        userId: userProfile!.uid,
        userName: userProfile!.name,
        date, startTime, endTime, notes,
        status: 'pending',
        createdAt: Date.now(),
      });
      navigation.goBack();
      Toast.show({ type: 'success', text1: 'Reserva enviada', text2: 'Sua reserva aguarda aprovação do síndico.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível criar a reserva.' });
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
        <Text style={styles.title}>Nova reserva</Text>

        <Text style={styles.sectionLabel}>Selecione o espaço</Text>
        
        {spaces.filter((s) => s.active).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum espaço disponível para reserva no momento.</Text>
          </View>
        ) : (
          <View style={styles.spaceGrid}>
            {spaces.filter((s) => s.active).map((space) => (
              <TouchableOpacity
                key={space.id}
                style={[styles.spaceCard, selectedSpace?.id === space.id && styles.spaceCardActive]}
                onPress={() => setSelectedSpace(space)}
                activeOpacity={0.8}
              >
                <Waves size={28} color={selectedSpace?.id === space.id ? Colors.accent : Colors.textSecondary} style={{marginBottom: Spacing.xs}} />
                <Text style={[
                  styles.spaceName,
                  selectedSpace?.id === space.id && styles.spaceNameActive,
                ]}>
                  {space.name}
                </Text>
                <Text style={styles.spaceCapacity}>Até {space.capacity} pessoas</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedSpace && (
          <View style={styles.spaceRules}>
            <Text style={styles.rulesTitle}>Regras do espaço</Text>
            <Text style={styles.rulesText}>{selectedSpace.rules}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input label="Data (AAAA-MM-DD)" value={date} onChangeText={setDate}
            placeholder="2025-12-31" leftIcon={<CalendarDays size={20} color={Colors.textSecondary} />} />

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Input label="Início" value={startTime} onChangeText={setStartTime}
                placeholder="14:00" leftIcon={<Clock size={20} color={Colors.textSecondary} />} />
            </View>
            <View style={styles.timeInput}>
              <Input label="Fim" value={endTime} onChangeText={setEndTime}
                placeholder="18:00" leftIcon={<Clock size={20} color={Colors.textSecondary} />} />
            </View>
          </View>

          <Input label="Observações (opcional)" value={notes} onChangeText={setNotes}
            placeholder="Aniversário, confraternização..." multiline numberOfLines={3}
            style={styles.textarea} />

          <Button title="Enviar reserva" onPress={handleSave} loading={loading}
            fullWidth size="lg" style={styles.saveBtn} />
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
  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.semiBold,
    color: Colors.textSecondary, marginBottom: Spacing.sm,
  },
  spaceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  spaceCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  spaceCardActive: { borderColor: Colors.accent, backgroundColor: Colors.card },
  spaceIcon: { fontSize: 28, marginBottom: Spacing.xs },
  spaceName: {
    fontSize: Typography.base, fontWeight: Typography.semiBold,
    color: Colors.textSecondary, textAlign: 'center',
  },
  spaceNameActive: { color: Colors.accent },
  spaceCapacity: { fontSize: Typography.xs, color: Colors.textMuted },
  spaceRules: {
    backgroundColor: Colors.primaryLight + '22', borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  rulesTitle: {
    fontSize: Typography.sm, fontWeight: Typography.semiBold,
    color: Colors.primaryLight, marginBottom: Spacing.xs,
  },
  rulesText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  timeRow: { flexDirection: 'row', gap: Spacing.md },
  timeInput: { flex: 1 },
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm },
  saveBtn: { marginTop: Spacing.md },
  emptyContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
