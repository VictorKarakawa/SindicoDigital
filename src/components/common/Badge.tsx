import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, BorderRadius, Spacing } from '../../constants/typography';

type BadgeColor = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  style?: ViewStyle;
}

const colorMap: Record<BadgeColor, { bg: string; text: string }> = {
  primary:  { bg: Colors.primaryLight + '33', text: Colors.primaryLight },
  accent:   { bg: Colors.accent + '33',       text: Colors.accentLight },
  success:  { bg: Colors.successLight,        text: Colors.success },
  warning:  { bg: Colors.warningLight,        text: Colors.warning },
  error:    { bg: Colors.errorLight,          text: Colors.error },
  info:     { bg: Colors.infoLight,           text: Colors.info },
  muted:    { bg: Colors.surfaceLight,        text: Colors.textMuted },
};

export const Badge: React.FC<BadgeProps> = ({ label, color = 'primary', style }) => {
  const { bg, text } = colorMap[color];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

// Specific badge for notice priority
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, BadgeColor> = {
    low: 'success', medium: 'warning', high: 'error', urgent: 'error',
  };
  const labelMap: Record<string, string> = {
    low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
  };
  return <Badge label={labelMap[priority] ?? priority} color={map[priority] ?? 'muted'} />;
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
  },
  text: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
});
