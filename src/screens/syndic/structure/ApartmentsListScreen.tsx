import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { subscribeToApartments, deleteApartment } from '../../../services/structure.service';
import { Apartment, ApartmentStatus } from '../../../types';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { EmptyState } from '../../../components/common/EmptyState';
import { SkeletonList } from '../../../components/common/SkeletonLoader';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { DoorOpen } from 'lucide-react-native';
import { ApartmentTypeLabels, ApartmentStatusLabels } from '../../../constants/roles';

const statusColors: Record<ApartmentStatus, any> = {
  available: 'success',
  occupied: 'warning',
  inactive: 'error',
};

export const ApartmentsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApartmentStatus | 'all'>('all');
  
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<Apartment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToApartments((list) => {
      setApartments(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = filter === 'all' ? apartments : apartments.filter(a => a.status === filter);

  const handleDelete = (apartment: Apartment) => {
    setApartmentToDelete(apartment);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!apartmentToDelete) return;
    setDeleting(true);
    try {
      await deleteApartment(apartmentToDelete.id);
      Toast.show({ type: 'success', text1: 'Excluído', text2: 'Unidade removida com sucesso.' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Não permitido', text2: err.message || 'Falha ao excluir unidade.' });
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
      setApartmentToDelete(null);
    }
  };

  const renderApartment = ({ item }: { item: Apartment }) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <DoorOpen size={24} color={Colors.accent} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.number}>Nº {item.number}</Text>
            <Badge
              label={ApartmentStatusLabels[item.status]}
              color={statusColors[item.status]}
            />
          </View>
          <Text style={styles.detail}>
            {ApartmentTypeLabels[item.type]}
            {item.blockName ? ` • ${item.blockName}` : ''}
            {item.floor ? ` • Andar ${item.floor}` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="Editar" variant="outline" size="sm"
          onPress={() => navigation.navigate('CreateEditApartment', { apartment: item })} />
        <Button title="Excluir" variant="danger" size="sm"
          onPress={() => handleDelete(item)} />
      </View>
    </Card>
  );

  if (loading) return <View style={styles.container}><SkeletonList count={5} /></View>;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}
        contentContainerStyle={styles.filtersContent}>
        {([
          { value: 'all' as const, label: 'Todas' },
          { value: 'available' as const, label: 'Disponíveis' },
          { value: 'occupied' as const, label: 'Ocupadas' },
          { value: 'inactive' as const, label: 'Inativas' },
        ]).map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderApartment}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<DoorOpen size={48} color={Colors.textMuted} />}
            title="Nenhuma unidade"
            subtitle="Adicione as unidades (apartamentos, casas) do condomínio."
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEditApartment')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConfirmModal
        visible={confirmVisible}
        title="Excluir unidade"
        message={`Deseja excluir a unidade ${apartmentToDelete?.number}?`}
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
  filters: { flexGrow: 0 },
  filtersContent: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textMuted, fontSize: Typography.sm, fontWeight: Typography.medium },
  chipTextActive: { color: Colors.textInverse, fontWeight: Typography.semiBold },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  card: { gap: Spacing.md },
  header: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  number: { fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  detail: { fontSize: Typography.sm, color: Colors.textSecondary },
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
