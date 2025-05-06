import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Mail, Lock, SquareCheck as CheckSquare } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { RootState } from '@/store';
import { login, clearError } from '@/store/slices/authSlice';

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginScreen() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [biometricSupported, setBiometricSupported] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Check if device supports biometric authentication
  React.useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);
    })();
  }, []);

  // Handle login submission
  const onSubmit = async (data: FormData) => {
    dispatch(clearError());
    dispatch(
      login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      }) as any
    );
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use password instead',
      });

      if (biometricAuth.success) {
        // In a real app, you'd retrieve stored credentials
        // This is just a placeholder implementation
        dispatch(
          login({
            email: 'stored@email.com',
            password: 'storedPassword',
            rememberMe: true,
          }) as any
        );
      }
    } catch (error) {
      Alert.alert('Authentication Error', 'Biometric authentication failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Please sign in to access your account
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                isPassword={true}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Lock size={20} color={Colors.neutral[500]} />}
                error={errors.password?.message}
              />
            )}
          />

          <View style={styles.rememberForgotRow}>
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => onChange(!value)}
                >
                  <CheckSquare
                    size={20}
                    color={
                      value ? Colors.primary[500] : Colors.neutral[400]
                    }
                    fill={value ? Colors.primary[50] : 'transparent'}
                  />
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>
              )}
            />

            <Link href="/auth/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            style={styles.signInButton}
          />

          {biometricSupported && (
            <Button
              title="Sign In with Biometrics"
              variant="outline"
              onPress={handleBiometricAuth}
              fullWidth
              style={styles.biometricButton}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
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
  errorContainer: {
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error[700],
  },
  form: {
    marginTop: Spacing.md,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
    marginLeft: Spacing.xs,
  },
  forgotPassword: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
  signInButton: {
    marginTop: Spacing.md,
  },
  biometricButton: {
    marginTop: Spacing.md,
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
  signUpText: {
    ...Typography.labelMedium,
    color: Colors.primary[600],
  },
});
