import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { Clock, XCircle, LogOut } from 'lucide-react-native';

export const PendingResidentScreen: React.FC = () => {
  const { userProfile, signOut } = useAuth();

  const isRejected = userProfile?.status === 'rejected';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isRejected ? (
          <>
            <XCircle size={64} color={Colors.error} style={styles.icon} />
            <Text style={styles.title}>Solicitação Rejeitada</Text>
            <Text style={styles.message}>
              Infelizmente, sua solicitação de cadastro para a unidade foi rejeitada pela administração.
            </Text>
            {userProfile?.rejectionReason && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonTitle}>Motivo:</Text>
                <Text style={styles.reasonText}>{userProfile.rejectionReason}</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Clock size={64} color={Colors.warning} style={styles.icon} />
            <Text style={styles.title}>Aguardando Aprovação</Text>
            <Text style={styles.message}>
              Sua conta foi criada com sucesso, mas você precisa aguardar a aprovação do síndico para acessar o aplicativo.
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  reasonBox: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.error + '15',
    borderRadius: BorderRadius.md,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.error + '50',
  },
  reasonTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.error,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    color: Colors.error,
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
  },
});
