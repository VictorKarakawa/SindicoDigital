import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createSpace, updateSpace } from '../../../services/spaces.service';
import { Waves, Users } from 'lucide-react-native';
import { Space } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';

export const CreateEditSpaceScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: Space | undefined = route.params?.space;
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [capacity, setCapacity] = useState(String(existing?.capacity ?? ''));
  const [rules, setRules] = useState(existing?.rules ?? '');
  const [active, setActive] = useState(existing?.active ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !capacity) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Nome e capacidade são obrigatórios.' });
      return;
    }
    setLoading(true);
    try {
      if (existing) {
        await updateSpace(existing.id, {
          name, description, capacity: Number(capacity), rules, active,
        });
        navigation.goBack();
        Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Espaço atualizado com sucesso.' });
      } else {
        await createSpace({
          name, description, capacity: Number(capacity), rules, active,
        });
        navigation.goBack();
        Toast.show({ type: 'success', text1: 'Criado', text2: 'Espaço criado com sucesso.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o espaço.' });
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
        <Text style={styles.title}>{existing ? 'Editar espaço' : 'Novo espaço'}</Text>

        <View style={styles.form}>
          <Input label="Nome do espaço" value={name} onChangeText={setName}
            placeholder="Ex: Salão de festas" leftIcon={<Waves size={20} color={Colors.textSecondary} />} />

          <Input label="Descrição" value={description} onChangeText={setDescription}
            placeholder="Descreva o espaço..." multiline numberOfLines={3}
            style={styles.textarea} />

          <Input label="Capacidade (pessoas)" value={capacity} onChangeText={setCapacity}
            keyboardType="numeric" placeholder="50" leftIcon={<Users size={20} color={Colors.textSecondary} />} />

          <Input label="Regras de uso" value={rules} onChangeText={setRules}
            placeholder="Liste as regras do espaço..." multiline numberOfLines={4}
            style={styles.textarea} />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Espaço ativo (disponível para reserva)</Text>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={active ? Colors.white : Colors.textMuted}
            />
          </View>

          <Button
            title={existing ? 'Salvar alterações' : 'Cadastrar espaço'}
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
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg, paddingVertical: Spacing.sm,
  },
  switchLabel: { flex: 1, color: Colors.textSecondary, fontSize: Typography.base },
  saveBtn: { marginTop: Spacing.sm },
});
