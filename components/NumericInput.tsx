import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  LayoutChangeEvent,
  ScrollView,
  Platform,
  TextInputProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Layout';
import { Typography, FontFamily } from '@/constants/Typography';
import { formatNumber, unformatNumber } from '@/utils/numberFormatter';

interface NumericInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (value: string) => void;
  prefix?: string;
  maxValue?: number;
  minValue?: number;
  error?: string;
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
}

export default function NumericInput({
  value,
  onChangeText,
  prefix = '',
  maxValue = 999999999999999,
  minValue = 0,
  error,
  decimals = 0,
  thousandsSeparator = '.',
  decimalSeparator = ',',
  style,
  ...props
}: NumericInputProps) {
  const [fontSize, setFontSize] = useState(28);
  const [containerWidth, setContainerWidth] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle text change
  const handleTextChange = (text: string) => {
    const cleanNum = unformatNumber(text);
    const num = parseFloat(cleanNum || '0');

    if (num > maxValue) {
      onChangeText(maxValue.toString());
    } else if (num < minValue) {
      onChangeText(minValue.toString());
    } else {
      onChangeText(cleanNum);
    }
  };

  // Handle container layout change
  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Auto-adjust font size based on content width
  useEffect(() => {
    if (!containerWidth) return;

    const measureText = async () => {
      const formattedValue = formatNumber(value, {
        decimals,
        thousandsSeparator,
        decimalSeparator,
      });
      const textWidth = (formattedValue.length + prefix.length) * fontSize * 0.6;
      const maxWidth = containerWidth - Spacing.md * 2;

      if (textWidth > maxWidth && fontSize > 16) {
        setFontSize(current => Math.max(current - 2, 16));
      } else if (textWidth < maxWidth * 0.8 && fontSize < 28) {
        setFontSize(current => Math.min(current + 2, 28));
      }
    };

    measureText();
  }, [value, containerWidth, prefix, decimals, thousandsSeparator, decimalSeparator]);

  // Scroll to end when value changes
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer} onLayout={handleLayout}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.inputWrapper}>
            <Text style={[styles.prefix, { fontSize }]}>{prefix}</Text>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { fontSize },
                style,
              ]}
              value={formatNumber(value, {
                decimals,
                thousandsSeparator,
                decimalSeparator,
              })}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              selectTextOnFocus
              {...props}
            />
          </View>
        </ScrollView>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  prefix: {
    fontFamily: FontFamily.medium,
    color: Colors.neutral[700],
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.medium,
    color: Colors.neutral[900],
    padding: Spacing.md,
    minWidth: 60,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error[500],
    marginTop: Spacing.xs,
  },
});
