import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Layout';
import { FontFamily, Typography } from '@/constants/Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  helperText,
  fullWidth = true,
  style,
  ...props
}: InputProps) {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          props.editable === false && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={Colors.neutral[500]}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={toggleSecureEntry}
            activeOpacity={0.7}
          >
            {secureTextEntry ? (
              <Eye size={20} color={Colors.neutral[600]} />
            ) : (
              <EyeOff size={20} color={Colors.neutral[600]} />
            )}
          </TouchableOpacity>
        )}
        {!isPassword && rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {(error || helperText) && (
        <Text style={[styles.helperText, error ? styles.errorText : null]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
  },
  input: {
    ...Typography.bodyMedium,
    flex: 1,
    padding: Spacing.md,
    color: Colors.neutral[900],
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  rightIcon: {
    paddingRight: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error[500],
  },
  inputDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[200],
  },
  helperText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    color: Colors.neutral[600],
  },
  errorText: {
    color: Colors.error[500],
  },
});
