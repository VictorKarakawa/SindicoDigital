import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { Users, FileText, CalendarDays, Home, Wrench, Package, User } from 'lucide-react-native';
import { subscribeToVisits, searchVisits } from '../../../services/visits.service';
import { Visit, VisitorType } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';
import { SkeletonList } from '../../../components/common/SkeletonLoader';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { VisitorTypeLabels } from '../../../constants/roles';
import { formatCPF, formatDateBR } from '../../../utils/validators';

const statusConfig: Record<string, { label: string; color: any }> = {
  pending:     { label: 'Aguardando',      color: 'warning' },
  approved:    { label: 'Liberado',        color: 'info' },
  checked_in:  { label: 'No condomínio',   color: 'success' },
  checked_out: { label: 'Saiu',            color: 'muted' },
  denied:      { label: 'Negado',          color: 'error' },
};

const visitorTypeIcons: Record<VisitorType, React.ReactNode> = {
  family:   <Users size={14} color={Colors.textSecondary} />,
  service:  <Wrench size={14} color={Colors.textSecondary} />,
  delivery: <Package size={14} color={Colors.textSecondary} />,
  common:   <User size={14} color={Colors.textSecondary} />,
};

type FilterStatus = 'all' | 'pending' | 'approved' | 'checked_in' | 'checked_out';

export const VisitsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    const unsub = subscribeToVisits((all) => {
      if (userProfile?.role === 'resident') {
        setAllVisits(all.filter((v) => v.hostUserId === userProfile.uid));
      } else {
        setAllVisits(all);
      }
      setLoading(false);
    });
    return unsub;
  }, [userProfile]);

  const filteredVisits = searchVisits(searchQuery, allVisits)
    .filter((v) => {
      if (filterStatus === 'all') return true;
      return v.status === filterStatus;
    });

  const renderVisit = ({ item }: { item: Visit }) => {
    const status = statusConfig[item.status] ?? { label: item.status, color: 'muted' };
    const typeIcon = visitorTypeIcons[item.visitorType] ?? <User size={14} color={Colors.textSecondary} />;
    
    return (
      <TouchableOpacity
        onPress={() => {
          // Navigating to detail might be different now, maybe visit detail or visitor detail
          navigation.navigate('VisitorDetail', { visitorId: item.visitorId });
        }}
        activeOpacity={0.85}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.nameSection}>
              {item.visitorPhotoURL ? (
                <Image source={{ uri: item.visitorPhotoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.visitorName?.charAt(0).toUpperCase() || 'V'}</Text>
                </View>
              )}
              <View style={styles.nameInfo}>
                <Text style={styles.visitorName} numberOfLines={1}>{item.visitorName || 'Desconhecido'}</Text>
                <View style={styles.typeRow}>
                  {typeIcon}
                  <Text style={styles.visitorType}>
                    {VisitorTypeLabels[item.visitorType] ?? 'Visitante'}
                  </Text>
                </View>
              </View>
            </View>
            <Badge label={status.label} color={status.color} />
          </View>

          <View style={styles.detailsGrid}>
            {item.visitorCpf ? (
              <View style={styles.detailRow}>
                <FileText color={Colors.textSecondary} size={14} />
                <Text style={styles.detail}>CPF: {formatCPF(item.visitorCpf)}</Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <CalendarDays color={Colors.textSecondary} size={14} />
              <Text style={styles.detail}>
                {formatDateBR(item.expectedDate)}
                {item.expectedTime ? ` às ${item.expectedTime}` : ''}
              </Text>
            </View>
            {item.hostName ? (
              <View style={styles.detailRow}>
                <Home color={Colors.textSecondary} size={14} />
                <Text style={styles.detail}>
                  {item.hostName}
                  {item.hostBlock ? ` – Bloco ${item.hostBlock}` : ''}
                  {item.hostApartment ? ` Apt. ${item.hostApartment}` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonList count={4} variant="card" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar visitas..."
        />
        <TouchableOpacity 
          style={styles.swapBtn} 
          onPress={() => navigation.navigate('VisitorsList')}
          activeOpacity={0.8}
        >
          <Users size={20} color={Colors.accent} />
          <Text style={styles.swapBtnText}>Gerenciar Visitantes Cadastrados</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {([
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Aguardando' },
          { key: 'approved', label: 'Liberados' },
          { key: 'checked_in', label: 'Dentro' },
          { key: 'checked_out', label: 'Saíram' },
        ] as { key: FilterStatus; label: string }[]).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filterStatus === f.key && styles.filterChipActive]}
            onPress={() => setFilterStatus(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, filterStatus === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredVisits}
        keyExtractor={(item) => item.id}
        renderItem={renderVisit}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<Users size={48} color={Colors.textMuted} />}
            title={searchQuery ? `Nenhum resultado` : 'Nenhuma visita'}
            subtitle="Não há visitas registradas."
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEditVisitor', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  swapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.accent + '15', padding: Spacing.sm,
    borderRadius: BorderRadius.md, marginTop: Spacing.sm,
  },
  swapBtnText: {
    color: Colors.accent, fontWeight: Typography.semiBold, fontSize: Typography.sm,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accent + '22',
    borderColor: Colors.accent,
  },
  filterText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
  filterTextActive: {
    color: Colors.accent,
    fontWeight: Typography.semiBold,
  },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  card: { gap: Spacing.sm },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: Spacing.sm,
  },
  nameSection: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
  nameInfo: { flex: 1 },
  visitorName: {
    fontSize: Typography.base, fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  visitorType: {
    fontSize: Typography.xs, color: Colors.textSecondary,
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsGrid: { gap: 4 },
  detailRow: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
  detail: { color: Colors.textSecondary, fontSize: Typography.sm },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: Colors.textInverse, lineHeight: 32 },
});
