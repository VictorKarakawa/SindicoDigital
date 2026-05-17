import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { createNotice, updateNotice } from '../../../services/notices.service';
import { useAuth } from '../../../context/AuthContext';
import { Notice, NoticePriority } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Pencil, FileText, Pin } from 'lucide-react-native';

const PRIORITIES: { value: NoticePriority; label: string; color: string }[] = [
  { value: 'low',    label: 'Baixa',   color: Colors.success },
  { value: 'medium', label: 'Média',   color: Colors.warning },
  { value: 'high',   label: 'Alta',    color: Colors.error },
  { value: 'urgent', label: 'Urgente', color: Colors.error },
];

export const CreateEditNoticeScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: Notice | undefined = route.params?.notice;
  const { userProfile } = useAuth();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [priority, setPriority] = useState<NoticePriority>(existing?.priority ?? 'medium');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha título e conteúdo.' });
      return;
    }
    setLoading(true);
    try {
      if (existing) {
        await updateNotice(existing.id, { title, content, priority });
        navigation.goBack();
        Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Aviso salvo com sucesso.' });
      } else {
        await createNotice({
          title, content, priority,
          authorId: userProfile!.uid,
          authorName: userProfile!.name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        navigation.navigate('NoticesList');
        Toast.show({ type: 'success', text1: 'Publicado', text2: 'Aviso publicado com sucesso.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar o aviso.' });
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
        <Text style={styles.title}>{existing ? 'Editar aviso' : 'Novo aviso'}</Text>

        <Input label="Título" value={title} onChangeText={setTitle}
          placeholder="Título do aviso"
          leftIcon={<Pin size={20} color={Colors.textSecondary} />} />

        <Input label="Conteúdo" value={content} onChangeText={setContent}
          placeholder="Descreva o aviso com detalhes..."
          multiline numberOfLines={6}
          style={styles.textarea} />

        <Text style={styles.sectionLabel}>Prioridade</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <Button
              key={p.value}
              title={p.label}
              variant={priority === p.value ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setPriority(p.value)}
              style={[
                styles.priorityBtn,
                priority === p.value && { backgroundColor: p.color, borderColor: p.color },
              ]}
            />
          ))}
        </View>

        <Button
          title={existing ? 'Salvar alterações' : 'Publicar aviso'}
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
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.xl,
  },
  ico: { fontSize: 16 },
  textarea: { height: 120, textAlignVertical: 'top', paddingTop: Spacing.md },
  sectionLabel: {
    fontSize: Typography.sm, fontWeight: Typography.semiBold,
    color: Colors.textSecondary, marginBottom: Spacing.sm,
  },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  priorityBtn: { flex: 1, minWidth: '45%' },
  saveBtn: { marginTop: Spacing.md },
});
