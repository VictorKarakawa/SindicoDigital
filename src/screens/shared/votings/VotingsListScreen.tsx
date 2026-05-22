import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { subscribeToVotings, castVote, deleteVoting, closeVoting } from '../../../services/votings.service';
import { Voting } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { EmptyState } from '../../../components/common/EmptyState';
import { Button } from '../../../components/common/Button';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Vote, CheckCircle2 } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const VotingsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [votings, setVotings] = useState<Voting[]>([]);
  const isSyndic = userProfile?.role === 'syndic';

  useEffect(() => {
    const unsub = subscribeToVotings(setVotings);
    return unsub;
  }, []);

  const handleVote = async (voting: Voting, optionId: string) => {
    if (!userProfile) return;
    try {
      await castVote(voting.id, userProfile.uid, optionId);
      Alert.alert('Sucesso', 'Seu voto foi registrado com sucesso!');
    } catch (error: any) {
      if (error.message === 'LIMIT_REACHED') {
        Alert.alert('Limite atingido', 'Você já alterou seu voto o limite máximo de 3 vezes.');
      } else if (error.message === 'VOTING_CLOSED') {
        Alert.alert('Atenção', 'Esta votação já está encerrada.');
      } else {
        Alert.alert('Erro', 'Não foi possível registrar seu voto.');
      }
    }
  };

  const handlePressOption = (item: Voting, optId: string, userVote: string | null) => {
    if (!userProfile) return;
    const isOpen = item.status === 'open';
    if (!isOpen) return;

    if (!userVote) {
      // First time voting
      handleVote(item, optId);
      return;
    }

    if (userVote === optId) {
      // Already voted for this option, do nothing
      return;
    }

    // Changing vote
    const changeCount = item.voteChanges?.[userProfile.uid] ?? 0;
    if (changeCount >= 3) {
      Alert.alert('Limite atingido', 'Você já alterou seu voto o limite máximo de 3 vezes.');
      return;
    }

    const remaining = 3 - changeCount;
    Alert.alert(
      'Confirmar alteração',
      `Deseja alterar seu voto para "${item.options.find(o => o.id === optId)?.label}"? Você ainda pode alterar mais ${remaining} ${remaining === 1 ? 'vez' : 'vezes'}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => handleVote(item, optId),
        },
      ]
    );
  };

  const renderVoting = ({ item }: { item: Voting }) => {
    const totalVotes = item.options.reduce((s, o) => s + (o.votes ?? 0), 0);
    const userVote = userProfile ? item.voters?.[userProfile.uid] : null;
    const isOpen = item.status === 'open';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Badge label={isOpen ? 'Aberta' : 'Encerrada'}
            color={isOpen ? 'success' : 'muted'} />
          <Text style={styles.date}>
            {format(new Date(item.closesAt), "dd/MM/yyyy", { locale: ptBR })}
          </Text>
        </View>
        <Text style={styles.votingTitle}>{item.title}</Text>
        <Text style={styles.votingDesc}>{item.description}</Text>

        <View style={styles.options}>
          {item.options.map((opt) => {
            const pct = totalVotes > 0 ? ((opt.votes ?? 0) / totalVotes) * 100 : 0;
            const isMyVote = userVote === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.option, isMyVote && styles.optionVoted]}
                onPress={() => handlePressOption(item, opt.id, userVote)}
                activeOpacity={isOpen && userVote !== opt.id ? 0.75 : 1}
              >
                <View style={styles.optionTop}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    {isMyVote && <CheckCircle2 size={16} color={Colors.textPrimary} />}
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                  </View>
                  <Text style={styles.optionPct}>{Math.round(pct)}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressBar, { width: `${pct}%` as any }]} />
                </View>
                <Text style={styles.optionVotes}>{opt.votes ?? 0} votos</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footerRow}>
          {userProfile && userVote && (
            <Text style={styles.changesCount}>
              Alterações: {item.voteChanges?.[userProfile.uid] ?? 0}/3
            </Text>
          )}
          <Text style={styles.totalVotes}>Total: {totalVotes} votos</Text>
        </View>

        {isSyndic && (
          <View style={styles.actions}>
            {isOpen && (
              <Button title="Encerrar" variant="outline" size="sm"
                onPress={() => closeVoting(item.id)} />
            )}
            <Button title="Excluir" variant="danger" size="sm"
              onPress={() => deleteVoting(item.id)} />
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={votings}
        keyExtractor={(item) => item.id}
        renderItem={renderVoting}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon={<Vote size={48} color={Colors.textMuted} />} title="Nenhuma votação"
            subtitle="Não há votações em andamento." />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateVoting')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.base, gap: Spacing.md, paddingBottom: 100 },
  card: { gap: Spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: Colors.textMuted, fontSize: Typography.xs },
  votingTitle: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary,
  },
  votingDesc: { color: Colors.textSecondary, fontSize: Typography.base },
  options: { gap: Spacing.sm, marginTop: Spacing.sm },
  option: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  optionVoted: { borderColor: Colors.accent },
  optionTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  optionLabel: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.medium },
  optionPct: { color: Colors.accent, fontSize: Typography.base, fontWeight: Typography.bold },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: BorderRadius.full },
  progressBar: { height: 6, backgroundColor: Colors.accent, borderRadius: BorderRadius.full },
  optionVotes: { color: Colors.textMuted, fontSize: Typography.xs, marginTop: 4 },
  totalVotes: { color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'right' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  changesCount: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: Colors.textInverse, lineHeight: 32 },
});
