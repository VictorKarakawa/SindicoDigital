import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { Users, FileText, Smartphone } from 'lucide-react-native';
import { subscribeToVisitors, searchVisitors } from '../../../services/visitors.service';
import { Visitor } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';
import { SkeletonList } from '../../../components/common/SkeletonLoader';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { formatCPF } from '../../../utils/validators';

export const VisitorsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isSyndic = userProfile?.role === 'syndic';
  const isGatekeeper = userProfile?.role === 'gatekeeper';

  useEffect(() => {
    const unsub = subscribeToVisitors((all) => {
      setAllVisitors(all);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredVisitors = searchVisitors(searchQuery, allVisitors);

  const renderVisitor = ({ item }: { item: Visitor }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('VisitorDetail', { visitor: item })}
        activeOpacity={0.85}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.nameSection}>
              {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.nameInfo}>
                <Text style={styles.visitorName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cpfText}>
                  {item.cpf ? formatCPF(item.cpf) : 'Sem CPF'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            {item.phone ? (
              <View style={styles.detailRow}>
                <Smartphone color={Colors.textSecondary} size={14} />
                <Text style={styles.detail}>{item.phone}</Text>
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
          placeholder="Buscar visitantes cadastrados..."
        />
        <TouchableOpacity 
          style={styles.swapBtn} 
          onPress={() => navigation.navigate('VisitsList')}
          activeOpacity={0.8}
        >
          <Users size={20} color={Colors.accent} />
          <Text style={styles.swapBtnText}>Ver Visitas Ativas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVisitors}
        keyExtractor={(item) => item.id}
        renderItem={renderVisitor}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<Users size={48} color={Colors.textMuted} />}
            title={searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Nenhum visitante'}
            subtitle={searchQuery ? 'Tente buscar por outro termo.' : 'Não há visitantes cadastrados.'}
          />
        }
      />

      {(isSyndic || userProfile?.role === 'resident' || isGatekeeper) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateEditVisitor', {})}
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
  searchSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  swapBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.accent + '15', padding: Spacing.sm,
    borderRadius: BorderRadius.md, marginTop: Spacing.sm,
  },
  swapBtnText: {
    color: Colors.accent, fontWeight: Typography.semiBold, fontSize: Typography.sm,
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
  nameInfo: { flex: 1, justifyContent: 'center' },
  visitorName: {
    fontSize: Typography.base, fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  cpfText: {
    fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2,
  },
  detailsGrid: { gap: 4, marginTop: 4 },
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
