import { Candidate, NewCandidateDTO } from '@/lib/types';
import { storage, KEYS } from '@/lib/storage';

export const candidateService = {
  async list(): Promise<Candidate[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return storage.get<Candidate[]>(KEYS.CANDIDATES) || [];
  },

  async get(id: string): Promise<Candidate> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const candidates = storage.get<Candidate[]>(KEYS.CANDIDATES) || [];
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    return candidate;
  },

  async create(payload: NewCandidateDTO): Promise<Candidate> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const candidates = storage.get<Candidate[]>(KEYS.CANDIDATES) || [];
    const newCandidate: Candidate = {
      ...payload,
      id: `candidate-${Date.now()}`,
    };
    
    candidates.push(newCandidate);
    storage.set(KEYS.CANDIDATES, candidates);
    
    return newCandidate;
  },
};
