import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { candidateService } from '@/services/candidateService';
import { requestService } from '@/services/requestService';
import { fileService } from '@/services/fileService';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';

const candidateSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[+]?[\d\s()-]{10,}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  degreeName: z.string().min(2, 'Degree name is required'),
  pcNumber: z.string().optional(),
  initials: z.string().optional(),
  universityName: z.string().min(2, 'University name is required'),
  enrollmentOrRollNo: z.string().optional(),
  graduationYear: z.number().optional(),
});

type CandidateForm = z.infer<typeof candidateSchema>;

const NewRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const form = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      degreeName: '',
      pcNumber: '',
      initials: '',
      universityName: '',
      enrollmentOrRollNo: '',
      graduationYear: undefined,
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (uploadedFiles.length + files.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    setIsLoading(true);
    try {
      for (const file of files) {
        const error = fileService.validateFile(file);
        if (error) {
          toast.error(error);
          continue;
        }

        const uploaded = await fileService.upload(file);
        setUploadedFiles((prev) => [...prev, uploaded.url]);
      }
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== url));
  };

  const onSubmit = async (data: CandidateForm) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    try {
      // Create candidate
      const candidate = await candidateService.create({
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        degreeName: data.degreeName,
        pcNumber: data.pcNumber,
        initials: data.initials,
        universityName: data.universityName,
        enrollmentOrRollNo: data.enrollmentOrRollNo,
        graduationYear: data.graduationYear,
        documentUrls: uploadedFiles,
      });

      // Create request
      const request = await requestService.create({
        candidateId: candidate.id,
      });

      toast.success('Request created successfully!');
      navigate(`/requests/${request.id}/payment`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/requests')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
          <h1 className="text-3xl font-bold mt-4">New Verification Request</h1>
          <p className="text-muted-foreground">Create a new education verification request</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={(step / 3) * 100} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className={step >= 1 ? 'text-primary font-medium' : ''}>1. Candidate Info</span>
            <span className={step >= 2 ? 'text-primary font-medium' : ''}>2. Documents</span>
            <span className={step >= 3 ? 'text-primary font-medium' : ''}>3. Review</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Candidate Information'}
              {step === 2 && 'Upload Documents'}
              {step === 3 && 'Review & Create'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter candidate details and education information'}
              {step === 2 && 'Upload marksheets, degree certificate, and ID proofs'}
              {step === 3 && 'Review all information before creating the request'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Candidate Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 98765 43210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="degreeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Bachelor of Technology" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pcNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PC Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="PC12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="initials"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initials (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="J.D." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="universityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="University of Mumbai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="enrollmentOrRollNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Enrollment/Roll No (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="EN123456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="graduationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Graduation Year (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2023"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Documents */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Documents (Max 10 files)
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop files here, or click to browse
                        </p>
                        <label>
                          <Button variant="outline" type="button" asChild>
                            <span>Choose Files</span>
                          </Button>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, PNG, JPG (Max 10MB each)
                        </p>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Uploaded Files ({uploadedFiles.length}/10)
                        </p>
                        {uploadedFiles.map((url, index) => (
                          <div
                            key={url}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <span className="text-sm">
                              Document {index + 1} - {url.split('-').pop()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeFile(url)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <h3 className="font-semibold">Candidate Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>{' '}
                          {form.getValues('fullName')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>{' '}
                          {form.getValues('email')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mobile:</span>{' '}
                          {form.getValues('mobile')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Degree:</span>{' '}
                          {form.getValues('degreeName')}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">University:</span>{' '}
                          {form.getValues('universityName')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Documents</h3>
                      <p className="text-sm text-muted-foreground">
                        {uploadedFiles.length} file(s) uploaded
                      </p>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">Verification Fee:</span> ₹500
                        (non-refundable)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You will be redirected to payment after creating the request
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      disabled={isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button type="submit" className="ml-auto" disabled={isLoading}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Request & Proceed to Payment'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewRequest;
