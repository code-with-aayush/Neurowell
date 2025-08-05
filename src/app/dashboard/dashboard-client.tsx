
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Heart, Droplets, Activity, Zap, Play, FileDown, Eye, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { createReport } from './actions';


type DataPoint = { time: string; value: number };

const initialDataState = {
  heartRate: Array.from({ length: 100 }, (_, i) => ({ time: new Date(Date.now() - (100 - i) * 100).toLocaleTimeString(), value: 70 + Math.floor(Math.random() * 25) })),
  spo2: Array.from({ length: 100 }, (_, i) => ({ time: new Date(Date.now() - (100 - i) * 100).toLocaleTimeString(), value: 95 + Math.floor(Math.random() * 5) })),
  ecgSignal: 0.52,
  stressLevel: 2,
  ecg: Array.from({ length: 100 }, (_, i) => ({ time: new Date(Date.now() - (100 - i) * 100).toLocaleTimeString(), value: 1.5 + (Math.random() - 0.5) * 0.4 })),
  gsr: Array.from({ length: 100 }, (_, i) => ({ time: new Date(Date.now() - (100 - i) * 100).toLocaleTimeString(), value: 2 + (Math.random() - 0.5) * 1.5 })),
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Generate Report
        </>
      )}
    </Button>
  );
}


export default function DashboardClient() {
  const [data, setData] = useState(initialDataState);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [state, formAction] = useFormState(createReport, null);


  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setData(prevData => {
        const newEcgPoint = { time: new Date().toLocaleTimeString(), value: 1.5 + (Math.random() - 0.5) * 0.4 };
        const newGsrPoint = { time: new Date().toLocaleTimeString(), value: 2 + (Math.random() - 0.5) * 1.5 };
        const newHeartRatePoint = { time: new Date().toLocaleTimeString(), value: 70 + Math.floor(Math.random() * 25) };
        const newSpo2Point = { time: new Date().toLocaleTimeString(), value: 95 + Math.floor(Math.random() * 5) };

        return {
          ...prevData,
          heartRate: [...prevData.heartRate.slice(1), newHeartRatePoint],
          spo2: [...prevData.spo2.slice(1), newSpo2Point],
          ecgSignal: newEcgPoint.value.toFixed(2),
          stressLevel: newGsrPoint.value.toFixed(2),
          ecg: [...prevData.ecg.slice(1), newEcgPoint],
          gsr: [...prevData.gsr.slice(1), newGsrPoint],
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const chartConfig = {
    value: {
      label: "Value",
    },
  };

  const insights = {
    heartRate: {
      title: 'Heart Rate',
      text: 'Your heart rate has been stable throughout the day. Great cardiovascular health!',
      color: 'bg-green-100',
      dotColor: 'bg-green-500'
    },
    stressLevel: {
      title: 'Stress Level',
      text: 'Slight elevation in stress detected. Consider taking a short break.',
      color: 'bg-yellow-100',
      dotColor: 'bg-yellow-500'
    },
    overall: {
      title: 'Overall',
      text: 'Your mental health indicators show positive trends. Keep it up!',
      color: 'bg-blue-100',
      dotColor: 'bg-blue-500'
    }
  }
  
  const latestHeartRate = data.heartRate.length > 0 ? data.heartRate[data.heartRate.length - 1].value : 0;
  const latestSpo2 = data.spo2.length > 0 ? data.spo2[data.spo2.length - 1].value : 0;

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mental Health Dashboard</h1>
            <p className="text-gray-500">Real-time monitoring of your vital signs</p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" onClick={() => setIsMonitoring(!isMonitoring)}>
              <Play className="mr-2 h-4 w-4" />
              {isMonitoring ? 'Pause Monitoring' : 'Start Monitoring'}
            </Button>
            <form action={formAction}>
              <SubmitButton />
            </form>
          </div>
        </header>

         {state?.message && (
          <Card className="bg-red-50 border-red-200 mb-8">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" />
              <div>
                <CardTitle className="text-base font-semibold text-red-800">Report Generation Failed</CardTitle>
                <CardDescription className="text-red-600">{state.message}</CardDescription>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-purple-50 border-purple-200 mb-8">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-800">Current Status</CardTitle>
              <CardDescription className="text-purple-600">Device disconnected</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">
                <AlertCircle size={16} />
                <span>Disconnected</span>
              </div>
               <div className="flex items-center gap-2 text-gray-600 bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span>{isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <VitalSignCard icon={Heart} title="Heart Rate" value={latestHeartRate} unit="BPM" status="ok" />
          <VitalSignCard icon={Droplets} title="Blood Oxygen" value={`${latestSpo2}%`} unit="" status="ok" />
          <VitalSignCard icon={Activity} title="ECG Signal" value={data.ecgSignal} unit="mV" status="ok" />
          <VitalSignCard icon={Zap} title="Stress Level (GSR)" value={data.stressLevel} unit="μS" status="ok" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <ChartCard title="ECG Waveform" isPaused={!isMonitoring}>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <AreaChart data={data.ecg} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                 <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                 <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                 <defs>
                    <linearGradient id="colorEcg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                 <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorEcg)" strokeWidth={2} dot={false} />
               </AreaChart>
             </ChartContainer>
          </ChartCard>
          <ChartCard title="GSR (Stress Level)" isPaused={!isMonitoring}>
            {isMonitoring ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={data.gsr} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <defs>
                    <linearGradient id="colorGsr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fill="url(#colorGsr)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ChartContainer>
            ) : (
               <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md">
                <Card className="w-2/3 text-center">
                    <CardHeader>
                      <CardTitle>Monitoring Stopped</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Data collection has been paused.</p>
                    </CardContent>
                  </Card>
              </div>
            )}
           </ChartCard>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard {...insights.heartRate} />
            <InsightCard {...insights.stressLevel} />
            <InsightCard {...insights.overall} />
          </div>
        </div>
      </div>
    </div>
  );
}

const VitalSignCard = ({ icon: Icon, title, value, unit, status }) => (
  <Card className="bg-white shadow-sm hover:shadow-lg transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-gray-500">{title}</p>
        </div>
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="text-3xl font-bold text-gray-800">
        {value} <span className="text-lg font-medium text-gray-500">{unit}</span>
      </div>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, isPaused, children }) => (
  <Card className="bg-white shadow-sm">
    <CardHeader className="flex flex-row justify-between items-center">
      <CardTitle className="font-semibold text-gray-800">{title}</CardTitle>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span>{!isPaused ? 'Live' : 'Paused'}</span>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
)

const InsightCard = ({ title, text, color, dotColor }) => (
  <Card className={`${color} border-0 shadow-sm`}>
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{text}</p>
    </CardContent>
  </Card>
)

    