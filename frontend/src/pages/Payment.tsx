import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { requestService } from '@/services/requestService';
import { paymentService } from '@/services/paymentService';
import { candidateService } from '@/services/candidateService';
import { VerificationRequest, Candidate, PaymentMethod } from '@/lib/types';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';
import { CreditCard, Smartphone, Building2, ShieldCheck, ChevronLeft, Loader2 } from 'lucide-react';

const Payment = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

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

  const handlePayment = async () => {
    if (!request) return;

    setIsProcessing(true);
    try {
      // Create order
      const order = await paymentService.createOrder(request.id, request.fee);
      
      // Process payment (mock)
      const result = await paymentService.pay(order.orderId, paymentMethod);
      
      if (result.status === 'PAID') {
        // Update request payment status
        await requestService.updatePayment(request.id, {
          status: 'PAID',
          txnId: result.txnId,
          paidAt: result.paidAt,
          method: paymentMethod,
        });
        
        toast.success('Payment successful!');
        navigate(`/requests/${request.id}`);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
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

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/requests/${request.id}`)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Request
          </Button>
          <h1 className="text-3xl font-bold mt-4">Payment Checkout</h1>
          <p className="text-muted-foreground">Complete payment to start verification</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Request ID</p>
                  <p className="font-mono font-medium">{request.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Candidate</p>
                  <p className="font-medium">{candidate.fullName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="font-medium">{candidate.universityName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Degree</p>
                  <p className="font-medium">{candidate.degreeName}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Verification Fee</span>
                    <span className="font-medium">{formatINR(request.fee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatINR(request.fee)}</span>
                  </div>
                </div>
                
                <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg">
                  <p className="text-xs text-warning-foreground">
                    <ShieldCheck className="h-3 w-3 inline mr-1" />
                    Payment is non-refundable
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="UPI" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">UPI</p>
                            <p className="text-xs text-muted-foreground">
                              Pay using Google Pay, PhonePe, Paytm, or any UPI app
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="Card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Debit / Credit Card</p>
                            <p className="text-xs text-muted-foreground">
                              Visa, Mastercard, Rupay accepted
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="NetBanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Net Banking</p>
                            <p className="text-xs text-muted-foreground">
                              Pay directly from your bank account
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <ShieldCheck className="h-4 w-4 inline mr-2 text-primary" />
                    Your payment is secured with 256-bit SSL encryption
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>Pay {formatINR(request.fee)}</>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our terms and conditions. This is a mock payment for
                  demonstration purposes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
