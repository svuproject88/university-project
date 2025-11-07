import { PaymentMethod, Receipt } from '@/lib/types';

export const paymentService = {
  async createOrder(
    reqId: string,
    amount: number
  ): Promise<{ orderId: string; amount: number; currency: 'INR' }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      orderId: `order-${Date.now()}`,
      amount,
      currency: 'INR',
    };
  },

  async pay(
    orderId: string,
    method: PaymentMethod
  ): Promise<{ txnId: string; status: 'PAID' | 'FAILED'; paidAt?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock success 90% of the time
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        txnId: `TXN${Date.now()}`,
        status: 'PAID',
        paidAt: new Date().toISOString(),
      };
    } else {
      return {
        txnId: `TXN${Date.now()}`,
        status: 'FAILED',
      };
    }
  },

  async getReceipt(reqId: string): Promise<Receipt> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Mock receipt - would fetch from backend in real app
    return {
      requestId: reqId,
      companyName: 'Demo Tech Solutions',
      amount: 500,
      currency: 'INR',
      method: 'UPI',
      txnId: `TXN${Date.now()}`,
      paidAt: new Date().toISOString(),
    };
  },
};
