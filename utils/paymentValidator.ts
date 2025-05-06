import { PaymentValidationError } from '@/types/payment';

export function validatePayment(amount: string, description?: string): PaymentValidationError | null {
  // Validate amount
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
  
  if (isNaN(numericAmount)) {
    return {
      field: 'amount',
      message: 'Invalid payment amount'
    };
  }

  if (numericAmount < 10000) {
    return {
      field: 'amount',
      message: 'Minimum amount is Rp 10.000'
    };
  }

  // Validate description length if provided
  if (description && description.length > 100) {
    return {
      field: 'description',
      message: 'Description must not exceed 100 characters'
    };
  }

  return null;
}
