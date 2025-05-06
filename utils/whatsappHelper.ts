import { PaymentDetails, WhatsAppMessage } from '@/types/payment';
import { formatNumber } from './numberFormatter';
import { Platform } from 'react-native';

const ADMIN_PHONE = '6281234567890'; // Replace with actual admin number

export function formatWhatsAppMessage(payment: PaymentDetails): string {
  const formattedAmount = formatNumber(payment.amount, { currency: 'Rp' });
  const formattedDate = new Date(payment.timestamp).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `*PAYMENT CONFIRMATION*\n\n` +
    `Amount: ${formattedAmount}\n` +
    `Reference: ${payment.reference}\n` +
    `Time: ${formattedDate}\n` +
    (payment.description ? `Description: ${payment.description}\n` : '') +
    `\nPlease confirm this payment.`;
}

export function generateWhatsAppLink(message: WhatsAppMessage): string {
  const encodedMessage = encodeURIComponent(message.message);
  
  // Use appropriate URL scheme based on platform
  const baseUrl = Platform.select({
    ios: 'whatsapp://',
    android: 'whatsapp://',
    default: 'https://wa.me/'
  });

  // Remove any non-numeric characters from phone number
  const cleanPhone = message.phoneNumber.replace(/\D/g, '');
  
  return `${baseUrl}send?phone=${cleanPhone}&text=${encodedMessage}`;
}
