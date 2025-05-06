import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Layout';
import { Typography, FontFamily } from '@/constants/Typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButtonText;
      case 'secondary':
        return styles.secondaryButtonText;
      case 'outline':
        return styles.outlineButtonText;
      case 'ghost':
        return styles.ghostButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButtonText;
      case 'medium':
        return styles.mediumButtonText;
      case 'large':
        return styles.largeButtonText;
      default:
        return styles.mediumButtonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary[500]}
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.buttonText,
              getTextStyle(),
              getTextSizeStyle(),
              disabled && styles.disabledText,
              variant === 'outline' && style?.borderColor && { color: style.borderColor },
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  smallButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: Colors.secondary[500],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    textAlign: 'center',
    fontFamily: FontFamily.medium,
  },
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.white,
  },
  outlineButtonText: {
    color: Colors.primary[500],
  },
  ghostButtonText: {
    color: Colors.primary[500],
  },
  smallButtonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumButtonText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeButtonText: {
    fontSize: 18,
    lineHeight: 26,
  },
  iconLeft: {
    marginRight: Spacing.xs,
  },
  iconRight: {
    marginLeft: Spacing.xs,
  },
  disabledButton: {
    backgroundColor: Colors.neutral[300],
    borderColor: Colors.neutral[300],
  },
  disabledText: {
    color: Colors.neutral[600],
  },
});
