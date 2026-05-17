import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import QRCode from 'react-native-qrcode-svg';
import { Visitor } from '../../../types';
import {
  checkinVisitor, checkoutVisitor, deleteVisitor, approveVisitor,
} from '../../../services/visitors.service';
import { useAuth } from '../../../context/AuthContext';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { VisitorTypeLabels } from '../../../constants/roles';
import { formatCPF, formatPhone, formatDateBR } from '../../../utils/validators';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Smartphone, Mail, Home, Calendar, Clock, MessageSquare, CheckCircle, LogOut, XCircle } from 'lucide-react-native';

const statusConfig: Record<string, { label: string; color: any }> = {
  pending:     { label: 'Aguardando entrada', color: 'warning' },
  approved:    { label: 'Liberado',           color: 'info' },
  checked_in:  { label: 'No condomínio',      color: 'success' },
  checked_out: { label: 'Já saiu',            color: 'muted' },
  denied:      { label: 'Acesso negado',      color: 'error' },
};

export const VisitorDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation, route,
}) => {
  const visitor: Visitor = route.params.visitor;
  const { userProfile } = useAuth();
  const isGatekeeper = userProfile?.role === 'gatekeeper';
  const isSyndic = userProfile?.role === 'syndic';
  const status = statusConfig[visitor.status] ?? { label: visitor.status, color: 'muted' };

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ─── Actions ───────────────────────────────────────────────────────
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveVisitor(visitor.id);
      Toast.show({ type: 'success', text1: 'Liberado', text2: `${visitor.name} foi liberado para entrada.` });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao liberar visitante.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckin = async () => {
    setActionLoading(true);
    try {
      await checkinVisitor(visitor.id);
      Toast.show({ type: 'success', text1: 'Check-in', text2: `${visitor.name} entrou no condomínio.` });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao registrar entrada.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    setActionLoading(true);
    try {
      await checkoutVisitor(visitor.id);
      Toast.show({ type: 'success', text1: 'Check-out', text2: `${visitor.name} saiu do condomínio.` });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao registrar saída.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo & QR Code */}
      <View style={styles.topSection}>
        {visitor.photoURL ? (
          <Image source={{ uri: visitor.photoURL }} style={styles.photo} />
        ) : null}

        <View style={styles.qrCard}>
          <QRCode
            value={visitor.qrCode}
            size={180}
            backgroundColor={Colors.white}
            color={Colors.background}
          />
          <Text style={styles.qrLabel}>QR Code de acesso</Text>
        </View>
      </View>

      <Card>
        <View style={styles.statusRow}>
          <Badge label={status.label} color={status.color} />
          {visitor.visitorType && (
            <Badge
              label={VisitorTypeLabels[visitor.visitorType] ?? 'Visitante'}
              color="primary"
            />
          )}
        </View>

        <Text style={styles.name}>{visitor.name}</Text>

        <View style={styles.details}>
          {visitor.cpf ? <DetailRow icon={<FileText size={20} color={Colors.textSecondary} />} label="CPF" value={formatCPF(visitor.cpf)} /> : null}
          {visitor.rg ? <DetailRow icon={<FileText size={20} color={Colors.textSecondary} />} label="RG" value={visitor.rg} /> : null}
          {visitor.phone ? <DetailRow icon={<Smartphone size={20} color={Colors.textSecondary} />} label="Telefone" value={formatPhone(visitor.phone)} /> : null}
          {visitor.email ? <DetailRow icon={<Mail size={20} color={Colors.textSecondary} />} label="E-mail" value={visitor.email} /> : null}
          {visitor.hostName && (
            <DetailRow icon={<Home size={20} color={Colors.textSecondary} />} label="Anfitrião" value={
              `${visitor.hostName}${visitor.hostBlock ? ` – Bloco ${visitor.hostBlock}` : ''}${visitor.hostApartment ? ` Apt. ${visitor.hostApartment}` : ''}`
            } />
          )}
          <DetailRow icon={<Calendar size={20} color={Colors.textSecondary} />} label="Data esperada" value={formatDateBR(visitor.expectedDate)} />
          {visitor.expectedTime ? (
            <DetailRow icon={<Clock size={20} color={Colors.textSecondary} />} label="Horário previsto" value={visitor.expectedTime} />
          ) : null}
          {visitor.observations ? (
            <DetailRow icon={<MessageSquare size={20} color={Colors.textSecondary} />} label="Observações" value={visitor.observations} />
          ) : null}
          {visitor.checkinAt && (
            <DetailRow icon={<CheckCircle size={20} color={Colors.success} />} label="Check-in" value={
              format(new Date(visitor.checkinAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
            } />
          )}
          {visitor.checkoutAt && (
            <DetailRow icon={<LogOut size={20} color={Colors.error} />} label="Check-out" value={
              format(new Date(visitor.checkoutAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
            } />
          )}
        </View>

        {/* Gatekeeper / Syndic actions */}
        {(isGatekeeper || isSyndic) && visitor.status === 'pending' && (
          <Button title="Liberar entrada" onPress={handleApprove} fullWidth size="lg"
            style={styles.actionBtn} loading={actionLoading} variant="secondary" />
        )}
        {(isGatekeeper || isSyndic) && (visitor.status === 'pending' || visitor.status === 'approved') && (
          <Button title="Registrar entrada" onPress={handleCheckin} fullWidth size="lg"
            style={styles.actionBtn} loading={actionLoading} />
        )}
        {(isGatekeeper || isSyndic) && visitor.status === 'checked_in' && (
          <Button title="Registrar saída" onPress={handleCheckout} variant="secondary"
            fullWidth size="lg" style={styles.actionBtn} loading={actionLoading} />
        )}

        {/* Edit / Delete */}
        {(isSyndic || visitor.hostUserId === userProfile?.uid) && (
          <View style={styles.mgmtActions}>
            <Button title="Editar" variant="outline" size="sm"
              onPress={() => navigation.navigate('CreateEditVisitor', { visitor })} />
            <Button title="Excluir" variant="danger" size="sm" onPress={handleDelete} />
          </View>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={confirmVisible}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o visitante ${visitor.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
        variant="danger"
        loading={deleting}
      />
    </ScrollView>
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
  topSection: { alignItems: 'center', gap: Spacing.base },
  photo: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: Colors.accent,
    resizeMode: 'cover',
  },
  qrCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
  },
  qrLabel: { color: Colors.textInverse, fontSize: Typography.sm, fontWeight: Typography.medium },
  statusRow: {
    flexDirection: 'row', gap: Spacing.sm,
    marginBottom: Spacing.md, flexWrap: 'wrap',
  },
  name: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: Spacing.lg,
  },
  details: { marginBottom: Spacing.md },
  actionBtn: { marginBottom: Spacing.md },
  mgmtActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
});
