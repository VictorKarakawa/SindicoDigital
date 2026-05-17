import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createVoting } from '../../../services/votings.service';
import { useAuth } from '../../../context/AuthContext';
import { VotingOption } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Vote, FileText, Calendar, Circle, X } from 'lucide-react-native';

export const CreateVotingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);

  const addOption = () => setOptions([...options, '']);
  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };
  const updateOption = (i: number, v: string) => {
    const updated = [...options];
    updated[i] = v;
    setOptions(updated);
  };

  const handleSave = async () => {
    if (!title.trim() || options.some((o) => !o.trim())) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha o título e todas as opções.' });
      return;
    }
    const closingDate = closesAt ? new Date(closesAt).getTime() : Date.now() + 7 * 86400000;
    const opts: VotingOption[] = options.map((label, i) => ({
      id: `opt_${i}_${Date.now()}`,
      label,
      votes: 0,
    }));

    setLoading(true);
    try {
      await createVoting({
        title, description, options: opts,
        status: 'open', authorId: userProfile!.uid,
        createdAt: Date.now(), closesAt: closingDate,
      });
      navigation.goBack();
      Toast.show({ type: 'success', text1: 'Criada', text2: 'Votação criada com sucesso.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível criar a votação.' });
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
        <Text style={styles.title}>Nova votação</Text>

        <Input label="Título da votação" value={title} onChangeText={setTitle}
          placeholder="Ex: Aprovação de nova taxa condominial"
          leftIcon={<Vote size={20} color={Colors.textSecondary} />} />

        <Input label="Descrição" value={description} onChangeText={setDescription}
          placeholder="Detalhe o contexto da votação..."
          multiline numberOfLines={4} style={styles.textarea} />

        <Input label="Encerra em (dd/mm/aaaa)" value={closesAt} onChangeText={setClosesAt}
          placeholder="Deixe em branco para 7 dias"
          leftIcon={<Calendar size={20} color={Colors.textSecondary} />} />

        <Text style={styles.sectionLabel}>Opções de voto</Text>
        {options.map((opt, i) => (
          <View key={i} style={styles.optRow}>
            <View style={styles.optInput}>
              <Input
                value={opt}
                onChangeText={(v) => updateOption(i, v)}
                placeholder={`Opção ${i + 1}`}
                leftIcon={<Circle size={20} color={Colors.textSecondary} />}
              />
            </View>
            {options.length > 2 && (
              <TouchableOpacity onPress={() => removeOption(i)} style={styles.removeBtn}>
                <X size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Button title="+ Adicionar opção" variant="outline" onPress={addOption}
          style={styles.addOptBtn} />

        <Button title="Criar votação" onPress={handleSave} loading={loading}
          fullWidth size="lg" style={styles.saveBtn} />
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
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: Spacing.md },
  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.semiBold,
    color: Colors.textSecondary, marginBottom: Spacing.sm,
  },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  optInput: { flex: 1 },
  removeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.error + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  addOptBtn: { marginBottom: Spacing.md },
  saveBtn: { marginTop: Spacing.md },
});
