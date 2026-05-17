import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing } from '../../constants/typography';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <View style={styles.container}>
    {icon && <View style={styles.iconContainer}>{icon}</View>}
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: { marginBottom: Spacing.base, alignItems: 'center' },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: Typography.base * Typography.normal,
  },
});
