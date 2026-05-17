import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/typography';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.surfaceLight,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─── Card Skeleton ───────────────────────────────────────────────────────────

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardHeader}>
      <SkeletonBox width={48} height={48} borderRadius={24} />
      <View style={styles.cardInfo}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="50%" height={12} style={styles.mt} />
      </View>
    </View>
    <SkeletonBox width="90%" height={12} style={styles.mt2} />
    <SkeletonBox width="60%" height={12} style={styles.mt} />
  </View>
);

// ─── Row Skeleton ────────────────────────────────────────────────────────────

export const SkeletonRow: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.row, style]}>
    <SkeletonBox width={40} height={40} borderRadius={8} />
    <View style={styles.rowInfo}>
      <SkeletonBox width="60%" height={14} />
      <SkeletonBox width="40%" height={12} style={styles.mt} />
    </View>
  </View>
);

// ─── List Skeleton ───────────────────────────────────────────────────────────

interface SkeletonListProps {
  count?: number;
  variant?: 'card' | 'row';
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 4,
  variant = 'card',
  style,
}) => (
  <View style={[styles.list, style]}>
    {Array.from({ length: count }).map((_, i) =>
      variant === 'card' ? (
        <SkeletonCard key={i} />
      ) : (
        <SkeletonRow key={i} />
      )
    )}
  </View>
);

export { SkeletonBox };

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rowInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  list: {
    gap: Spacing.md,
    padding: Spacing.base,
  },
  mt: {
    marginTop: 4,
  },
  mt2: {
    marginTop: Spacing.sm,
  },
});
