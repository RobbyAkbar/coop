import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import Input from '@/components/Input';
import Button from '@/components/Button';

type FormData = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
    },
  });

  // Handle password reset request
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In a real app, you would call an API to send reset email
      setIsSubmitted(true);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send password reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackToLogin}
      >
        <ArrowLeft size={24} color={Colors.neutral[800]} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address to receive a password reset link
          </Text>
        </View>

        {!isSubmitted ? (
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={Colors.neutral[500]} />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              fullWidth
              style={styles.resetButton}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to your email. Please check your
              inbox and follow the instructions to reset your password.
            </Text>
            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              variant="outline"
              fullWidth
              style={styles.backToLoginButton}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.lg,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.displaySmall,
    color: Colors.neutral[900],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
  },
  form: {
    marginTop: Spacing.md,
  },
  resetButton: {
    marginTop: Spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
  },
  successTitle: {
    ...Typography.headingMedium,
    color: Colors.primary[700],
    marginBottom: Spacing.md,
  },
  successText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backToLoginButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
  },
  signInText: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
});
