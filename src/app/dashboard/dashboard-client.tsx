"use client";

import { useState, useEffect, useTransition, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createReport } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import { HeartPulse, Droplets, Activity, Zap, Loader2, FileText } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

type DataPoint = { time: string; value: number };

const initialDataState = {
  heartRate: 72,
  spo2: 98,
  ecg: Array.from({ length: 20 }, (_, i) => ({ time: `t-${i}`, value: 1.5 + (Math.random() - 0.5) * 0.2 })),
  gsr: Array.from({ length: 20 }, (_, i) => ({ time: `t-${i}`, value: 500 + (Math.random() - 0.5) * 20 })),
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
      {pending ? 'Generating Report...' : 'Generate AI Report'}
    </Button>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState(initialDataState);
  const { toast } = useToast();

  const [state, formAction] = useActionState(createReport, null);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newEcgPoint = { time: `t-${prevData.ecg.length}`, value: 1.5 + (Math.random() - 0.5) * 0.2 };
        const newGsrPoint = { time: `t-${prevData.gsr.length}`, value: 500 + (Math.random() - 0.5) * 20 };

        return {
          heartRate: 60 + Math.floor(Math.random() * 20),
          spo2: 95 + Math.floor(Math.random() * 5),
          ecg: [...prevData.ecg.slice(1), newEcgPoint],
          gsr: [...prevData.gsr.slice(1), newGsrPoint],
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    value: {
      label: "Value",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold font-headline">Your Wellness Dashboard</h1>
        <form action={formAction}>
          <input type="hidden" name="heartRateData" value={JSON.stringify([data.heartRate])} />
          <input type="hidden" name="spo2Data" value={JSON.stringify([data.spo2])} />
          <input type="hidden" name="ecgData" value={JSON.stringify(data.ecg.map(d => d.value))} />
          <input type="hidden" name="gsrData" value={JSON.stringify(data.gsr.map(d => d.value))} />
          <SubmitButton />
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <HeartPulse className="h-5 w-5 text-muted-foreground text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.heartRate}</div>
            <p className="text-xs text-muted-foreground">bpm</p>
          </CardContent>
        </Card>
        <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SpO2</CardTitle>
            <Droplets className="h-5 w-5 text-muted-foreground text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.spo2}%</div>
            <p className="text-xs text-muted-foreground">Oxygen Saturation</p>
          </CardContent>
        </Card>
        <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ECG</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">Normal</div>
            <p className="text-xs text-muted-foreground">Sinus Rhythm</p>
          </CardContent>
        </Card>
        <Card className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GSR</CardTitle>
            <Zap className="h-5 w-5 text-muted-foreground text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">Calm</div>
            <p className="text-xs text-muted-foreground">Skin Conductance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ECG (Electrocardiogram)</CardTitle>
            <CardDescription>Live reading of your heart's electrical activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={data.ecg} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <YAxis dataKey="value" domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <XAxis dataKey="time" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line dataKey="value" type="monotone" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>GSR (Galvanic Skin Response)</CardTitle>
            <CardDescription>Indicates emotional arousal through skin conductance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={data.gsr} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <YAxis dataKey="value" domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <XAxis dataKey="time" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line dataKey="value" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
