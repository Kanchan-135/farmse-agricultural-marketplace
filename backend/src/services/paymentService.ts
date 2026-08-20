import { PaymentMethod, PaymentStatus } from '../types';

export interface PaymentInitiationRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  method: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gatewayReference?: string;
  paidAt?: Date;
  errorMessage?: string;
}

/**
 * Payment Service Abstraction:
 * Provides a clean interface to plug in Razorpay, Stripe, PhonePe, or Mock Payment Processors.
 */
class PaymentService {
  async processPayment(params: PaymentInitiationRequest): Promise<PaymentResult> {
    const timestamp = Date.now();
    const transactionId = `TXN_${params.method}_${timestamp}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // For COD orders, status stays PENDING until delivery
    if (params.method === 'COD') {
      return {
        success: true,
        transactionId,
        paymentMethod: params.method,
        paymentStatus: 'PENDING',
        gatewayReference: 'COD_ON_DELIVERY',
      };
    }

    // For Mock Online Payments (UPI, CARD, NETBANKING), simulate instant successful capture
    return {
      success: true,
      transactionId,
      paymentMethod: params.method,
      paymentStatus: 'COMPLETED',
      gatewayReference: `PG_GATEWAY_${timestamp}`,
      paidAt: new Date(),
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    return true;
  }

  async processRefund(orderId: string, amount: number, reason: string) {
    return {
      refundId: `REF_${Date.now()}`,
      status: 'INITIATED',
      amount,
      reason,
      processedAt: new Date(),
    };
  }
}

export const paymentService = new PaymentService();
