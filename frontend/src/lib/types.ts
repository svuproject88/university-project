export type Role = 'EMPLOYER' | 'VERIFIER';

export type Company = {
  id: string;
  companyName: string;
  email: string;
  website?: string;
  companyCertificateUrl?: string;
  contactNumber: string;
  address: string;
  brandLogo?: string;
  slaDays: number;
};

export type User = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: Role;
};

export type Candidate = {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  degreeName: string;
  pcNumber?: string;
  initials?: string;
  universityName: string;
  enrollmentOrRollNo?: string;
  graduationYear?: number;
  documentUrls: string[];
};

export type RequestStatus = 'DRAFT' | 'PAYMENT_PENDING' | 'PAYMENT_SUCCESS' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';

export type PaymentStatus = 'NOT_PAID' | 'PAID' | 'FAILED';
export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking';

export type Payment = {
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  txnId?: string;
  paidAt?: string;
  method?: PaymentMethod;
};

export type CheckSubstatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFIED' | 'ISSUE';

export type VerificationCheck = {
  id: string;
  requestId: string;
  type: 'EDUCATION';
  substatus: CheckSubstatus;
  registrarEmail?: string;
  registrarPhone?: string;
  notes?: string;
  evidenceUrls: string[];
  updatedAt: string;
};

export type TimelineEntry = {
  at: string;
  by: string;
  action: string;
};

export type VerificationRequest = {
  id: string;
  companyId: string;
  candidateId: string;
  status: RequestStatus;
  fee: number;
  payment: Payment;
  check: VerificationCheck;
  createdBy: string;
  createdAt: string;
  dueAt: string;
  timeline: TimelineEntry[];
  rejectionReason?: string;
};

export type NewCandidateDTO = Omit<Candidate, 'id'>;

export type NewRequestDTO = {
  candidateId: string;
};

export type CompanySignupDTO = {
  companyName: string;
  email: string;
  password: string;
  website?: string;
  companyCertificate?: File;
  contactNumber: string;
  address: string;
};

export type Receipt = {
  requestId: string;
  companyName: string;
  amount: number;
  currency: string;
  method?: PaymentMethod;
  txnId: string;
  paidAt: string;
};
