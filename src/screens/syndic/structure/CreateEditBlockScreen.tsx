import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { createBlock, updateBlock } from '../../../services/structure.service';
import { Block } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Building2, AlignLeft } from 'lucide-react-native';

export const CreateEditBlockScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const existing: Block | undefined = route.params?.block;
  
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Nome do bloco é obrigatório.' });
      return;
    }

    setLoading(true);
    try {
      if (existing) {
        await updateBlock(existing.id, {
          name: name.trim(),
          description: description.trim(),
        });
        Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Bloco atualizado com sucesso.' });
      } else {
        await createBlock({
          name: name.trim(),
          description: description.trim(),
          createdAt: Date.now(),
        });
        Toast.show({ type: 'success', text1: 'Cadastrado', text2: 'Bloco criado com sucesso.' });
      }
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao salvar bloco.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{existing ? 'Editar Bloco' : 'Novo Bloco'}</Text>
      
      <View style={styles.form}>
        <Input
          label="Nome do Bloco *"
          value={name}
          onChangeText={setName}
          placeholder="Ex: Bloco A, Torre 1"
          leftIcon={<Building2 size={20} color={Colors.textSecondary} />}
        />
        
        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Observações adicionais..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
          leftIcon={<AlignLeft size={20} color={Colors.textSecondary} />}
        />
        
        <Button
          title={existing ? 'Salvar alterações' : 'Criar bloco'}
          onPress={handleSave}
          loading={loading}
          size="lg"
          style={styles.saveBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.xl,
  },
  form: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  saveBtn: { marginTop: Spacing.md },
});
