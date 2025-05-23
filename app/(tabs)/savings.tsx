import React, { useState, useCallback } from 'react';
import {
	Linking,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ArrowLeft, ClipboardCopy, Check } from 'lucide-react-native';
import { createTransaction } from '@/store/slices/transactionSlice';
import { fetchBalance } from '@/store/slices/appSlice';
import { RootState } from '@/store';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadow } from '@/constants/Layout';
import { Typography, FontFamily } from '@/constants/Typography';
import Card from '@/components/Card';
import Button from '@/components/Button';
import NumericInput from '@/components/NumericInput';
import { formatNumber, unformatNumber } from '@/utils/numberFormatter';
import { PaymentDetails, PaymentValidationError } from '@/types/payment';
import { validatePayment } from '@/utils/paymentValidator';
import { formatWhatsAppMessage, generateWhatsAppLink } from '@/utils/whatsappHelper';

enum PaymentStatus {
  INPUT,
  QRCODE,
  PENDING,
  SUCCESS,
  FAILED,
}

export default function SavingsScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { isLoading } = useSelector((state: RootState) => state.transaction);
  
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(generateReference());
  const [description, setDescription] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.INPUT);
  const [copied, setCopied] = useState(false);

  // Animation values
  const scale = useSharedValue(1);

  // Generate random reference number
  function generateReference() {
    return `TRX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
  }

  // Handle amount change
  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  // Handle generate QR code
  const handleGenerateQR = () => {
    if (!amount || parseInt(amount) < 10000) {
      // Shake animation for invalid input
      scale.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 50 }),
      );
      return;
    }

    // Convert to PaymentStatus.QRCODE
    setPaymentStatus(PaymentStatus.QRCODE);
  };

  // Handle submit payment
  const handleSubmitPayment = async () => {
  try {
    // Validate payment
    const validationError = validatePayment(amount, description);
    if (validationError) {
      Alert.alert('Validation Error', validationError.message);
      return;
    }

    // Set to pending state
    setPaymentStatus(PaymentStatus.PENDING);

    // Prepare payment details
    const paymentDetails: PaymentDetails = {
      amount: parseFloat(amount.replace(/[^0-9.-]+/g, '')),
      reference,
      description,
      timestamp: new Date().toISOString(),
    };

    // Create transaction in Redux
    const result = await dispatch(
      createTransaction({
        type: 'deposit',
        amount: paymentDetails.amount,
        description: paymentDetails.description,
      }) as any
    ).unwrap();

    // Format WhatsApp message
    const message = formatWhatsAppMessage(paymentDetails);
    const whatsappLink = generateWhatsAppLink({
      phoneNumber: '6281234567890', // Replace with actual admin number
      message,
    });

    // Update balance and set success state
    await dispatch(fetchBalance() as any);
    setPaymentStatus(PaymentStatus.SUCCESS);

    // Open WhatsApp
    const canOpen = await Linking.canOpenURL(whatsappLink);
    if (canOpen) {
      await Linking.openURL(whatsappLink);
    } else {
      Alert.alert(
        'WhatsApp Not Available',
        'Please make sure WhatsApp is installed on your device.'
      );
    }
  } catch (error) {
    console.error('Payment submission failed:', error);
    setPaymentStatus(PaymentStatus.FAILED);
    
    Alert.alert(
      'Payment Failed',
      'There was an error processing your payment. Please try again.'
    );
  }
};

  // Handle copy reference
  const handleCopyReference = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset payment flow
  const resetPaymentFlow = () => {
    setAmount('');
    setReference(generateReference());
    setDescription('');
    setPaymentStatus(PaymentStatus.INPUT);
  };

  // Handle back button
  const handleBack = () => {
    if (paymentStatus === PaymentStatus.QRCODE) {
      setPaymentStatus(PaymentStatus.INPUT);
    } else if (
      paymentStatus === PaymentStatus.SUCCESS ||
      paymentStatus === PaymentStatus.FAILED
    ) {
      resetPaymentFlow();
    }
  };

  // Shake animation style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: scale.value }],
    };
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        {paymentStatus !== PaymentStatus.INPUT && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.neutral[800]} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {paymentStatus === PaymentStatus.INPUT && 'Add Savings'}
          {paymentStatus === PaymentStatus.QRCODE && 'QRIS Payment'}
          {paymentStatus === PaymentStatus.PENDING && 'Processing Payment'}
          {paymentStatus === PaymentStatus.SUCCESS && 'Payment Successful'}
          {paymentStatus === PaymentStatus.FAILED && 'Payment Failed'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Input Form */}
        {paymentStatus === PaymentStatus.INPUT && (
          <Animated.View style={[styles.formContainer, animatedStyle]}>
            <Text style={styles.formLabel}>Enter Amount</Text>
            <NumericInput
              value={amount}
              onChangeText={handleAmountChange}
              prefix="Rp"
              placeholder="0"
              placeholderTextColor={Colors.neutral[400]}
              error={parseInt(amount || '0') < 10000 ? 'Minimum amount: Rp 10.000' : undefined}
            />

            <View style={styles.descriptionContainer}>
              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter payment description"
                placeholderTextColor={Colors.neutral[400]}
                multiline
                maxLength={100}
              />
              <Text style={styles.characterCount}>
                {description.length}/100
              </Text>
            </View>

            <Button
              title="Generate Payment QR"
              onPress={handleGenerateQR}
              fullWidth
              style={styles.generateButton}
            />
          </Animated.View>
        )}

        {/* QR Code Display */}
        {paymentStatus === PaymentStatus.QRCODE && (
          <View style={styles.qrContainer}>
            <Card variant="elevated" padding="large" style={styles.qrCard}>
              <View style={styles.amountDisplay}>
                <Text style={styles.amountLabel}>Amount to Pay</Text>
                <Text style={styles.amountValue}>
                  {formatNumber(amount, { currency: 'Rp' })}
                </Text>
              </View>

              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={`NYIMPANG:${reference}:${amount}:${description}`}
                  size={200}
                  color={Colors.primary[900]}
                  backgroundColor="white"
                />
              </View>

              <View style={styles.referenceContainer}>
                <View style={styles.referenceHeader}>
                  <Text style={styles.referenceLabel}>Reference Number</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyReference}
                  >
                    {copied ? (
                      <Check size={18} color={Colors.success[500]} />
                    ) : (
                      <ClipboardCopy size={18} color={Colors.neutral[600]} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.referenceNumber}>{reference}</Text>
              </View>

              <Text style={styles.instructionText}>
                Scan this QR code using your mobile banking app to make the payment.
              </Text>

              <Button
                title="I've Made the Payment"
                onPress={handleSubmitPayment}
                fullWidth
                style={styles.paymentButton}
              />
            </Card>
          </View>
        )}

        {/* Payment Processing */}
        {paymentStatus === PaymentStatus.PENDING && (
          <View style={styles.statusContainer}>
            <Card variant="elevated" padding="large" style={styles.statusCard}>
              <View style={styles.pendingAnimation}>
                {/* Replace with actual loading animation */}
                <View style={styles.loadingCircle} />
              </View>
              <Text style={styles.statusTitle}>Processing Payment</Text>
              <Text style={styles.statusMessage}>
                Please wait while we verify your payment...
              </Text>
              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Amount:</Text>
                  <Text style={styles.paymentDetailValue}>
                    {formatNumber(amount, { currency: 'Rp' })}
                  </Text>
                </View>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Reference:</Text>
                  <Text style={styles.paymentDetailValue}>{reference}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Payment Success */}
        {paymentStatus === PaymentStatus.SUCCESS && (
          <View style={styles.statusContainer}>
            <Card
              variant="elevated"
              padding="large"
              style={[styles.statusCard, styles.successCard]}
            >
              <View style={[styles.statusIcon, styles.successIcon]}>
                <Check size={40} color={Colors.white} />
              </View>
              <Text style={styles.statusTitle}>Payment Successful!</Text>
              <Text style={styles.statusMessage}>
                Your savings have been added to your account.
              </Text>

              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Amount:</Text>
                  <Text style={styles.paymentDetailValue}>
                    {formatNumber(amount, { currency: 'Rp' })}
                  </Text>
                </View>

                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Reference:</Text>
                  <Text style={styles.paymentDetailValue}>{reference}</Text>
                </View>

                {description ? (
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentDetailLabel}>Description:</Text>
                    <Text style={styles.paymentDetailValue}>{description}</Text>
                  </View>
                ) : null}
              </View>

              <Button
                title="Done"
                onPress={resetPaymentFlow}
                fullWidth
                style={styles.doneButton}
              />
            </Card>
          </View>
        )}

        {/* Payment Failed */}
        {paymentStatus === PaymentStatus.FAILED && (
          <View style={styles.statusContainer}>
            <Card
              variant="elevated"
              padding="large"
              style={[styles.statusCard, styles.failedCard]}
            >
              <View style={[styles.statusIcon, styles.failedIcon]}>
                <Text style={styles.failedIconText}>!</Text>
              </View>
              <Text style={styles.statusTitle}>Payment Failed</Text>
              <Text style={styles.statusMessage}>
                We couldn't process your payment. Please try again.
              </Text>
              <View style={styles.paymentDetails}>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Amount:</Text>
                  <Text style={styles.paymentDetailValue}>
                    {formatNumber(amount, { currency: 'Rp' })}
                  </Text>
                </View>
                <View style={styles.paymentDetailRow}>
                  <Text style={styles.paymentDetailLabel}>Reference:</Text>
                  <Text style={styles.paymentDetailValue}>{reference}</Text>
                </View>
              </View>
              <Button
                title="Try Again"
                onPress={resetPaymentFlow}
                fullWidth
                style={styles.tryAgainButton}
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    position: 'absolute',
    left: Spacing.lg,
  },
  headerTitle: {
    ...Typography.headingMedium,
    color: Colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  formContainer: {
    padding: Spacing.lg,
  },
  formLabel: {
    ...Typography.labelLarge,
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  descriptionContainer: {
    marginBottom: Spacing.lg,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...Typography.caption,
    color: Colors.neutral[500],
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
  generateButton: {
    marginTop: Spacing.md,
  },
  qrContainer: {
    padding: Spacing.lg,
  },
  qrCard: {
    alignItems: 'center',
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  amountLabel: {
    ...Typography.labelMedium,
    color: Colors.neutral[600],
    marginBottom: Spacing.xs,
  },
  amountValue: {
    ...Typography.displaySmall,
    color: Colors.primary[600],
  },
  qrCodeWrapper: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    ...Shadow.small,
    marginBottom: Spacing.lg,
  },
  referenceContainer: {
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  referenceLabel: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
  },
  copyButton: {
    padding: Spacing.xs,
  },
  referenceNumber: {
    ...Typography.labelLarge,
    color: Colors.neutral[900],
  },
  instructionText: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  paymentButton: {},
  statusContainer: {
    padding: Spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  statusCard: {
    alignItems: 'center',
  },
  successCard: {
    borderTopWidth: 5,
    borderTopColor: Colors.success[500],
  },
  failedCard: {
    borderTopWidth: 5,
    borderTopColor: Colors.error[500],
  },
  pendingAnimation: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: Colors.primary[500],
    borderTopColor: Colors.primary[100],
    marginBottom: Spacing.md,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    backgroundColor: Colors.success[500],
  },
  failedIcon: {
    backgroundColor: Colors.error[500],
  },
  failedIconText: {
    ...Typography.displayMedium,
    color: Colors.white,
    fontWeight: 'bold',
  },
  statusTitle: {
    ...Typography.headingLarge,
    color: Colors.neutral[900],
    marginBottom: Spacing.sm,
  },
  statusMessage: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  paymentDetails: {
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  paymentDetailLabel: {
    ...Typography.labelMedium,
    color: Colors.neutral[600],
  },
  paymentDetailValue: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    flex: 1,
    textAlign: 'right',
  },
  doneButton: {
    backgroundColor: Colors.success[500],
  },
  tryAgainButton: {
    backgroundColor: Colors.primary[500],
  },
});
