import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../../context/AuthContext';
import { updateUserProfile } from '../../../services/auth.service';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { PhotoPicker } from '../../../components/common/PhotoPicker';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { RoleLabels, ResidentTypeLabels, UserStatusLabels } from '../../../constants/roles';
import { formatCPF, formatPhone, formatDateBR } from '../../../utils/validators';
import { Mail, FileText, Smartphone, Calendar, Building, DoorOpen, Tag, User as UserIcon } from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { userProfile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name ?? '');
  const [phone, setPhone] = useState(userProfile?.phone ?? '');
  const [apartment, setApartment] = useState(userProfile?.apartment ?? '');
  const [block, setBlock] = useState(userProfile?.block ?? '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL ?? '');
  const [loading, setLoading] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  if (!userProfile) return null;

  const roleColor: Record<string, any> = {
    syndic: 'accent', resident: 'primary', gatekeeper: 'success',
  };

  const handleSave = async () => {
    if (!name.trim()) { Toast.show({ type: 'error', text1: 'Atenção', text2: 'Nome é obrigatório.' }); return; }
    setLoading(true);
    try {
      await updateUserProfile(userProfile.uid, { name, phone, apartment, block, photoURL });
      await refreshProfile();
      setEditing(false);
      Toast.show({ type: 'success', text1: 'Perfil atualizado', text2: 'Seus dados foram salvos.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível atualizar o perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await signOut();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          {editing ? (
            <PhotoPicker
              value={photoURL || undefined}
              onChange={setPhotoURL}
              label="Foto do perfil"
              size={88}
            />
          ) : (
            <>
              {userProfile.photoURL ? (
                <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userProfile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </>
          )}
          {!editing && <Text style={styles.userName}>{userProfile.name}</Text>}
          <Badge
            label={RoleLabels[userProfile.role]}
            color={roleColor[userProfile.role] ?? 'muted'}
          />
          {userProfile.status && (
            <Badge
              label={UserStatusLabels[userProfile.status] ?? 'Ativo'}
              color={userProfile.status === 'active' ? 'success' : 'error'}
            />
          )}
        </View>

        {/* Info card */}
        <Card style={styles.infoCard}>
          {!editing ? (
            <>
              <InfoRow icon={<Mail size={20} color={Colors.textSecondary} />} label="E-mail" value={userProfile.email} />
              {userProfile.cpf ? <InfoRow icon={<FileText size={20} color={Colors.textSecondary} />} label="CPF" value={formatCPF(userProfile.cpf)} /> : null}
              {userProfile.rg ? <InfoRow icon={<FileText size={20} color={Colors.textSecondary} />} label="RG" value={userProfile.rg} /> : null}
              {userProfile.phone ? <InfoRow icon={<Smartphone size={20} color={Colors.textSecondary} />} label="Telefone" value={formatPhone(userProfile.phone)} /> : null}
              {userProfile.birthDate ? <InfoRow icon={<Calendar size={20} color={Colors.textSecondary} />} label="Data de nascimento" value={formatDateBR(userProfile.birthDate)} /> : null}
              {userProfile.role === 'resident' && (
                <>
                  {userProfile.block ? <InfoRow icon={<Building size={20} color={Colors.textSecondary} />} label="Bloco" value={userProfile.block} /> : null}
                  {userProfile.apartment ? <InfoRow icon={<DoorOpen size={20} color={Colors.textSecondary} />} label="Apartamento" value={userProfile.apartment} /> : null}
                  {userProfile.residentType ? (
                    <InfoRow icon={<Tag size={20} color={Colors.textSecondary} />} label="Tipo" value={ResidentTypeLabels[userProfile.residentType]} />
                  ) : null}
                </>
              )}
              <InfoRow icon={<Calendar size={20} color={Colors.textSecondary} />} label="Cadastrado em" value={
                new Date(userProfile.createdAt).toLocaleDateString('pt-BR')
              } />
              <Button
                title="Editar perfil"
                variant="outline"
                fullWidth
                style={styles.editBtn}
                onPress={() => setEditing(true)}
              />
            </>
          ) : (
            <>
              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                leftIcon={<UserIcon size={20} color={Colors.textSecondary} />}
              />
              <Input
                label="Telefone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Smartphone size={20} color={Colors.textSecondary} />}
              />
              {userProfile.role === 'resident' && (
                <View style={styles.row}>
                  <View style={styles.half}>
                    <Input label="Bloco" value={block} onChangeText={setBlock}
                      leftIcon={<Building size={20} color={Colors.textSecondary} />} />
                  </View>
                  <View style={styles.half}>
                    <Input label="Apartamento" value={apartment} onChangeText={setApartment}
                      leftIcon={<DoorOpen size={20} color={Colors.textSecondary} />} />
                  </View>
                </View>
              )}
              <View style={styles.editActions}>
                <Button title="Salvar" onPress={handleSave} loading={loading} style={styles.half2} />
                <Button title="Cancelar" variant="ghost" onPress={() => setEditing(false)} style={styles.half2} />
              </View>
            </>
          )}
        </Card>

        {/* Logout */}
        <Button
          title="Sair do aplicativo"
          variant="danger"
          fullWidth
          style={styles.logoutBtn}
          onPress={handleLogout}
        />

        <Text style={styles.version}>Síndico Digital v1.0.0</Text>
      </ScrollView>

      {/* Logout Confirm Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Sair do aplicativo"
        message="Deseja realmente sair do aplicativo?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        variant="warning"
      />
    </KeyboardAvoidingView>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <View style={infoStyles.row}>
    <View style={infoStyles.iconContainer}>{icon}</View>
    <View style={infoStyles.texts}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  iconContainer: { marginTop: 2 },
  texts: { flex: 1 },
  label: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 2 },
  value: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: Typography.medium },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.base, paddingBottom: 60 },
  avatarSection: {
    alignItems: 'center', paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.accent,
  },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: Colors.accent,
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: Typography['4xl'], fontWeight: Typography.bold, color: Colors.white,
  },
  userName: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary,
  },
  infoCard: { marginBottom: Spacing.xl },
  editBtn: { marginTop: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  half2: { flex: 1 },
  editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  logoutBtn: { marginBottom: Spacing.lg },
  version: {
    textAlign: 'center', color: Colors.textMuted,
    fontSize: Typography.xs, marginBottom: Spacing.md,
  },
});
