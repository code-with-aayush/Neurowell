
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Heart, Droplets, Activity, Zap, Play, Loader2, AlertCircle, Plug } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { createReport } from './actions';
import { useRouter } from 'next/navigation';


type DataPoint = { time: string; value: number };

const initialDataState = {
  heartRate: [] as DataPoint[],
  spo2: [] as DataPoint[],
  ecg: [] as DataPoint[],
  gsr: [] as DataPoint[],
};

const initialLatestValues = {
  heartRate: 0,
  spo2: 0,
  ecg: 0,
  gsr: 0,
}

export default function DashboardClient() {
  const [data, setData] = useState(initialDataState);
  const [latestValues, setLatestValues] = useState(initialLatestValues);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const monitoringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isMonitoring) {
      interval = setInterval(() => {
        const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newEcgPoint = { time: newTime, value: 1.5 + (Math.random() - 0.5) * 0.4 };
        const newGsrPoint = { time: newTime, value: 2 + (Math.random() - 0.5) * 1.5 };
        const newHeartRatePoint = { time: newTime, value: 70 + Math.floor(Math.random() * 25) };
        const newSpo2Point = { time: newTime, value: 95 + Math.floor(Math.random() * 5) };
        
        setData(prevData => {
          const maxPoints = 20;

          const newData = {
            heartRate: [...prevData.heartRate, newHeartRatePoint].slice(-maxPoints),
            spo2: [...prevData.spo2, newSpo2Point].slice(-maxPoints),
            ecg: [...prevData.ecg, newEcgPoint].slice(-maxPoints),
            gsr: [...prevData.gsr, newGsrPoint].slice(-maxPoints),
          };

          setLatestValues({
            heartRate: newHeartRatePoint.value,
            spo2: newSpo2Point.value,
            ecg: newEcgPoint.value,
            gsr: newGsrPoint.value,
          });

          return newData;
        });
      }, 100);
    }
    return () => {
      if(interval) clearInterval(interval);
    }
  }, [isMonitoring]);
  
  const handleGenerateReport = async (monitoringData: typeof initialDataState) => {
    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    formData.append('heartRate', JSON.stringify(monitoringData.heartRate));
    formData.append('spo2', JSON.stringify(monitoringData.spo2));
    formData.append('ecg', JSON.stringify(monitoringData.ecg));
    formData.append('gsr', JSON.stringify(monitoringData.gsr));

    const result = await createReport(null, formData);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setError(result.message);
    }
    setIsGenerating(false);
  };

  const startMonitoring = () => {
    setData(initialDataState);
    setLatestValues(initialLatestValues);
    setError(null);
    setIsMonitoring(true);
    
    if (monitoringTimeoutRef.current) {
      clearTimeout(monitoringTimeoutRef.current);
    }

    monitoringTimeoutRef.current = setTimeout(() => {
      setIsMonitoring(false);
      setData(currentData => {
        handleGenerateReport(currentData);
        return currentData; 
      });
    }, 2000);
  };

  const handleConnectDevice = async () => {
    if ('serial' in navigator) {
      try {
        // @ts-ignore
        const port = await navigator.serial.requestPort();
        // In a real application, you would continue to open the port and read data.
        // For this demo, we'll just confirm that a port was selected.
        await port.open({ baudRate: 9600 });
        console.log("Device connected successfully!");
        setIsDeviceConnected(true);
        // Note: You would typically start reading data from the port here.
        // const reader = port.readable.getReader();
      } catch (err) {
        console.error("There was an error opening the serial port:", err);
        setError("Failed to connect to the device. Please make sure it's plugged in and try again.");
      }
    } else {
      console.error("The Web Serial API is not supported in this browser.");
      setError("This browser does not support the Web Serial API. Please try Chrome or Edge.");
    }
  };
  
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
  
  return (
    <div className="bg-[#F8F9FA] min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mental Health Dashboard</h1>
            <p className="text-gray-500">Real-time monitoring of your vital signs</p>
          </div>
          <div className="flex items-center gap-2">
            {!isDeviceConnected && (
              <Button onClick={handleConnectDevice}>
                <Plug className="mr-2 h-4 w-4" />
                Connect Device
              </Button>
            )}
             <Button variant="outline" onClick={startMonitoring} disabled={!isDeviceConnected || isMonitoring || isGenerating}>
              {isMonitoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Monitoring...
                </>
              ) : isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>
          </div>
        </header>

         {error && (
          <Card className="bg-red-50 border-red-200 mb-8">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" />
              <div>
                <CardTitle className="text-base font-semibold text-red-800">An Error Occurred</CardTitle>
                <CardDescription className="text-red-600">{error}</CardDescription>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-purple-50 border-purple-200 mb-8">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-purple-800">Current Status</CardTitle>
              <CardDescription className="text-purple-600">
                {isDeviceConnected ? 'Device connected and ready to monitor.' : 'Please connect your device to start monitoring.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
               {isDeviceConnected ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                  <Plug size={16} />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertCircle size={16} />
                  <span>Disconnected</span>
                </div>
              )}
               <div className="flex items-center gap-2 text-gray-600 bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span>{isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <VitalSignCard icon={Heart} title="Heart Rate" value={latestValues.heartRate.toFixed(0)} unit="BPM" status="ok" />
          <VitalSignCard icon={Droplets} title="Blood Oxygen" value={`${latestValues.spo2.toFixed(0)}%`} unit="" status="ok" />
          <VitalSignCard icon={Activity} title="ECG Signal" value={latestValues.ecg.toFixed(2)} unit="mV" status="ok" />
          <VitalSignCard icon={Zap} title="Stress Level (GSR)" value={latestValues.gsr.toFixed(2)} unit="μS" status="ok" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <ChartCard title="ECG Waveform" isPaused={!isMonitoring}>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <AreaChart data={data.ecg} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 3]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
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

const VitalSignCard = ({ icon: Icon, title, value, unit, status }: { icon: any, title: string, value: string | number, unit: string, status: string }) => (
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

const ChartCard = ({ title, isPaused, children }: { title: string, isPaused: boolean, children: React.ReactNode }) => (
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

const InsightCard = ({ title, text, color, dotColor }: { title: string, text: string, color: string, dotColor: string }) => (
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
