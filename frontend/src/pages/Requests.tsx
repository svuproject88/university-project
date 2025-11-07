import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { requestService } from '@/services/requestService';
import { candidateService } from '@/services/candidateService';
import { VerificationRequest, RequestStatus, Candidate } from '@/lib/types';
import { RequestStatusChip, PaymentStatusChip } from '@/components/StatusChip';
import { formatDate, formatINR } from '@/lib/format';
import { Plus, Search, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Requests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [candidates, setCandidates] = useState<Map<string, Candidate>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, candidatesData] = await Promise.all([
        requestService.list(),
        candidateService.list(),
      ]);
      setRequests(requestsData);
      
      const candidateMap = new Map<string, Candidate>();
      candidatesData.forEach((c) => candidateMap.set(c.id, c));
      setCandidates(candidateMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== 'ALL' && request.status !== statusFilter) return false;
    if (searchQuery) {
      const candidate = candidates.get(request.candidateId);
      const searchLower = searchQuery.toLowerCase();
      return (
        request.id.toLowerCase().includes(searchLower) ||
        candidate?.fullName.toLowerCase().includes(searchLower) ||
        candidate?.universityName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Request ID', 'Candidate', 'University', 'Status', 'Payment', 'Created', 'Due'];
    const rows = filteredRequests.map((req) => {
      const candidate = candidates.get(req.candidateId);
      return [
        req.id,
        candidate?.fullName || '-',
        candidate?.universityName || '-',
        req.status,
        req.payment.status,
        formatDate(req.createdAt),
        formatDate(req.dueAt),
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requests-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Verification Requests</h1>
            <p className="text-muted-foreground">Manage and track all verification requests</p>
          </div>
          {user?.role === 'EMPLOYER' && (
            <Button onClick={() => navigate('/requests/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, candidate, or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | 'ALL')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PAYMENT_PENDING">Payment Pending</SelectItem>
                  <SelectItem value="PAYMENT_SUCCESS">Payment Success</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'ALL' ? 'No requests found' : 'No requests yet'}
                </p>
                {user?.role === 'EMPLOYER' && !searchQuery && statusFilter === 'ALL' && (
                  <Button onClick={() => navigate('/requests/new')}>Create First Request</Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Request ID</th>
                      <th className="pb-3 font-medium">Candidate</th>
                      <th className="pb-3 font-medium">University</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Payment</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">Due</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => {
                      const candidate = candidates.get(request.candidateId);
                      const isOverdue =
                        new Date(request.dueAt) < new Date() && request.status === 'IN_PROGRESS';
                      return (
                        <tr key={request.id} className="border-b hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{request.id}</td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{candidate?.fullName || '-'}</p>
                              <p className="text-xs text-muted-foreground">{candidate?.email}</p>
                            </div>
                          </td>
                          <td className="py-4 text-sm">{candidate?.universityName || '-'}</td>
                          <td className="py-4">
                            <RequestStatusChip status={request.status} />
                          </td>
                          <td className="py-4">
                            <PaymentStatusChip status={request.payment.status} />
                          </td>
                          <td className="py-4 text-sm">{formatDate(request.createdAt)}</td>
                          <td className="py-4 text-sm">
                            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                              {formatDate(request.dueAt)}
                            </span>
                          </td>
                          <td className="py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/requests/${request.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Requests;
