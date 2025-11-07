import {
  VerificationRequest,
  NewRequestDTO,
  RequestStatus,
  Candidate,
} from '@/lib/types';
import { storage, KEYS } from '@/lib/storage';
import { authService } from './authService';

const VERIFICATION_FEE = 500;

export const requestService = {
  async list(params?: {
    status?: RequestStatus;
    university?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<VerificationRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let requests = storage.get<VerificationRequest[]>(KEYS.REQUESTS) || [];
    
    // Filter by params
    if (params?.status) {
      requests = requests.filter((r) => r.status === params.status);
    }
    if (params?.university) {
      // Would need to join with candidate data
    }
    if (params?.dateFrom) {
      requests = requests.filter((r) => r.createdAt >= params.dateFrom!);
    }
    if (params?.dateTo) {
      requests = requests.filter((r) => r.createdAt <= params.dateTo!);
    }
    
    return requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async get(id: string): Promise<VerificationRequest> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const requests = storage.get<VerificationRequest[]>(KEYS.REQUESTS) || [];
    const request = requests.find((r) => r.id === id);
    
    if (!request) {
      throw new Error('Request not found');
    }
    
    return request;
  },

  async create(payload: NewRequestDTO): Promise<VerificationRequest> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const { user, company } = await authService.me();
    const requests = storage.get<VerificationRequest[]>(KEYS.REQUESTS) || [];
    
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + company.slaDays);
    
    const newRequest: VerificationRequest = {
      id: `REQ${Date.now()}`,
      companyId: company.id,
      candidateId: payload.candidateId,
      status: 'PAYMENT_PENDING',
      fee: VERIFICATION_FEE,
      payment: {
        amount: VERIFICATION_FEE,
        currency: 'INR',
        status: 'NOT_PAID',
      },
      check: {
        id: `check-${Date.now()}`,
        requestId: `REQ${Date.now()}`,
        type: 'EDUCATION',
        substatus: 'NOT_STARTED',
        evidenceUrls: [],
        updatedAt: now.toISOString(),
      },
      createdBy: user.id,
      createdAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
      timeline: [
        {
          at: now.toISOString(),
          by: user.name,
          action: 'Request created',
        },
      ],
    };
    
    requests.push(newRequest);
    storage.set(KEYS.REQUESTS, requests);
    
    return newRequest;
  },

  async update(id: string, patch: Partial<VerificationRequest>): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const requests = storage.get<VerificationRequest[]>(KEYS.REQUESTS) || [];
    const index = requests.findIndex((r) => r.id === id);
    
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    requests[index] = { ...requests[index], ...patch };
    storage.set(KEYS.REQUESTS, requests);
  },

  async setStatus(id: string, status: RequestStatus, reason?: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const { user } = await authService.me();
    const requests = storage.get<VerificationRequest[]>(KEYS.REQUESTS) || [];
    const index = requests.findIndex((r) => r.id === id);
    
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    const request = requests[index];
    request.status = status;
    
    if (reason && status === 'REJECTED') {
      request.rejectionReason = reason;
    }
    
    request.timeline.push({
      at: new Date().toISOString(),
      by: user.name,
      action: `Status changed to ${status}`,
    });
    
    storage.set(KEYS.REQUESTS, requests);
  },

  async updatePayment(
    id: string,
    payment: {
      status: 'PAID' | 'FAILED';
      txnId?: string;
      paidAt?: string;
      method?: 'UPI' | 'Card' | 'NetBanking';
    }
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const { user } = await authService.me();
    const requests = storage.get<VerificationRequest[]>(KEYS.REQUESTS) || [];
    const index = requests.findIndex((r) => r.id === id);
    
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    const request = requests[index];
    request.payment = { ...request.payment, ...payment };
    
    if (payment.status === 'PAID') {
      request.status = 'IN_PROGRESS';
      request.timeline.push({
        at: new Date().toISOString(),
        by: user.name,
        action: `Payment successful - ₹${request.fee}`,
      });
    } else {
      request.timeline.push({
        at: new Date().toISOString(),
        by: user.name,
        action: 'Payment failed',
      });
    }
    
    storage.set(KEYS.REQUESTS, requests);
  },
};
