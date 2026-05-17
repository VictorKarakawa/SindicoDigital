import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, BorderRadius, Spacing } from '../../constants/typography';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.accent : Colors.textInverse}
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: Colors.accent },
  secondary: { backgroundColor: Colors.primaryLight },
  outline: { backgroundColor: Colors.transparent, borderWidth: 1.5, borderColor: Colors.accent },
  ghost: { backgroundColor: Colors.transparent },
  danger: { backgroundColor: Colors.error },

  // Sizes
  size_sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, minHeight: 36 },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 48 },
  size_lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl, minHeight: 56 },

  // Text base
  text: { fontWeight: Typography.semiBold },

  // Text by variant
  text_primary: { color: Colors.textInverse },
  text_secondary: { color: Colors.white },
  text_outline: { color: Colors.accent },
  text_ghost: { color: Colors.accent },
  text_danger: { color: Colors.white },

  // Text by size
  textSize_sm: { fontSize: Typography.sm },
  textSize_md: { fontSize: Typography.base },
  textSize_lg: { fontSize: Typography.lg },
});
