import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Users, Hourglass, CalendarDays, Vote, AlertCircle, Megaphone, User, Lock, Waves, Circle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { subscribeToNotices } from '../../services/notices.service';
import { subscribeToVisitors } from '../../services/visitors.service';
import { subscribeToReservations } from '../../services/reservations.service';
import { subscribeToVotings } from '../../services/votings.service';
import { Notice, Visitor, Reservation, Voting } from '../../types';
import { Card } from '../../components/common/Card';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, onPress }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]}
    onPress={onPress} activeOpacity={0.8}>
    <View style={styles.statIcon}>
      <Icon color={color} size={28} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

export const SyndicDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [votings, setVotings] = useState<Voting[]>([]);

  useEffect(() => {
    const unsubs = [
      subscribeToNotices(setNotices),
      subscribeToVisitors(setVisitors),
      subscribeToReservations(setReservations),
      subscribeToVotings(setVotings),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  const activeVisitors = visitors.filter((v) => v.status === 'checked_in').length;
  const pendingVisitors = visitors.filter((v) => v.status === 'pending').length;
  const openVotings = votings.filter((v) => v.status === 'open').length;
  const urgentNotices = notices.filter((n) => n.priority === 'urgent').length;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayReservations = reservations.filter((r) => r.date === todayStr).length;

  const recentNotices = notices.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome */}
      <View style={styles.welcome}>
        <Text style={styles.greeting}>Olá, {userProfile?.name?.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>Aqui está o resumo do condomínio</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard icon={Users} label="Visitantes hoje" value={activeVisitors}
          color={Colors.success} onPress={() => navigation.navigate('Visitantes')} />
        <StatCard icon={Hourglass} label="Aguardando entrada" value={pendingVisitors}
          color={Colors.warning} onPress={() => navigation.navigate('Visitantes')} />
        <StatCard icon={CalendarDays} label="Reservas hoje" value={todayReservations}
          color={Colors.primaryLight} onPress={() => navigation.navigate('Reservas')} />
        <StatCard icon={Vote} label="Votações abertas" value={openVotings}
          color={Colors.accent} onPress={() => navigation.navigate('Votações')} />
        {urgentNotices > 0 && (
          <StatCard icon={AlertCircle} label="Avisos urgentes" value={urgentNotices}
            color={Colors.error} onPress={() => navigation.navigate('Avisos')} />
        )}
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Ações rápidas</Text>
      <View style={styles.quickActions}>
        {[
          { icon: Megaphone, label: 'Novo aviso', tab: 'Avisos', screen: 'CreateEditNotice', params: {} },
          { icon: User, label: 'Cadastrar morador', tab: 'Gestão', screen: 'CreateEditUser', params: { role: 'resident' } },
          { icon: Lock, label: 'Cadastrar porteiro', tab: 'Gestão', screen: 'CreateEditUser', params: { role: 'gatekeeper' } },
          { icon: Waves, label: 'Gerenciar espaços', tab: 'Gestão', screen: 'SpacesList', params: {} },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickAction}
            onPress={() => navigation.navigate(action.tab, { screen: action.screen, params: action.params })}
            activeOpacity={0.8}
          >
            <action.icon color={Colors.textSecondary} size={28} />
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent notices */}
      {recentNotices.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Avisos recentes</Text>
          {recentNotices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              onPress={() => navigation.navigate('Avisos', { screen: 'NoticeDetail', params: { notice } })}
              activeOpacity={0.85}
            >
              <Card style={styles.recentNotice}>
                <View style={styles.noticeRow}>
                  <View style={styles.noticeDot}>
                    {notice.priority === 'urgent' ? <AlertCircle color={Colors.error} size={20} /> :
                     notice.priority === 'high' ? <Circle color={Colors.error} fill={Colors.error} size={16} /> :
                     notice.priority === 'medium' ? <Circle color={Colors.warning} fill={Colors.warning} size={16} /> :
                     <Circle color={Colors.success} fill={Colors.success} size={16} />}
                  </View>
                  <View style={styles.noticeMeta}>
                    <Text style={styles.noticeTitle} numberOfLines={1}>{notice.title}</Text>
                    <Text style={styles.noticeContent} numberOfLines={2}>{notice.content}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },
  welcome: { marginBottom: Spacing.xl, marginTop: Spacing.sm },
  greeting: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary,
  },
  subtitle: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderLeftWidth: 4, alignItems: 'flex-start',
    borderWidth: 1, borderColor: Colors.border,
  },
  statIcon: { marginBottom: Spacing.xs },
  statValue: { fontSize: Typography['3xl'], fontWeight: Typography.extraBold },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold,
    color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  quickAction: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    alignItems: 'center', gap: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickActionIcon: { marginBottom: Spacing.xs },
  quickActionLabel: {
    fontSize: Typography.sm, color: Colors.textSecondary,
    fontWeight: Typography.medium, textAlign: 'center',
  },
  recentNotice: { marginBottom: Spacing.sm },
  noticeRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  noticeDot: { justifyContent: 'center', alignItems: 'center', width: 24 },
  noticeMeta: { flex: 1 },
  noticeTitle: {
    fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary,
  },
  noticeContent: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
});
