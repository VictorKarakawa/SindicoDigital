import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { CalendarDays, MapPin, Plus, Trash2, Pencil } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../../constants/typography';
import { CondominiumEvent } from '../../../types';
import { deleteEvent, subscribeToEvents } from '../../../services/events.service';
import { createLogEntry, logAction } from '../../../services/logs.service';

export const EventsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<CondominiumEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isSyndic = userProfile?.role === 'syndic';

  useEffect(() => {
    const unsubscribe = subscribeToEvents(setEvents);
    return unsubscribe;
  }, []);

  const groupedEvents = useMemo(() => {
    const now = Date.now();
    const upcoming = events.filter((event) => event.date >= now);
    const past = events.filter((event) => event.date < now);
    return [...upcoming, ...past];
  }, [events]);

  const handleDelete = async (event: CondominiumEvent) => {
    try {
      await deleteEvent(event.id);

      if (userProfile) {
        await logAction(createLogEntry(
          userProfile.uid,
          userProfile.name,
          'delete',
          'event',
          event.id,
          event.title,
          'Evento removido'
        ));
      }

      Toast.show({ type: 'success', text1: 'Evento removido' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível remover o evento.' });
    }
  };

  const renderEvent = ({ item }: { item: CondominiumEvent }) => {
    const isPast = item.date < Date.now();

    return (
      <Card style={StyleSheet.flatten([styles.eventCard, isPast ? styles.pastEvent : undefined])}>
        <View style={styles.eventHeader}>
          <View style={styles.dateBox}>
            <Text style={styles.day}>{format(new Date(item.date), 'dd')}</Text>
            <Text style={styles.month}>{format(new Date(item.date), 'MMM', { locale: ptBR })}</Text>
          </View>

          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDescription}>{item.description}</Text>

            <View style={styles.metaRow}>
              <CalendarDays size={15} color={Colors.textMuted} />
              <Text style={styles.metaText}>
                {format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MapPin size={15} color={Colors.textMuted} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          </View>
        </View>

        {isSyndic && (
          <View style={styles.actions}>
            <Button
              title="Editar"
              variant="outline"
              size="sm"
              leftIcon={<Pencil size={14} color={Colors.accent} />}
              onPress={() => navigation.navigate('CreateEditEvent', { event: item })}
            />
            <Button
              title="Excluir"
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} color={Colors.white} />}
              onPress={() => handleDelete(item)}
            />
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Colors.accent} />}
        ListEmptyComponent={
          <EmptyState
            icon={<CalendarDays size={48} color={Colors.textMuted} />}
            title="Nenhum evento"
            subtitle="Quando houver assembleias, manutenções ou encontros, eles aparecerão aqui."
          />
        }
      />

      {isSyndic && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEditEvent', {})}
          activeOpacity={0.85}
        >
          <Plus size={28} color={Colors.textInverse} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  eventCard: { gap: Spacing.md },
  pastEvent: { opacity: 0.62 },
  eventHeader: { flexDirection: 'row', gap: Spacing.md },
  dateBox: {
    width: 58,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  day: { color: Colors.accent, fontSize: Typography['2xl'], fontWeight: Typography.bold },
  month: { color: Colors.textSecondary, fontSize: Typography.xs, textTransform: 'uppercase' },
  eventContent: { flex: 1, gap: Spacing.xs },
  eventTitle: { color: Colors.textPrimary, fontSize: Typography.lg, fontWeight: Typography.semiBold },
  eventDescription: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { color: Colors.textMuted, fontSize: Typography.xs, flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
