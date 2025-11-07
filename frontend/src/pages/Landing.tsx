import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileCheck, CreditCard, BarChart3 } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileCheck,
      title: 'Create Request',
      description: 'Submit candidate details and required documents for verification',
    },
    {
      icon: CreditCard,
      title: 'Pay ₹500',
      description: 'Simple payment process with multiple options',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Real-time status updates and timeline tracking',
    },
    {
      icon: CheckCircle2,
      title: 'Download Report',
      description: 'Get comprehensive verification reports instantly',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">EduVerify HR</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verify Education Credentials with Confidence
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your hiring process with fast, accurate education verification. Get verified
            reports in just 5 days.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Start Verification
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Try Demo
            </Button>
          </div>

          {/* Demo Credentials */}
          <Card className="mt-8 p-4 bg-muted/50 max-w-md mx-auto">
            <p className="text-sm font-semibold mb-2">Demo Logins:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Employer:</span> employer@demo / demo123
              </p>
              <p>
                <span className="font-medium">Verifier:</span> verifier@demo / demo123
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 EduVerify HR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
