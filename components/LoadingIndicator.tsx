import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
