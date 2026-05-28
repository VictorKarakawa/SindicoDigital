import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CalendarDays, MapPinned, User, ChevronRight } from 'lucide-react-native';
import { Card } from '../../../components/common/Card';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Typography } from '../../../constants/typography';

type MoreStackParamList = {
  ResidentMoreHome: undefined;
  EventsList: undefined;
  CondominiumMap: undefined;
  Profile: undefined;
  VisitorsList: undefined;
};

type Navigation = NativeStackNavigationProp<MoreStackParamList>;

const ITEMS = [
  {
    title: 'Eventos',
    description: 'Acompanhe assembleias, manutenções e atividades agendadas.',
    icon: CalendarDays,
    route: 'EventsList' as const,
  },
  {
    title: 'Visitantes',
    description: 'Gerencie seus visitantes e agende novas visitas.',
    icon: User,
    route: 'VisitorsList' as const,
  },
  {
    title: 'Mapa do condomínio',
    description: 'Veja blocos, portaria, estacionamento e áreas comuns.',
    icon: MapPinned,
    route: 'CondominiumMap' as const,
  },
  {
    title: 'Meu perfil',
    description: 'Consulte seus dados, altere telefone, foto e saia do app.',
    icon: User,
    route: 'Profile' as const,
  },
];

export const ResidentMoreScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mais opções</Text>

      <View style={styles.list}>
        {ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.route} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemPressArea}
                onPress={() => navigation.navigate(item.route)}
                accessibilityRole="button"
                activeOpacity={0.75}
              >
                <View style={styles.iconBox}>
                  <Icon size={22} color={Colors.accent} />
                </View>
                <View style={styles.itemTexts}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    marginBottom: Spacing.lg,
  },
  list: { gap: Spacing.md },
  itemCard: { borderRadius: BorderRadius.lg },
  itemPressArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTexts: { flex: 1 },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    marginBottom: 2,
  },
  itemDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 19,
  },
});
