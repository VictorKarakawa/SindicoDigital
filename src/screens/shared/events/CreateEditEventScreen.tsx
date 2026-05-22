import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { CalendarDays, FileText, MapPin, Pencil } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Spacing, Typography } from '../../../constants/typography';
import { CondominiumEvent } from '../../../types';
import { createEvent, updateEvent } from '../../../services/events.service';
import { createLogEntry, logAction } from '../../../services/logs.service';

const toInputDateTime = (timestamp?: number) => {
  const date = timestamp ? new Date(timestamp) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
};

const parseDateTime = (date: string, time: string) => {
  const [day, month, year] = date.split('/').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  if (!day || !month || !year || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

export const CreateEditEventScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const existing: CondominiumEvent | undefined = route.params?.event;
  const { userProfile } = useAuth();
  const initial = toInputDateTime(existing?.date);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const timestamp = parseDateTime(date, time);

    if (!title.trim() || !description.trim() || !location.trim() || !timestamp) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha todos os campos com data e horário válidos.' });
      return;
    }

    setLoading(true);

    try {
      if (existing) {
        await updateEvent(existing.id, {
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          date: timestamp,
          updatedAt: Date.now(),
        });

        if (userProfile) {
          await logAction(createLogEntry(userProfile.uid, userProfile.name, 'update', 'event', existing.id, title.trim(), 'Evento atualizado'));
        }

        Toast.show({ type: 'success', text1: 'Evento atualizado' });
        navigation.goBack();
        return;
      }

      const eventId = await createEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date: timestamp,
        authorId: userProfile!.uid,
        authorName: userProfile!.name,
        createdAt: Date.now(),
      });

      if (userProfile) {
        await logAction(createLogEntry(userProfile.uid, userProfile.name, 'create', 'event', eventId, title.trim(), 'Evento criado'));
      }

      Toast.show({ type: 'success', text1: 'Evento criado' });
      navigation.navigate('EventsList');
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o evento.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{existing ? 'Editar evento' : 'Novo evento'}</Text>

        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Assembleia ordinária"
          leftIcon={<Pencil size={20} color={Colors.textSecondary} />}
        />

        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o objetivo do evento..."
          multiline
          numberOfLines={5}
          style={styles.textarea}
          leftIcon={<FileText size={20} color={Colors.textSecondary} />}
        />

        <Input
          label="Local"
          value={location}
          onChangeText={setLocation}
          placeholder="Ex: Salão de festas"
          leftIcon={<MapPin size={20} color={Colors.textSecondary} />}
        />

        <Input
          label="Data"
          value={date}
          onChangeText={setDate}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          leftIcon={<CalendarDays size={20} color={Colors.textSecondary} />}
        />

        <Input
          label="Horário"
          value={time}
          onChangeText={setTime}
          placeholder="HH:mm"
          keyboardType="numeric"
          leftIcon={<CalendarDays size={20} color={Colors.textSecondary} />}
        />

        <Button
          title={existing ? 'Salvar alterações' : 'Criar evento'}
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, paddingBottom: 60 },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  textarea: { height: 120, textAlignVertical: 'top', paddingTop: Spacing.md },
  saveBtn: { marginTop: Spacing.md },
});
