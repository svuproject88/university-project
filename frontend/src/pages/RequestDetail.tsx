import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { requestService } from '@/services/requestService';
import { candidateService } from '@/services/candidateService';
import { VerificationRequest, Candidate } from '@/lib/types';
import { RequestStatusChip, PaymentStatusChip, CheckStatusChip } from '@/components/StatusChip';
import { formatDate, formatDateTime, formatINR, formatPhone } from '@/lib/format';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  CreditCard, 
  FileText, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Download,
  Loader2
} from 'lucide-react';

const RequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    if (!requestId) return;
    
    try {
      const req = await requestService.get(requestId);
      setRequest(req);
      
      const cand = await candidateService.get(req.candidateId);
      setCandidate(cand);
    } catch (error) {
      toast.error('Failed to load request details');
      navigate('/requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED') => {
    if (!request) return;

    try {
      let reason: string | undefined;
      if (status === 'REJECTED') {
        reason = prompt('Please enter rejection reason:');
        if (!reason) return;
      }

      await requestService.setStatus(request.id, status, reason);
      toast.success(`Status updated to ${status}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const generateReport = async () => {
    if (!request || !candidate) return;

    try {
      // Mock PDF generation
      toast.success('Report generation would happen here in production');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!request || !candidate) {
    return null;
  }

  const isOverdue = new Date(request.dueAt) < new Date() && request.status === 'IN_PROGRESS';

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/requests')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono">{request.id}</h1>
            <p className="text-muted-foreground">Created {formatDateTime(request.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user?.role === 'EMPLOYER' ? 'default' : 'secondary'}>
              {user?.role}
            </Badge>
          </div>
        </div>

        {/* Status & Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Request Status</p>
                  <RequestStatusChip status={request.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                  <PaymentStatusChip status={request.payment.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                      {formatDate(request.dueAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.role === 'EMPLOYER' && request.status === 'PAYMENT_PENDING' && (
                  <Button onClick={() => navigate(`/requests/${request.id}/payment`)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                )}
                {user?.role === 'VERIFIER' && request.status === 'IN_PROGRESS' && (
                  <>
                    <Button onClick={() => handleStatusChange('VERIFIED')} variant="default">
                      Mark Verified
                    </Button>
                    <Button onClick={() => handleStatusChange('REJECTED')} variant="destructive">
                      Reject
                    </Button>
                  </>
                )}
                {request.status === 'VERIFIED' && (
                  <Button onClick={generateReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            </div>

            {isOverdue && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  This request has exceeded the SLA timeline
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="check">Education Check</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Candidate Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Candidate Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{candidate.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatPhone(candidate.mobile)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Degree</p>
                    <p className="font-medium">{candidate.degreeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">University</p>
                    <p className="font-medium">{candidate.universityName}</p>
                  </div>
                  {candidate.graduationYear && (
                    <div>
                      <p className="text-sm text-muted-foreground">Graduation Year</p>
                      <p className="font-medium">{candidate.graduationYear}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium text-lg">{formatINR(request.payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <PaymentStatusChip status={request.payment.status} />
                  </div>
                  {request.payment.method && (
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium">{request.payment.method}</p>
                    </div>
                  )}
                  {request.payment.txnId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-sm">{request.payment.txnId}</p>
                    </div>
                  )}
                  {request.payment.paidAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paid At</p>
                      <p className="text-sm">{formatDateTime(request.payment.paidAt)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="check" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Education Verification Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check Status</p>
                  <CheckStatusChip status={request.check.substatus} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{candidate.universityName}</p>
                </div>
                {request.check.registrarEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground">Registrar Email</p>
                    <p className="font-medium">{request.check.registrarEmail}</p>
                  </div>
                )}
                {request.check.registrarPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Registrar Phone</p>
                    <p className="font-medium">{request.check.registrarPhone}</p>
                  </div>
                )}
                {request.check.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{request.check.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {candidate.documentUrls.map((url, index) => (
                    <div
                      key={url}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Document {index + 1} - {url.split('-').pop()}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {request.check.evidenceUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Verification Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {request.check.evidenceUrls.map((url, index) => (
                      <div
                        key={url}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Evidence {index + 1}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.timeline.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < request.timeline.length - 1 && (
                          <div className="h-full w-px bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">
                          by {entry.by} • {formatDateTime(entry.at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RequestDetail;
