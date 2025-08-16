
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, UserPlus, Users, ArrowRight } from 'lucide-react';

const formSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  patientId: z.string().min(4, { message: "Patient ID must be at least 4 characters." }),
});

interface Patient {
    id: string;
    name: string;
}

export default function PatientSelectionPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientId: "",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // In a real app, you would fetch and list existing patients for the clinician.
  // For this demo, we'll keep it simple. The user must enter patient details to proceed.

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = new URLSearchParams();
    params.set('patientName', values.patientName);
    params.set('patientId', values.patientId);
    router.push(`/dashboard?${params.toString()}`);
  }

  if (loading || !user) {
      return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="bg-background min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Patient Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Select a patient or start a new session.</p>
            </div>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus />
                        Start a New Patient Session
                    </CardTitle>
                    <CardDescription>
                        Enter the patient's details below to begin a new monitoring session.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="patientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="patientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., P-12345" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Use a unique identifier for this patient.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full py-3 text-base">
                                Go to Patient Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* In a future version, a list of existing patients could be displayed here */}
            {/* 
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Existing Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Patient list functionality coming soon.</p>
                </CardContent>
            </Card>
            */}
        </div>
    </div>
  );
}
