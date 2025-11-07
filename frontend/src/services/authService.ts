import { Company, CompanySignupDTO, Role, User } from '@/lib/types';
import { storage, KEYS } from '@/lib/storage';

// Demo accounts
const DEMO_ACCOUNTS = {
  'employer@demo': {
    password: 'demo123',
    role: 'EMPLOYER' as Role,
    user: {
      id: 'user-1',
      companyId: 'company-1',
      name: 'Demo Employer',
      email: 'employer@demo',
      role: 'EMPLOYER' as Role,
    },
    company: {
      id: 'company-1',
      companyName: 'Demo Tech Solutions',
      email: 'employer@demo',
      website: 'https://demo.com',
      contactNumber: '+919876543210',
      address: '123 Demo Street, Mumbai, Maharashtra, 400001',
      slaDays: 5,
    },
  },
  'verifier@demo': {
    password: 'demo123',
    role: 'VERIFIER' as Role,
    user: {
      id: 'user-2',
      companyId: 'company-1',
      name: 'Demo Verifier',
      email: 'verifier@demo',
      role: 'VERIFIER' as Role,
    },
    company: {
      id: 'company-1',
      companyName: 'Demo Tech Solutions',
      email: 'employer@demo',
      website: 'https://demo.com',
      contactNumber: '+919876543210',
      address: '123 Demo Street, Mumbai, Maharashtra, 400001',
      slaDays: 5,
    },
  },
};

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; role: Role; userId: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check demo accounts
    if (email in DEMO_ACCOUNTS) {
      const account = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
      if (password === account.password) {
        const token = `mock-jwt-${Date.now()}`;
        storage.set(KEYS.AUTH_TOKEN, token);
        storage.set(KEYS.CURRENT_USER, {
          user: account.user,
          company: account.company,
        });

        return {
          token,
          role: account.role,
          userId: account.user.id,
        };
      }
    }

    // Check registered companies
    const companies = storage.get<Company[]>(KEYS.COMPANIES) || [];
    const company = companies.find((c) => c.email === email);

    if (company) {
      const token = `mock-jwt-${Date.now()}`;
      const user: User = {
        id: `user-${Date.now()}`,
        companyId: company.id,
        name: company.companyName,
        email: company.email,
        role: 'EMPLOYER',
      };

      storage.set(KEYS.AUTH_TOKEN, token);
      storage.set(KEYS.CURRENT_USER, { user, company });

      return {
        token,
        role: 'EMPLOYER',
        userId: user.id,
      };
    }

    throw new Error('Invalid email or password');
  },

  async signup(data: CompanySignupDTO): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const companies = storage.get<Company[]>(KEYS.COMPANIES) || [];
    
    // Check if email already exists
    if (companies.some((c) => c.email === data.email)) {
      throw new Error('Email already registered');
    }

    const newCompany: Company = {
      id: `company-${Date.now()}`,
      companyName: data.companyName,
      email: data.email,
      website: data.website,
      companyCertificateUrl: data.companyCertificate
        ? `mock-url-${data.companyCertificate.name}`
        : undefined,
      contactNumber: data.contactNumber,
      address: data.address,
      slaDays: 5,
    };

    companies.push(newCompany);
    storage.set(KEYS.COMPANIES, companies);
  },

  async me(): Promise<{ user: User; company: Company }> {
    const data = storage.get<{ user: User; company: Company }>(KEYS.CURRENT_USER);
    if (!data) {
      throw new Error('Not authenticated');
    }
    return data;
  },

  logout(): void {
    storage.remove(KEYS.AUTH_TOKEN);
    storage.remove(KEYS.CURRENT_USER);
  },

  isAuthenticated(): boolean {
    return !!storage.get(KEYS.AUTH_TOKEN);
  },

  getToken(): string | null {
    return storage.get(KEYS.AUTH_TOKEN);
  },
};
