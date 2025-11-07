import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requestService } from '@/services/requestService';
import { VerificationRequest } from '@/lib/types';
import { FileText, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { formatINR, formatDateTime } from '@/lib/format';
import { RequestStatusChip } from '@/components/StatusChip';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await requestService.list();
        setRequests(data);
      } catch (error) {
        console.error('Failed to load requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const stats = {
    open: requests.filter((r) => r.status === 'IN_PROGRESS').length,
    verified: requests.filter((r) => r.status === 'VERIFIED').length,
    rejected: requests.filter((r) => r.status === 'REJECTED').length,
    revenue: requests
      .filter((r) => r.payment.status === 'PAID')
      .reduce((sum, r) => sum + r.fee, 0),
  };

  const slaBreach = requests.filter(
    (r) => r.status === 'IN_PROGRESS' && new Date(r.dueAt) < new Date()
  ).length;

  const recentRequests = requests.slice(0, 5);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">Here's an overview of your verification requests</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
              {slaBreach > 0 && (
                <p className="text-xs text-destructive mt-1">{slaBreach} SLA breach</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatINR(stats.revenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {requests.filter((r) => r.payment.status === 'PAID').length} paid requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/requests')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No verification requests yet</p>
                {user?.role === 'EMPLOYER' && (
                  <Button onClick={() => navigate('/requests/new')}>
                    Create Your First Request
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{request.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <RequestStatusChip status={request.status} />
                      {new Date(request.dueAt) < new Date() &&
                        request.status === 'IN_PROGRESS' && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                            Overdue
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
