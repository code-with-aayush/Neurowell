
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
import { createReportWithQuestions } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const questions = [
    { name: "q1", label: "In the last week, how often have you felt nervous, anxious, or on edge?" },
    { name: "q2", label: "Have you had trouble relaxing or calming yourself down?" },
    { name: "q3", label: "Do you feel sad or hopeless for long periods?" },
    { name: "q4", label: "Have you lost interest or pleasure in doing things you normally enjoy?" },
    { name: "q5", label: "Do you have difficulty concentrating on tasks or making decisions?" },
    { name: "q6", label: "Have you experienced sudden panic or feelings of dread without clear reason?" },
    { name: "q7", label: "Do you feel tired or like you have no energy most days?" },
    { name: "q8", label: "Have you been feeling worthless or guilty about things?" },
    { name: "q9", label: "Do you find yourself irritable or easily annoyed?" },
    { name: "q10", label: "Have you had trouble falling or staying asleep?" },
] as const;

const formSchema = z.object({
  q1: z.string({ required_error: "Please select an option." }),
  q2: z.string({ required_error: "Please select an option." }),
  q3: z.string({ required_error: "Please select an option." }),
  q4: z.string({ required_error: "Please select an option." }),
  q5: z.string({ required_error: "Please select an option." }),
  q6: z.string({ required_error: "Please select an option." }),
  q7: z.string({ required_error: "Please select an option." }),
  q8: z.string({ required_error: "Please select an option." }),
  q9: z.string({ required_error: "Please select an option." }),
  q10: z.string({ required_error: "Please select an option." }),
  heartRate: z.number(),
  spo2: z.number(),
  ecg: z.number(),
  gsr: z.number(),
});

const radioOptions = [
    { value: '0', label: 'Not at all' },
    { value: '1', label: 'Several days' },
    { value: '2', label: 'More than half the days' },
    { value: '3', label: 'Nearly every day' }
];

function QuestionnaireForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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
            console.error(result.message);
            form.setError("root", { message: result.message });
        }
    }

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-8 relative">
             {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">Generating Your Personalized Report...</h2>
                    <p className="text-gray-500">This may take a moment.</p>
                </div>
            )}
            <div className="max-w-3xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Psychological Screening</CardTitle>
                        <CardDescription>Your answers will be combined with your sensor data to create a more accurate and personalized wellness report.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {questions.map((q, index) => (
                                    <FormField
                                        key={q.name}
                                        control={form.control}
                                        name={q.name}
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 p-4 border rounded-lg bg-white">
                                                <FormLabel className="font-semibold">{index + 1}. {q.label}</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="!mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                                                    >
                                                        {radioOptions.map(option => (
                                                            <FormItem key={option.value} className="flex items-center space-x-2 p-3 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                                                                <FormControl>
                                                                    <RadioGroupItem value={option.value} id={`${q.name}-${option.value}`} />
                                                                </FormControl>
                                                                <Label htmlFor={`${q.name}-${option.value}`} className="w-full cursor-pointer">{option.label}</Label>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage className="!mt-2" />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                
                                {form.formState.errors.root && <p className="text-red-500 text-center font-medium p-4">{form.formState.errors.root.message}</p>}

                                <Button type="submit" className="w-full !mt-10 py-3 text-lg" disabled={isSubmitting}>
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
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <QuestionnaireForm />
        </Suspense>
    )
}
