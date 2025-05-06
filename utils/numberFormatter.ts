import { Platform } from 'react-native';

export interface NumberFormatterOptions {
  /** Number of decimal places to show */
  decimals?: number;
  /** Currency symbol or code to prepend */
  currency?: string;
  /** Custom decimal separator */
  decimalSeparator?: string;
  /** Custom thousands separator */
  thousandsSeparator?: string;
  /** Whether to show plus sign for positive numbers */
  showPositiveSign?: boolean;
  /** Whether to show currency symbol */
  showCurrency?: boolean;
  /** Whether to compact large numbers (e.g., 1K, 1M) */
  compact?: boolean;
}

const DEFAULT_OPTIONS: NumberFormatterOptions = {
  decimals: 0,
  decimalSeparator: ',',
  thousandsSeparator: '.',
  showPositiveSign: false,
  showCurrency: true,
  compact: false,
};

/**
 * Formats a number according to the specified options
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted string
 * @example
 * ```typescript
 * // Basic usage
 * formatNumber(1234.56) // "1.234"
 * 
 * // With currency
 * formatNumber(1234.56, { currency: 'Rp', decimals: 2 }) // "Rp 1.234,56"
 * 
 * // Negative numbers
 * formatNumber(-1234.56, { currency: '$', decimals: 2 }) // "-$1,234.56"
 * 
 * // Compact notation
 * formatNumber(1234567, { compact: true }) // "1.2M"
 * ```
 */
export function formatNumber(
  value: number | string | null | undefined,
  options?: NumberFormatterOptions
): string {
  // Handle invalid input
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Parse input to number
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Handle NaN
  if (isNaN(num)) {
    return '';
  }

  // Merge options with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Handle compact notation
  if (opts.compact) {
    const absNum = Math.abs(num);
    if (absNum >= 1e9) {
      return `${(num / 1e9).toFixed(1)}B`;
    }
    if (absNum >= 1e6) {
      return `${(num / 1e6).toFixed(1)}M`;
    }
    if (absNum >= 1e3) {
      return `${(num / 1e3).toFixed(1)}K`;
    }
  }

  // Format the number
  const parts = Math.abs(num)
    .toFixed(opts.decimals)
    .split('.');

  // Format integer part with thousand separators
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandsSeparator);

  // Combine integer and decimal parts
  let formatted = parts.join(opts.decimalSeparator);

  // Add sign
  if (num < 0) {
    formatted = `-${formatted}`;
  } else if (opts.showPositiveSign) {
    formatted = `+${formatted}`;
  }

  // Add currency
  if (opts.currency && opts.showCurrency) {
    formatted = `${opts.currency} ${formatted}`;
  }

  return formatted;
}

/**
 * Formats a number as currency
 * @param value - Number to format
 * @param currency - Currency symbol or code
 * @param options - Additional formatting options
 * @returns Formatted currency string
 * @example
 * ```typescript
 * formatCurrency(1234.56, 'Rp') // "Rp 1.234,56"
 * ```
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'Rp',
  options?: Omit<NumberFormatterOptions, 'currency'>
): string {
  return formatNumber(value, {
    decimals: 0,
    currency,
    showCurrency: true,
    ...options,
  });
}

/**
 * Formats a number as a percentage
 * @param value - Number to format (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 * @example
 * ```typescript
 * formatPercent(75.5) // "75,5%"
 * ```
 */
export function formatPercent(
  value: number | string | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return '';
  }

  return `${num.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Removes formatting from a number string
 * @param value - Formatted number string
 * @returns Clean number string
 * @example
 * ```typescript
 * unformatNumber("1.234,56") // "1234.56"
 * ```
 */
export function unformatNumber(value: string): string {
  if (!value) return '';

  // Remove currency symbol and any non-numeric characters except decimal separator
  const cleaned = value.replace(/[^\d,-]/g, '');

  // Replace decimal separator with dot for parsing
  return cleaned.replace(',', '.');
}
