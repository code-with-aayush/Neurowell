
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

const scaleQuestions = [
    { name: "q1", label: "How often does the patient report feeling tired or lacking energy?" },
    { name: "q3", label: "How often has the patient felt overwhelmed or unable to cope with daily tasks?" },
    { name: "q4", label: "Has the patient consumed caffeine or other stimulants more than usual?" },
    { name: "q5", label: "Does the patient report feeling mentally present and focused?" },
    { name: "q6", label: "Has the patient had time to relax or do something enjoyable?" },
] as const;

const scaleOptions = [
    { value: '0', label: 'Not at all' },
    { value: '1', label: 'Sometimes' },
    { value: '2', label: 'Often' },
    { value: '3', label: 'Almost every day' }
];

const sleepQuestion = { name: "q2", label: "How many hours of quality sleep did the patient get last night?" } as const;
const sleepOptions = [
    { value: '0', label: '6–8 hours' },
    { value: '1', label: 'More than 8 hours' },
    { value: '2', label: '4–6 hours' },
    { value: '3', label: 'Less than 4 hours' }
];

const formSchema = z.object({
  q1: z.string({ required_error: "Please select an option." }),
  q2: z.string({ required_error: "Please select an option." }),
  q3: z.string({ required_error: "Please select an option." }),
  q4: z.string({ required_error: "Please select an option." }),
  q5: z.string({ required_error: "Please select an option." }),
  q6: z.string({ required_error: "Please select an option." }),
  patientId: z.string(),
  patientName: z.string(),
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
            patientId: searchParams.get('patientId') || '',
            patientName: searchParams.get('patientName') || '',
            heartRate: parseFloat(searchParams.get('heartRate') || '0'),
            spo2: parseFloat(searchParams.get('spo2') || '0'),
            ecg: parseFloat(searchParams.get('ecg') || '0'),
            gsr: parseFloat(searchParams.get('gsr') || '0'),
        },
    });

    const { isSubmitting } = form.formState;
    const patientName = form.getValues('patientName');

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

    if (!patientName) {
         return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="bg-background min-h-screen p-8 relative">
             {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">Generating Patient Report...</h2>
                    <p className="text-gray-500">This may take a moment.</p>
                </div>
            )}
            <div className="max-w-3xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Patient Lifestyle Assessment</CardTitle>
                        <CardDescription>These answers provide context for {patientName}'s biometric data to generate a personalized wellness report.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {scaleQuestions.map((q, index) => (
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
                                                        {scaleOptions.map(option => (
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

                                <FormField
                                    control={form.control}
                                    name={sleepQuestion.name}
                                    render={({ field }) => (
                                        <FormItem className="space-y-3 p-4 border rounded-lg bg-white">
                                            <FormLabel className="font-semibold">{scaleQuestions.length + 1}. {sleepQuestion.label}</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="!mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                                                >
                                                    {sleepOptions.map(option => (
                                                        <FormItem key={option.value} className="flex items-center space-x-2 p-3 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                                                            <FormControl>
                                                                <RadioGroupItem value={option.value} id={`${sleepQuestion.name}-${option.value}`} />
                                                            </FormControl>
                                                            <Label htmlFor={`${sleepQuestion.name}-${option.value}`} className="w-full cursor-pointer">{option.label}</Label>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage className="!mt-2" />
                                        </FormItem>
                                    )}
                                />
                                
                                {form.formState.errors.root && <p className="text-red-500 text-center font-medium p-4">{form.formState.errors.root.message}</p>}

                                <Button type="submit" className="w-full !mt-10 py-3 text-lg" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate Patient Report
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
