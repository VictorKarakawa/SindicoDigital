import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { subscribeToReservations, updateReservation, deleteReservation } from '../../../services/reservations.service';
import { subscribeToSpaces } from '../../../services/spaces.service';
import { Reservation, Space } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing } from '../../../constants/typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Waves, Clock, User, CheckCircle2, XCircle } from 'lucide-react-native';

const statusConfig: Record<string, { label: string; color: any }> = {
  pending:   { label: 'Pendente',  color: 'warning' },
  approved:  { label: 'Aprovada',  color: 'success' },
  cancelled: { label: 'Cancelada', color: 'error' },
};

export const ReservationsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const isSyndic = userProfile?.role === 'syndic';

  useEffect(() => {
    const u1 = subscribeToReservations((all) => {
      if (userProfile?.role === 'resident') {
        setReservations(all.filter((r) => r.userId === userProfile.uid));
      } else {
        setReservations(all);
      }
    });
    const u2 = subscribeToSpaces(setSpaces);
    return () => { u1(); u2(); };
  }, [userProfile]);

  const getSpaceName = (id: string) => spaces.find((s) => s.id === id)?.name ?? id;

  const handleApprove = async (id: string) => {
    await updateReservation(id, { status: 'approved' });
  };
  const handleCancel = async (id: string) => {
    await updateReservation(id, { status: 'cancelled' });
  };

  const renderReservation = ({ item }: { item: Reservation }) => {
    const status = statusConfig[item.status] ?? { label: item.status, color: 'muted' };
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Badge label={status.label} color={status.color} />
          <Text style={styles.date}>
            {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
          </Text>
        </View>
        <View style={{flexDirection:"row", alignItems:"center", gap:6}}><Waves size={20} color={Colors.textPrimary}/><Text style={styles.spaceName}>{item.spaceName ?? getSpaceName(item.spaceId)}</Text></View>
        <View style={{flexDirection:"row", alignItems:"center", gap:6}}><Clock size={16} color={Colors.textSecondary}/><Text style={styles.time}>{item.startTime} – {item.endTime}</Text></View>
        {item.userName && <View style={{flexDirection:"row", alignItems:"center", gap:6}}><User size={14} color={Colors.textMuted}/><Text style={styles.user}>{item.userName}</Text></View>}
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

        {isSyndic && item.status === 'pending' && (
          <View style={styles.actions}>
            <Button title="Aprovar" variant="secondary" size="sm"
              onPress={() => handleApprove(item.id)} />
            <Button title="Recusar" variant="danger" size="sm"
              onPress={() => handleCancel(item.id)} />
          </View>
        )}

        {item.userId === userProfile?.uid && item.status === 'pending' && (
          <Button title="Cancelar reserva" variant="danger" size="sm"
            onPress={() => handleCancel(item.id)} style={styles.cancelBtn} />
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservation}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon={<CalendarDays size={48} color={Colors.textMuted} />} title="Nenhuma reserva"
            subtitle="Não há reservas registradas." />
        }
      />
      {userProfile?.role !== 'gatekeeper' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateReservation')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  card: { gap: Spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: Colors.textMuted, fontSize: Typography.xs },
  spaceName: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary,
  },
  time: { color: Colors.textSecondary, fontSize: Typography.base },
  user: { color: Colors.textMuted, fontSize: Typography.sm },
  notes: { color: Colors.textSecondary, fontSize: Typography.sm, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: Colors.textInverse, lineHeight: 32 },
});
