import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { subscribeToLogs } from '../../services/logs.service';
import { AdminLog, LogAction, LogTarget } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit2, Trash2, ClipboardList } from 'lucide-react-native';

const actionConfig: Record<LogAction, { label: string; color: any; Icon: React.FC<any> }> = {
  create: { label: 'Criação',   color: 'success', Icon: Plus },
  update: { label: 'Edição',    color: 'info',    Icon: Edit2 },
  delete: { label: 'Exclusão',  color: 'error',   Icon: Trash2 },
};

const targetLabels: Record<LogTarget, string> = {
  user:        'Usuário',
  visitor:     'Visitante',
  notice:      'Aviso',
  event:       'Evento',
  space:       'Espaço',
  reservation: 'Reserva',
  voting:      'Votação',
};

type FilterAction = 'all' | LogAction;

export const AdminLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<FilterAction>('all');

  useEffect(() => {
    const unsub = subscribeToLogs((list) => {
      setLogs(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  const renderLog = ({ item }: { item: AdminLog }) => {
    const config = actionConfig[item.action] ?? { label: item.action, color: 'muted', Icon: ClipboardList };
    return (
      <Card style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={styles.logIconContainer}><config.Icon size={24} color={Colors.textSecondary} /></View>
          <View style={styles.logInfo}>
            <View style={styles.logTopRow}>
              <Text style={styles.logAction}>
                {config.label} de {targetLabels[item.target] ?? item.target}
              </Text>
              <Badge label={config.label} color={config.color} />
            </View>
            <Text style={styles.logTarget} numberOfLines={1}>
              {item.targetName}
            </Text>
            <Text style={styles.logMeta}>
              por {item.userName} • {format(new Date(item.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </Text>
            {item.details ? (
              <Text style={styles.logDetails} numberOfLines={2}>{item.details}</Text>
            ) : null}
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonList count={6} variant="row" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filters}>
        {([
          { key: 'all' as FilterAction, label: 'Todos' },
          { key: 'create' as FilterAction, label: 'Criação' },
          { key: 'update' as FilterAction, label: 'Edição' },
          { key: 'delete' as FilterAction, label: 'Exclusão' },
        ]).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filterAction === f.key && styles.filterChipActive]}
            onPress={() => setFilterAction(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, filterAction === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderLog}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<ClipboardList size={48} color={Colors.textMuted} />}
            title="Nenhuma ação registrada"
            subtitle="As ações administrativas aparecerão aqui."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    flexWrap: 'wrap',
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
  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: 40 },
  logCard: { padding: Spacing.md },
  logHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  logIconContainer: { marginTop: 2 },
  logInfo: { flex: 1 },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logAction: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  logTarget: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
    marginBottom: 2,
  },
  logMeta: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  logDetails: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
