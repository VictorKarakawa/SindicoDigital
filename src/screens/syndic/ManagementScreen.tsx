import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  Users, Lock, Waves, ChevronRight, ClipboardList,
  Building2, DoorOpen, CalendarDays, ShieldPlus, UserCheck
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import { Card } from '../../components/common/Card';

interface ManagementOptionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onPress: () => void;
}

const ManagementOption: React.FC<ManagementOptionProps> = ({ icon: Icon, title, description, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <Card style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon size={24} color={Colors.accent} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <ChevronRight size={24} color={Colors.textMuted} />
    </Card>
  </TouchableOpacity>
);

export const ManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>O que você deseja gerenciar?</Text>

      <View style={styles.optionsList}>
        <ManagementOption
          icon={UserCheck}
          title="Aprovações Pendentes"
          description="Aprove ou rejeite novos cadastros de moradores."
          onPress={() => navigation.navigate('PendingApprovals')}
        />
        <ManagementOption
          icon={ShieldPlus}
          title="Síndicos"
          description="Gerencie os síndicos e administradores do condomínio."
          onPress={() => navigation.navigate('SyndicsList', { role: 'syndic' })}
        />
        <ManagementOption
          icon={Users}
          title="Moradores"
          description="Cadastre, edite ou remova moradores."
          onPress={() => navigation.navigate('ResidentsList')}
        />
        <ManagementOption
          icon={Lock}
          title="Porteiros"
          description="Gerencie os porteiros do condomínio."
          onPress={() => navigation.navigate('GatekeepersList', { role: 'gatekeeper' })}
        />
        <ManagementOption
          icon={Waves}
          title="Espaços comuns"
          description="Gerencie salões de festas, piscinas e churrasqueiras."
          onPress={() => navigation.navigate('SpacesList')}
        />
        <ManagementOption
          icon={CalendarDays}
          title="Eventos"
          description="Cadastre assembleias, manutenções e comunicados com data."
          onPress={() => navigation.navigate('EventsList')}
        />
        <ManagementOption
          icon={Building2}
          title="Blocos e torres"
          description="Gerencie a estrutura de blocos do condomínio."
          onPress={() => navigation.navigate('BlocksList')}
        />
        <ManagementOption
          icon={DoorOpen}
          title="Unidades e apartamentos"
          description="Gerencie as unidades e acompanhe as ocupações."
          onPress={() => navigation.navigate('ApartmentsList')}
        />
        <ManagementOption
          icon={ClipboardList}
          title="Histórico de ações"
          description="Veja todas as ações administrativas realizadas."
          onPress={() => navigation.navigate('AdminLogs')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  header: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  optionsList: { gap: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
