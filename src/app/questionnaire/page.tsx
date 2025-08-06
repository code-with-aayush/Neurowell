
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createReportWithQuestions } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  sleepHours: z.coerce.number().min(0, "Cannot be negative").max(24, "Cannot be more than 24"),
  mood: z.string().min(1, "Please select a mood"),
  stressLevel: z.string().min(1, "Please select a stress level"),
  diet: z.string().min(3, "Please briefly describe your diet.").max(200, "Please keep it under 200 characters."),
  heartRate: z.number(),
  spo2: z.number(),
  ecg: z.number(),
  gsr: z.number(),
});

function QuestionnaireForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sleepHours: 8,
            mood: 'Neutral',
            stressLevel: 'Low',
            diet: '',
            heartRate: parseFloat(searchParams.get('heartRate') || '0'),
            spo2: parseFloat(searchParams.get('spo2') || '0'),
            ecg: parseFloat(searchParams.get('ecg') || '0'),
            gsr: parseFloat(searchParams.get('gsr') || '0'),
        },
    });

    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });

        const result = await createReportWithQuestions(null, formData);

        if (result.success && result.redirectUrl) {
            router.push(result.redirectUrl);
        } else {
            // Handle error, maybe show a toast
            console.error(result.message);
            form.setError("root", { message: result.message });
        }
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-8">
             {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">Generating Your Personalized Report...</h2>
                    <p className="text-gray-500">This may take a moment.</p>
                </div>
            )}
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">A Few More Questions</CardTitle>
                        <CardDescription>Your answers will help us create a more accurate and personalized wellness report.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="sleepHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>How many hours did you sleep last night?</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="mood"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <FormLabel>How would you describe your mood today?</FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                          className="flex flex-col space-y-1"
                                        >
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="Happy" /><Label>Happy</Label></div>
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="Neutral" /><Label>Neutral</Label></div>
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="Sad" /><Label>Sad</Label></div>
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="Anxious" /><Label>Anxious</Label></div>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="stressLevel"
                                  render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <FormLabel>How would you rate your stress level right now?</FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                          className="flex flex-col space-y-1"
                                        >
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="Low" /><Label>Low</Label></div>
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="Moderate" /><Label>Moderate</Label></div>
                                          <div className="flex items-center space-x-2"><RadioGroupItem value="High" /><Label>High</Label></div>
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                    control={form.control}
                                    name="diet"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Briefly describe what you've eaten in the last 12 hours.</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                {form.formState.errors.root && <p className="text-red-500">{form.formState.errors.root.message}</p>}

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate My Report
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function QuestionnairePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuestionnaireForm />
        </Suspense>
    )
}

    