import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { RootState } from '@/store';
import { checkAuth } from '@/store/slices/authSlice';

export default function AuthLayout() {
  const dispatch = useDispatch();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is already authenticated
    dispatch(checkAuth() as any);
  }, [dispatch]);

  useEffect(() => {
    // Redirect to main app if authenticated
    if (token && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
    </Stack>
  );
}

import { Colors } from '@/constants/Colors';
