// Mock localStorage-based data store
const STORAGE_KEYS = {
  AUTH_TOKEN: 'eduverify_auth_token',
  CURRENT_USER: 'eduverify_current_user',
  COMPANIES: 'eduverify_companies',
  CANDIDATES: 'eduverify_candidates',
  REQUESTS: 'eduverify_requests',
};

export const storage = {
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  
  clear(): void {
    localStorage.clear();
  },
};

export const KEYS = STORAGE_KEYS;
