import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { subscribeToBlocks, deleteBlock } from '../../../services/structure.service';
import { Block } from '../../../types';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { EmptyState } from '../../../components/common/EmptyState';
import { SkeletonList } from '../../../components/common/SkeletonLoader';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Building2 } from 'lucide-react-native';

export const BlocksListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<Block | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBlocks((list) => {
      setBlocks(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = (block: Block) => {
    setBlockToDelete(block);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!blockToDelete) return;
    setDeleting(true);
    try {
      await deleteBlock(blockToDelete.id);
      Toast.show({ type: 'success', text1: 'Excluído', text2: 'Bloco removido com sucesso.' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: err.message || 'Falha ao excluir bloco.' });
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
      setBlockToDelete(null);
    }
  };

  const renderBlock = ({ item }: { item: Block }) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Building2 size={24} color={Colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="Editar" variant="outline" size="sm"
          onPress={() => navigation.navigate('CreateEditBlock', { block: item })} />
        <Button title="Excluir" variant="danger" size="sm"
          onPress={() => handleDelete(item)} />
      </View>
    </Card>
  );

  if (loading) return <View style={styles.container}><SkeletonList count={4} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={blocks}
        keyExtractor={item => item.id}
        renderItem={renderBlock}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<Building2 size={48} color={Colors.textMuted} />}
            title="Nenhum bloco"
            subtitle="Adicione o primeiro bloco do condomínio."
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEditBlock')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmVisible}
        title="Excluir bloco"
        message={`Deseja excluir o bloco "${blockToDelete?.name}"? Apartamentos vinculados ficarão sem bloco.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
        variant="danger"
        loading={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  card: { gap: Spacing.md },
  header: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  description: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: Colors.textInverse, lineHeight: 32 },
});
