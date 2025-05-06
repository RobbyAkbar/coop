import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { Home, Receipt, PiggyBank, User } from 'lucide-react-native';
import { RootState } from '@/store';
import { checkAuth } from '@/store/slices/authSlice';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/constants/Typography';

export default function TabLayout() {
  const dispatch = useDispatch();
  const { token, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    dispatch(checkAuth() as any);
  }, [dispatch]);

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!token && !isLoading) {
      router.replace('/auth/login');
    }
  }, [token, isLoading]);

  // If still checking auth status, return nothing
  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.neutral[500],
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: 12,
        },
        tabBarStyle: {
          height: 60
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Savings',
          tabBarIcon: ({ color, size }) => (
            <PiggyBank size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Receipt size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
