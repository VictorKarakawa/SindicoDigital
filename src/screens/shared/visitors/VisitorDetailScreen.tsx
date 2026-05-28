import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Visitor, Visit } from '../../../types';
import { deleteVisitor, getVisitorById } from '../../../services/visitors.service';
import { subscribeToVisitorVisits, approveVisit, checkinVisit, checkoutVisit } from '../../../services/visits.service';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Badge } from '../../../components/common/Badge';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { VisitorTypeLabels } from '../../../constants/roles';
import { formatCPF, formatPhone, formatDateBR } from '../../../utils/validators';
import { FileText, Smartphone, Mail, Calendar, Clock, Home, CheckCircle, LogOut } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: any }> = {
  pending:     { label: 'Aguardando', color: 'warning' },
  approved:    { label: 'Liberado',   color: 'info' },
  checked_in:  { label: 'Dentro',     color: 'success' },
  checked_out: { label: 'Saiu',       color: 'muted' },
  denied:      { label: 'Negado',     color: 'error' },
};

export const VisitorDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const visitorParam: Visitor | undefined = route.params.visitor;
  const visitorIdParam: string | undefined = route.params.visitorId;

  const { userProfile } = useAuth();
  const isSyndic = userProfile?.role === 'syndic';
  const isGatekeeper = userProfile?.role === 'gatekeeper';

  const [visitor, setVisitor] = useState<Visitor | null>(visitorParam || null);
  const [loadingVisitor, setLoadingVisitor] = useState(!visitorParam);

  const [visits, setVisits] = useState<Visit[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!visitorParam && visitorIdParam) {
      getVisitorById(visitorIdParam).then((v) => {
        setVisitor(v);
        setLoadingVisitor(false);
      }).catch(() => {
        setLoadingVisitor(false);
      });
    } else {
      setLoadingVisitor(false);
    }
  }, [visitorIdParam, visitorParam]);

  useEffect(() => {
    if (visitor) {
      const unsub = subscribeToVisitorVisits(visitor.id, (list) => {
        setVisits(list);
      });
      return unsub;
    }
  }, [visitor?.id]);

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!visitor) return;
    setDeleting(true);
    try {
      await deleteVisitor(visitor.id);
      Toast.show({ type: 'success', text1: 'Excluído', text2: `${visitor.name} foi removido.` });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao excluir visitante.' });
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
    }
  };

  const handleApprove = async (visitId: string) => {
    setActionLoading(visitId);
    try {
      await approveVisit(visitId);
      Toast.show({ type: 'success', text1: 'Aprovado', text2: 'Visita liberada com sucesso.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao aprovar visita.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckin = async (visitId: string) => {
    setActionLoading(visitId);
    try {
      await checkinVisit(visitId);
      Toast.show({ type: 'success', text1: 'Entrada Registrada', text2: 'Entrada confirmada com sucesso.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao registrar entrada.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckout = async (visitId: string) => {
    setActionLoading(visitId);
    try {
      await checkoutVisit(visitId);
      Toast.show({ type: 'success', text1: 'Saída Registrada', text2: 'Saída confirmada com sucesso.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao registrar saída.' });
    } finally {
      setActionLoading(null);
    }
  };

  const renderVisit = ({ item }: { item: Visit }) => {
    const status = statusConfig[item.status] ?? { label: item.status, color: 'muted' };

    return (
      <View style={styles.visitCard}>
        <View style={styles.visitHeader}>
          <Text style={styles.visitDate}>
            {formatDateBR(item.expectedDate)} {item.expectedTime ? `às ${item.expectedTime}` : ''}
          </Text>
          <Badge label={status.label} color={status.color} />
        </View>

        <View style={styles.visitDetails}>
          <Text style={styles.visitType}>
            Tipo: {VisitorTypeLabels[item.visitorType] ?? 'Visitante'}
          </Text>
          {item.hostName && (
            <Text style={styles.visitHost}>
              Anfitrião: {item.hostName} {item.hostApartment ? `(Apt ${item.hostApartment})` : ''}
            </Text>
          )}
          {item.checkinAt && (
            <Text style={styles.visitLog}>
              Entrou: {format(new Date(item.checkinAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </Text>
          )}
          {item.checkoutAt && (
            <Text style={styles.visitLog}>
              Saiu: {format(new Date(item.checkoutAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </Text>
          )}
        </View>

        {(isGatekeeper || isSyndic) && (item.status === 'pending' || item.status === 'approved' || item.status === 'checked_in') && (
          <View style={styles.visitActions}>
            {item.status === 'pending' && (
              <Button title="Liberar" onPress={() => handleApprove(item.id)} loading={actionLoading === item.id} size="sm" variant="secondary" style={styles.actionBtn} />
            )}
            {(item.status === 'pending' || item.status === 'approved') && (
              <Button title="Registrar Entrada" onPress={() => handleCheckin(item.id)} loading={actionLoading === item.id} size="sm" style={styles.actionBtn} />
            )}
            {item.status === 'checked_in' && (
              <Button title="Registrar Saída" onPress={() => handleCheckout(item.id)} loading={actionLoading === item.id} size="sm" variant="secondary" style={styles.actionBtn} />
            )}
          </View>
        )}
      </View>
    );
  };

  if (loadingVisitor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!visitor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
        <Text style={{ color: Colors.textMuted, textAlign: 'center' }}>Visitante não encontrado.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topSection}>
          {visitor.photoURL ? (
            <Image source={{ uri: visitor.photoURL }} style={styles.photo} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{visitor.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Card>
          <Text style={styles.name}>{visitor.name}</Text>
          <View style={styles.details}>
            {visitor.cpf ? <DetailRow icon={<FileText size={20} color={Colors.textSecondary} />} label="CPF" value={formatCPF(visitor.cpf)} /> : null}
            {visitor.rg ? <DetailRow icon={<FileText size={20} color={Colors.textSecondary} />} label="RG" value={visitor.rg} /> : null}
            {visitor.phone ? <DetailRow icon={<Smartphone size={20} color={Colors.textSecondary} />} label="Telefone" value={formatPhone(visitor.phone)} /> : null}
            {visitor.email ? <DetailRow icon={<Mail size={20} color={Colors.textSecondary} />} label="E-mail" value={visitor.email} /> : null}
          </View>

          <View style={styles.mgmtActions}>
            <Button title="Editar Cadastro" variant="outline" size="sm" style={{ flex: 1 }}
              onPress={() => navigation.navigate('CreateEditVisitor', { visitor })} />
            {(isSyndic || userProfile?.role === 'resident') && (
              <Button title="Excluir" variant="danger" size="sm" onPress={handleDelete} />
            )}
          </View>
        </Card>

        <View style={styles.visitsSection}>
          <Text style={styles.sectionTitle}>Histórico de Visitas</Text>
          <Button 
            title="Agendar Nova Visita" 
            onPress={() => navigation.navigate('CreateVisit', { visitor })}
            style={styles.newVisitBtn}
          />

          {visits.length === 0 ? (
            <Text style={styles.noVisitsText}>Nenhuma visita registrada para este visitante.</Text>
          ) : (
            visits.map((v) => <React.Fragment key={v.id}>{renderVisit({ item: v })}</React.Fragment>)
          )}
        </View>

        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={confirmVisible}
          title="Confirmar exclusão"
          message={`Tem certeza que deseja excluir o visitante ${visitor.name}? O histórico de visitas também será afetado.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmVisible(false)}
          variant="danger"
          loading={deleting}
        />
      </ScrollView>
    </View>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <View style={detailStyles.row}>
    <View style={detailStyles.iconContainer}>{icon}</View>
    <View style={detailStyles.textWrap}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  </View>
);

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  iconContainer: { marginTop: 2 },
  textWrap: { flex: 1 },
  label: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 2 },
  value: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 40 },
  topSection: { alignItems: 'center', gap: Spacing.base, marginTop: Spacing.md },
  photo: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.accent,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 40, fontWeight: Typography.bold },
  name: {
    fontSize: Typography['xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center'
  },
  details: { marginBottom: Spacing.md },
  mgmtActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  
  visitsSection: { marginTop: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.lg, fontWeight: Typography.semiBold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  newVisitBtn: { marginBottom: Spacing.md },
  noVisitsText: {
    color: Colors.textMuted, fontSize: Typography.sm, textAlign: 'center',
    marginVertical: Spacing.xl,
  },
  visitCard: {
    backgroundColor: Colors.card, padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  visitHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  visitDate: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  visitDetails: { gap: 2 },
  visitType: { fontSize: Typography.sm, color: Colors.textSecondary },
  visitHost: { fontSize: Typography.sm, color: Colors.textSecondary },
  visitLog: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 4 },
  visitActions: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md,
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  actionBtn: { flexGrow: 1 },
});
