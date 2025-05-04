import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/Layout';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
}

export default function Card({
  variant = 'elevated',
  padding = 'medium',
  elevation = 'medium',
  borderRadius = 'medium',
  backgroundColor,
  style,
  children,
  ...props
}: CardProps) {
  // Get variant style
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      default:
        return styles.elevated;
    }
  };

  // Get padding style
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'small':
        return styles.paddingSmall;
      case 'medium':
        return styles.paddingMedium;
      case 'large':
        return styles.paddingLarge;
      default:
        return styles.paddingMedium;
    }
  };

  // Get elevation style
  const getElevationStyle = () => {
    if (variant !== 'elevated') return {};

    switch (elevation) {
      case 'none':
        return {};
      case 'small':
        return Shadow.small;
      case 'medium':
        return Shadow.medium;
      case 'large':
        return Shadow.large;
      default:
        return Shadow.medium;
    }
  };

  // Get border radius style
  const getBorderRadiusStyle = () => {
    switch (borderRadius) {
      case 'none':
        return styles.borderRadiusNone;
      case 'small':
        return styles.borderRadiusSmall;
      case 'medium':
        return styles.borderRadiusMedium;
      case 'large':
        return styles.borderRadiusLarge;
      default:
        return styles.borderRadiusMedium;
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        getPaddingStyle(),
        getBorderRadiusStyle(),
        getElevationStyle(),
        backgroundColor && { backgroundColor },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: Colors.white,
  },
  outlined: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filled: {
    backgroundColor: Colors.neutral[100],
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: Spacing.sm,
  },
  paddingMedium: {
    padding: Spacing.md,
  },
  paddingLarge: {
    padding: Spacing.lg,
  },
  borderRadiusNone: {
    borderRadius: 0,
  },
  borderRadiusSmall: {
    borderRadius: BorderRadius.sm,
  },
  borderRadiusMedium: {
    borderRadius: BorderRadius.md,
  },
  borderRadiusLarge: {
    borderRadius: BorderRadius.lg,
  },
});