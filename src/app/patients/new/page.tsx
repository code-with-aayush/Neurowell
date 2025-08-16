
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Loader2, UserPlus, ArrowRight } from 'lucide-react';
import { addPatientAction } from './actions';
import { useActionState } from 'react';

const formSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  patientId: z.string().min(4, { message: "A unique patient ID of at least 4 characters is required." }),
});

export default function NewPatientPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(addPatientAction, { success: false, error: null });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientId: "",
    },
  });

  if (state.success) {
      router.push('/patients');
  }

  if (loading || !user) {
      return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="bg-background min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Add a New Patient</h1>
                <p className="text-muted-foreground mt-2 text-lg">Enter the patient's details to register them in the system.</p>
            </div>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus />
                        New Patient Form
                    </CardTitle>
                    <CardDescription>
                        This information will be used to identify the patient's records.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form action={formAction} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="patientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Jane Smith" {...field} />
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
                                        <FormLabel>Unique Patient ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., P-12345" {...field} />
                                        </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
                            <Button type="submit" className="w-full py-3 text-base" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Patient <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
