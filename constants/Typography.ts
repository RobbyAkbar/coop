import { Platform, StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const FontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const Typography = StyleSheet.create({
  // Display
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: 40,
    lineHeight: 48,
    color: Colors.neutral[900],
    ...Platform.select({
      web: { letterSpacing: '-0.5px' },
    }),
  },
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.neutral[900],
    ...Platform.select({
      web: { letterSpacing: '-0.5px' },
    }),
  },
  displaySmall: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: Colors.neutral[900],
  },

  // Headings
  headingLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.neutral[900],
  },
  headingMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.neutral[900],
  },
  headingSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.neutral[900],
  },

  // Body
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    lineHeight: 27, // 150% line height
    color: Colors.neutral[800],
  },
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24, // 150% line height
    color: Colors.neutral[800],
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 21, // 150% line height
    color: Colors.neutral[800],
  },

  // Labels
  labelLarge: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.neutral[800],
  },
  labelMedium: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.neutral[800],
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.neutral[800],
  },

  // Captions
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.neutral[600],
  },
});