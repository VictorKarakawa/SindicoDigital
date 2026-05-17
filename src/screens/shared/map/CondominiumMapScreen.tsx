import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Rect, Text as SvgText, Circle, Line } from 'react-native-svg';
import { Colors } from '../../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/typography';
import { Map as MapIcon, MapPin, ShieldCheck, Building, Waves, PartyPopper, Flame, Car, TreePine } from 'lucide-react-native';

// ─── Mapa estático interativo do condomínio ───────────────────────────────────
// Representa um condomínio genérico de Presidente Prudente com 4 blocos (A-D),
// piscina, salão de festas, churrasqueira, portaria e estacionamento.
// O síndico pode adaptar futuramente com uma imagem real.

const AREAS = [
  { id: 'portaria',      label: 'Portaria',       Icon: ShieldCheck, color: '#1B4F72' },
  { id: 'bloco_a',      label: 'Bloco A',          Icon: Building, color: '#2E86C1' },
  { id: 'bloco_b',      label: 'Bloco B',          Icon: Building, color: '#2E86C1' },
  { id: 'bloco_c',      label: 'Bloco C',          Icon: Building, color: '#2E86C1' },
  { id: 'bloco_d',      label: 'Bloco D',          Icon: Building, color: '#2E86C1' },
  { id: 'piscina',      label: 'Piscina',          Icon: Waves, color: '#1ABC9C' },
  { id: 'salao',        label: 'Salão de Festas',  Icon: PartyPopper, color: '#8E44AD' },
  { id: 'churrasqueira',label: 'Churrasqueira',    Icon: Flame, color: '#E67E22' },
  { id: 'estacionamento',label: 'Estacionamento', Icon: Car, color: '#7F8C8D' },
  { id: 'jardim',       label: 'Área Verde',       Icon: TreePine, color: '#27AE60' },
];

export const CondominiumMapScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <MapIcon size={24} color={Colors.textPrimary} />
        <Text style={styles.title}>Mapa do Condomínio</Text>
      </View>
      <Text style={styles.subtitle}>Síndico Digital — Presidente Prudente</Text>

      {/* SVG Map */}
      <View style={styles.mapContainer}>
        <Svg width="340" height="360" viewBox="0 0 340 360">
          {/* Background / ground */}
          <Rect x="0" y="0" width="340" height="360" fill="#1A2E42" rx="12" />

          {/* Roads */}
          <Rect x="155" y="0" width="30" height="360" fill="#243B55" />
          <Rect x="0" y="165" width="340" height="30" fill="#243B55" />

          {/* Portaria (entrada) */}
          <Rect x="145" y="345" width="50" height="15" fill="#1B4F72" rx="4" />
          <SvgText x="170" y="357" textAnchor="middle" fill="#D4AC0D" fontSize="8" fontWeight="bold">PORTARIA</SvgText>

          {/* Bloco A */}
          <Rect x="10" y="10" width="130" height="145" fill="#1B4F72" rx="8" />
          <SvgText x="75" y="45" textAnchor="middle" fill="#D4AC0D" fontSize="11" fontWeight="bold">BLOCO A</SvgText>
          <SvgText x="75" y="62" textAnchor="middle" fill="#A8B8C8" fontSize="8">Aptos 101–110</SvgText>
          <Rect x="20" y="70" width="110" height="75" fill="#243B55" rx="4" />
          <SvgText x="75" y="107" textAnchor="middle" fill="#6B8099" fontSize="8">10 unidades</SvgText>

          {/* Bloco B */}
          <Rect x="200" y="10" width="130" height="145" fill="#1B4F72" rx="8" />
          <SvgText x="265" y="45" textAnchor="middle" fill="#D4AC0D" fontSize="11" fontWeight="bold">BLOCO B</SvgText>
          <SvgText x="265" y="62" textAnchor="middle" fill="#A8B8C8" fontSize="8">Aptos 201–210</SvgText>
          <Rect x="210" y="70" width="110" height="75" fill="#243B55" rx="4" />
          <SvgText x="265" y="107" textAnchor="middle" fill="#6B8099" fontSize="8">10 unidades</SvgText>

          {/* Bloco C */}
          <Rect x="10" y="205" width="130" height="130" fill="#1B4F72" rx="8" />
          <SvgText x="75" y="235" textAnchor="middle" fill="#D4AC0D" fontSize="11" fontWeight="bold">BLOCO C</SvgText>
          <SvgText x="75" y="252" textAnchor="middle" fill="#A8B8C8" fontSize="8">Aptos 301–310</SvgText>

          {/* Bloco D */}
          <Rect x="200" y="205" width="130" height="130" fill="#1B4F72" rx="8" />
          <SvgText x="265" y="235" textAnchor="middle" fill="#D4AC0D" fontSize="11" fontWeight="bold">BLOCO D</SvgText>
          <SvgText x="265" y="252" textAnchor="middle" fill="#A8B8C8" fontSize="8">Aptos 401–410</SvgText>

          {/* Piscina (dentro do centro) */}
          <Rect x="163" y="60" width="14" height="40" fill="#1ABC9C" rx="3" />
          <SvgText x="170" y="106" textAnchor="middle" fill="#1ABC9C" fontSize="6">PISCINA</SvgText>

          {/* Salão + churrasqueira */}
          <Rect x="163" y="205" width="14" height="40" fill="#8E44AD" rx="3" />
          <SvgText x="170" y="251" textAnchor="middle" fill="#8E44AD" fontSize="6">SALÃO</SvgText>

          {/* Estacionamento */}
          <Rect x="10" y="345" width="120" height="10" fill="#7F8C8D" rx="3" />
          <SvgText x="70" y="353" textAnchor="middle" fill="#BDC3C7" fontSize="6">ESTACIONAMENTO</SvgText>
          <Rect x="210" y="345" width="120" height="10" fill="#7F8C8D" rx="3" />
          <SvgText x="270" y="353" textAnchor="middle" fill="#BDC3C7" fontSize="6">ESTACIONAMENTO</SvgText>

          {/* Compass */}
          <SvgText x="318" y="22" textAnchor="middle" fill="#D4AC0D" fontSize="10">N</SvgText>
          <Line x1="318" y1="24" x2="318" y2="36" stroke="#D4AC0D" strokeWidth="1.5" />
        </Svg>
      </View>

      {/* Legend */}
      <Text style={styles.legendTitle}>Legenda</Text>
      <View style={styles.legend}>
        {AREAS.map((area) => (
          <View key={area.id} style={styles.legendItem}>
            <area.Icon size={16} color={area.color} />
            <Text style={styles.legendLabel}>{area.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <MapPin size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>Condomínio localizado em Presidente Prudente, SP.</Text>
        </View>
        <Text style={[styles.infoText, { marginTop: 4 }]}>
          Este mapa é uma representação esquemática dos blocos e áreas comuns.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  subtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.lg },
  mapContainer: {
    alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl, padding: Spacing.md,
    marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: Typography.base, fontWeight: Typography.semiBold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  legend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  legendItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  legendLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  infoBox: {
    backgroundColor: Colors.primaryLight + '22', borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  infoText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
});
