import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { getPendingUsers, approveUser, rejectUser, countResidentsInApartment } from '../../services/users.service';
import { getApartments } from '../../services/structure.service';
import { UserProfile, Apartment } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { UserCheck, UserX, Clock, Building, User } from 'lucide-react-native';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonList } from '../../components/common/SkeletonLoader';

export const PendingApprovalsScreen: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingUsers, apts] = await Promise.all([
        getPendingUsers(),
        getApartments(),
      ]);
      setUsers(pendingUsers);
      setApartments(apts);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível carregar as solicitações.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (user: UserProfile) => {
    if (!user.apartmentId) {
       await executeApproval(user);
       return;
    }

    const apt = apartments.find(a => a.id === user.apartmentId);
    if (apt && apt.maxResidents) {
      const currentCount = await countResidentsInApartment(user.apartmentId);
      if (currentCount >= apt.maxResidents) {
        Alert.alert(
          'Limite Atingido',
          `Esta unidade já atingiu o limite máximo de ${apt.maxResidents} moradores. Deseja aprovar mesmo assim?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Aprovar', style: 'destructive', onPress: () => executeApproval(user) }
          ]
        );
        return;
      }
    }
    await executeApproval(user);
  };

  const executeApproval = async (user: UserProfile) => {
    try {
      await approveUser(user.uid, user.apartmentId);
      Toast.show({ type: 'success', text1: 'Aprovado', text2: 'Morador aprovado com sucesso.' });
      setUsers(prev => prev.filter(u => u.uid !== user.uid));
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível aprovar o morador.' });
    }
  };

  const handleReject = (user: UserProfile) => {
    Alert.prompt(
      'Rejeitar Solicitação',
      'Informe o motivo da rejeição (opcional):',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rejeitar', 
          style: 'destructive', 
          onPress: async (reason) => {
            try {
              await rejectUser(user.uid, reason || 'Não informado.');
              Toast.show({ type: 'success', text1: 'Rejeitado', text2: 'Solicitação rejeitada.' });
              setUsers(prev => prev.filter(u => u.uid !== user.uid));
            } catch {
              Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível rejeitar a solicitação.' });
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: UserProfile }) => {
    const apt = apartments.find(a => a.id === item.apartmentId);
    const aptDisplay = apt ? `${apt.blockName ? apt.blockName + ' - ' : ''}Apt ${apt.number}` : 'Nenhuma unidade';

    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <User size={24} color={Colors.accent} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.detailRow}>
              <Building size={14} color={Colors.textMuted} />
              <Text style={styles.detailText}>{aptDisplay}</Text>
            </View>
            <Text style={styles.dateText}>
              Solicitado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <Button 
            title="Rejeitar" 
            variant="outline" 
            size="sm" 
            style={styles.actionBtn} 
            onPress={() => handleReject(item)} 
          />
          <Button 
            title="Aprovar" 
            variant="primary" 
            size="sm" 
            style={styles.actionBtn} 
            onPress={() => handleApprove(item)} 
          />
        </View>
      </Card>
    );
  };

  if (loading) return <View style={styles.container}><SkeletonList count={4} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={u => u.uid}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon={<UserCheck size={48} color={Colors.textMuted} />}
            title="Nenhuma solicitação pendente"
            subtitle="Todas as contas de moradores já foram analisadas."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.xl, gap: Spacing.md },
  card: { gap: Spacing.md },
  headerRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryLight + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  detailText: { fontSize: Typography.sm, color: Colors.textSecondary },
  dateText: { fontSize: Typography.xs, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1 },
});
