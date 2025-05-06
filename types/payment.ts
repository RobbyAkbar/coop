import { Transaction } from './index';

export interface PaymentValidationError {
  field: string;
  message: string;
}

export interface PaymentDetails {
  amount: number;
  reference: string;
  description?: string;
  timestamp: string;
}

export interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
}

export interface PaymentSubmissionResult {
  success: boolean;
  error?: PaymentValidationError;
  transaction?: Transaction;
}
