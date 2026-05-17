import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { subscribeToUsersByRole, deleteUserEntry } from '../../services/users.service';
import { UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { RoleLabels, ResidentTypeLabels, UserStatusLabels } from '../../constants/roles';
import { formatCPF, formatPhone } from '../../utils/validators';
import { ArrowDownAZ, ArrowDownWideNarrow, Home, ShieldCheck } from 'lucide-react-native';

type SortMode = 'name' | 'date';

export const UsersListScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const { userProfile } = useAuth();
  const isGatekeeper = userProfile?.role === 'gatekeeper';
  const role: UserRole = route.params?.role ?? 'resident';
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('name');

  // Confirm modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUsersByRole(role, (list) => {
      setUsers(list);
      setLoading(false);
    });
    return unsub;
  }, [role]);

  // ─── Filter & Sort ──────────────────────────────────────────────────
  const filteredUsers = users
    .filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const cpfClean = (u.cpf ?? '').replace(/\D/g, '');
      return (
        u.name.toLowerCase().includes(q) ||
        cpfClean.includes(q.replace(/\D/g, '')) ||
        (u.email ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      return b.createdAt - a.createdAt;
    });

  // ─── Delete Handlers ───────────────────────────────────────────────
  const handleDelete = (user: UserProfile) => {
    setUserToDelete(user);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUserEntry(userToDelete.uid);
      Toast.show({
        type: 'success',
        text1: 'Excluído',
        text2: `${userToDelete.name} foi removido do sistema.`,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao excluir',
        text2: 'Não foi possível remover o registro. Tente novamente.',
      });
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmVisible(false);
    setUserToDelete(null);
  };

  // ─── Toggle Sort ───────────────────────────────────────────────────
  const toggleSort = () => {
    setSortMode((prev) => (prev === 'name' ? 'date' : 'name'));
  };

  // ─── Render ────────────────────────────────────────────────────────
  const renderUser = ({ item }: { item: UserProfile }) => {
    const isInactive = item.status === 'inactive';
    return (
      <Card style={StyleSheet.flatten([styles.card, isInactive ? styles.cardInactive : undefined])}>
        <View style={styles.cardHeader}>
          {/* Avatar / Photo */}
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Badge
                label={UserStatusLabels[item.status] ?? 'Ativo'}
                color={item.status === 'active' ? 'success' : 'error'}
              />
            </View>
            <Text style={styles.email}>{item.email}</Text>
            {item.cpf ? (
              <Text style={styles.detail}>CPF: {formatCPF(item.cpf)}</Text>
            ) : null}
            {role === 'resident' && item.block && (
              <Text style={styles.detail}>
                Bloco {item.block} – Apt. {item.apartment}
                {item.residentType ? ` • ${ResidentTypeLabels[item.residentType]}` : ''}
              </Text>
            )}
            {item.phone ? <Text style={styles.detail}>{formatPhone(item.phone)}</Text> : null}
          </View>
        </View>
        {!isGatekeeper && (
          <View style={styles.actions}>
            <Button title="Editar" variant="outline" size="sm"
              onPress={() => navigation.navigate('CreateEditUser', { user: item, role })} />
            <Button title="Excluir" variant="danger" size="sm"
              onPress={() => handleDelete(item)} />
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonList count={5} variant="card" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search & Sort */}
      <View style={styles.toolbar}>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Buscar ${RoleLabels[role].toLowerCase()} por nome, CPF...`}
          />
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort} activeOpacity={0.7}>
          {sortMode === 'name' ? (
            <ArrowDownAZ size={20} color={Colors.accent} />
          ) : (
            <ArrowDownWideNarrow size={20} color={Colors.accent} />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={role === 'resident' ? <Home size={48} color={Colors.textMuted} /> : <ShieldCheck size={48} color={Colors.textMuted} />}
            title={searchQuery
              ? `Nenhum resultado para "${searchQuery}"`
              : `Nenhum ${RoleLabels[role].toLowerCase()} cadastrado`}
            subtitle={searchQuery
              ? 'Tente buscar por outro nome ou CPF.'
              : 'Toque no botão + para adicionar.'}
          />
        }
      />

      {/* FAB */}
      {!isGatekeeper && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEditUser', { role })}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={confirmVisible}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir ${userToDelete?.name ?? 'este registro'}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
        loading={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    gap: Spacing.sm,
  },
  searchWrapper: { flex: 1 },
  sortBtn: {
    width: 46, height: 46,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  card: { gap: Spacing.md },
  cardInactive: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: Typography.xl, fontWeight: Typography.bold },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  name: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary, flex: 1 },
  email: { fontSize: Typography.sm, color: Colors.textMuted },
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
