import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView,
} from 'react-native';
import { subscribeToNotices, deleteNotice } from '../../../services/notices.service';
import { Notice, NoticePriority } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { PriorityBadge } from '../../../components/common/Badge';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Megaphone, AlertCircle, Circle } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FILTERS: { label: string; value: NoticePriority | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Urgente', value: 'urgent' },
  { label: 'Alta', value: 'high' },
  { label: 'Média', value: 'medium' },
  { label: 'Baixa', value: 'low' },
];

export const NoticesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState<NoticePriority | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const isSyndic = userProfile?.role === 'syndic';

  useEffect(() => {
    const unsub = subscribeToNotices(setNotices);
    return unsub;
  }, []);

  const filtered = filter === 'all' ? notices : notices.filter((n) => n.priority === filter);

  const handleDelete = async (id: string) => {
    await deleteNotice(id);
  };

  const renderNotice = ({ item }: { item: Notice }) => {
    const isUrgent = item.priority === 'urgent';
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('NoticeDetail', { notice: item })}
        activeOpacity={0.85}
      >
        <Card style={StyleSheet.flatten([styles.noticeCard, isUrgent ? styles.urgentCard : undefined])}>
          {isUrgent && (
            <View style={styles.urgentBanner}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: Spacing.xs}}>
                <AlertCircle size={16} color={Colors.white} />
                <Text style={styles.urgentBannerText}>AVISO URGENTE</Text>
              </View>
            </View>
          )}
          <View style={styles.noticeHeader}>
            <PriorityBadge priority={item.priority} />
            <Text style={styles.noticeDate}>
              {format(new Date(item.createdAt), "dd 'de' MMM", { locale: ptBR })}
            </Text>
          </View>
          <Text style={styles.noticeTitle}>{item.title}</Text>
          <Text style={styles.noticeContent} numberOfLines={2}>{item.content}</Text>
          {isSyndic && (
            <View style={styles.actions}>
              <Button title="Editar" variant="outline" size="sm"
                onPress={() => navigation.navigate('CreateEditNotice', { notice: item })} />
              <Button title="Excluir" variant="danger" size="sm"
                onPress={() => handleDelete(item.id)} />
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}
        contentContainerStyle={styles.filtersContent}>
        {FILTERS.map((f) => (
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
        keyExtractor={(item) => item.id}
        renderItem={renderNotice}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={Colors.accent} />
        }
        ListEmptyComponent={
          <EmptyState icon={<Megaphone size={48} color={Colors.textMuted} />} title="Nenhum aviso" subtitle="Não há avisos no momento." />
        }
      />

      {isSyndic && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEditNotice', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
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
  noticeCard: { gap: Spacing.sm, overflow: 'hidden' },
  urgentCard: { borderColor: Colors.error, borderWidth: 2 },
  urgentBanner: {
    backgroundColor: Colors.error, marginHorizontal: -Spacing.base,
    marginTop: -Spacing.base, paddingVertical: Spacing.xs,
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  urgentBannerText: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.sm },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeDate: { color: Colors.textMuted, fontSize: Typography.xs },
  noticeTitle: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary,
  },
  noticeContent: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: Colors.textInverse, lineHeight: 32 },
});
