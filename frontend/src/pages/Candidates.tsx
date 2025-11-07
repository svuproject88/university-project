import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { candidateService } from '@/services/candidateService';
import { Candidate } from '@/lib/types';
import { Search, Mail, Phone, GraduationCap } from 'lucide-react';

const Candidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await candidateService.list();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      candidate.fullName.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.universityName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">View all candidates submitted for verification</p>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No candidates found' : 'No candidates yet'}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCandidates.map((candidate) => (
                  <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{candidate.fullName}</h3>
                            {candidate.initials && (
                              <p className="text-sm text-muted-foreground">{candidate.initials}</p>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{candidate.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{candidate.mobile}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium">{candidate.degreeName}</p>
                              <p className="text-muted-foreground">{candidate.universityName}</p>
                              {candidate.graduationYear && (
                                <p className="text-muted-foreground">
                                  Graduated: {candidate.graduationYear}
                                </p>
                              )}
                            </div>
                          </div>

                          {(candidate.enrollmentOrRollNo || candidate.pcNumber) && (
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              {candidate.enrollmentOrRollNo && (
                                <span>Roll No: {candidate.enrollmentOrRollNo}</span>
                              )}
                              {candidate.pcNumber && <span>PC: {candidate.pcNumber}</span>}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            {candidate.documentUrls.length} document(s) uploaded
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Candidates;
