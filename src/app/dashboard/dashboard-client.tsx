
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Heart, Droplets, Activity, Zap, Play, StopCircle, Loader2, AlertCircle, Plug, FileText } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { createReport } from './actions';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';


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
  const [showRedirectingOverlay, setShowRedirectingOverlay] = useState(false);
  const [hasMonitored, setHasMonitored] = useState(false);
  
  const router = useRouter();
  
  const readerRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<any> | null>(null);
  const portRef = useRef<any | null>(null); 
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const readFromSerialPort = async () => {
    if (!readerRef.current) return;
    
    const textDecoder = new TextDecoder();
    let buffer = '';

    try {
      // This is a simplified reader. A more robust implementation would handle streaming data chunks.
      const { value, done } = await readerRef.current.read();
      if (done) return;
      
      buffer += textDecoder.decode(value, { stream: true });
      
      let jsonEnd = buffer.indexOf('}');
      if (jsonEnd !== -1) {
          const jsonStart = buffer.lastIndexOf('{', jsonEnd);
          if (jsonStart !== -1) {
              const jsonString = buffer.substring(jsonStart, jsonEnd + 1);
              
              try {
                  const sensorData = JSON.parse(jsonString);
                  const now = new Date();
                  const time = now.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });

                  if (sensorData.heartRate && sensorData.heartRate.length > 0) {
                      const newHrPoint = { time, value: sensorData.heartRate[0] };
                      const newSpo2Point = { time, value: sensorData.spo2[0] };
                      const newEcgPoint = { time, value: sensorData.ecg[0] };
                      const newGsrPoint = { time, value: sensorData.gsr[0] };

                      setData(prevData => ({
                        heartRate: [...prevData.heartRate, newHrPoint].slice(-20),
                        spo2: [...prevData.spo2, newSpo2Point].slice(-20),
                        ecg: [...prevData.ecg, newEcgPoint].slice(-20),
                        gsr: [...prevData.gsr, newGsrPoint].slice(-20),
                      }));
                      setLatestValues({
                        heartRate: newHrPoint.value,
                        spo2: newSpo2Point.value,
                        ecg: newEcgPoint.value,
                        gsr: newGsrPoint.value,
                      });
                  }
              } catch (e) {
                console.warn("Could not parse JSON from serial:", jsonString, e);
              }
          }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
          console.error("Error reading from serial port:", err);
          setError("Error reading from device. It may have been disconnected.");
          setIsDeviceConnected(false);
          stopMonitoring(true);
      }
    }
  };

  const requestDataFromArduino = async () => {
     if (!writerRef.current || !isMonitoring) {
        return;
    }
     try {
        const textEncoder = new TextEncoder();
        await writerRef.current.write(textEncoder.encode("M"));
        await readFromSerialPort();
    } catch (err) {
        console.error("Error writing to serial port:", err);
        setError("Could not send command to device.");
        stopMonitoring(true);
    }
  }

  const handleGenerateReport = async () => {
    if (isGenerating || !hasMonitored || latestValues.heartRate === 0) {
        setError("Please run monitoring to collect some data before generating a report.");
        return;
    }

    setIsGenerating(true); 
    setShowRedirectingOverlay(true);
    setError(null);
      
    const formData = new FormData();
    formData.append('heartRate', latestValues.heartRate.toString());
    formData.append('spo2', latestValues.spo2.toString());
    formData.append('ecg', latestValues.ecg.toString());
    formData.append('gsr', latestValues.gsr.toString());
  
    const result = await createReport(null, formData);
  
    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setError(result.message);
      setIsGenerating(false);
      setShowRedirectingOverlay(false);
    }
  };

  const startMonitoring = () => {
    if (!isDeviceConnected) {
        setError("Cannot start monitoring. Device is not connected.");
        return;
    }
    setData(initialDataState);
    setError(null);
    setIsMonitoring(true);
    setHasMonitored(false);

    monitoringIntervalRef.current = setInterval(() => {
        requestDataFromArduino();
    }, 1000);
  };
  
  const stopMonitoring = (force = false) => {
    if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
    }
    setIsMonitoring(false);
    if(data.heartRate.length > 0) {
        setHasMonitored(true);
    }
  }

  const handleConnectDevice = async () => {
    if ('serial' in navigator) {
      try {
        // @ts-ignore
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        portRef.current = port;
        
        setIsDeviceConnected(true);
        setError(null);
        console.log("Device connected successfully!");

        readerRef.current = port.readable.getReader();
        writerRef.current = port.writable.getWriter();
        
      } catch (err: any) {
        console.error("There was an error opening the serial port:", err);
        setError("Failed to connect to the device. Please make sure it's plugged in and try again.");
      }
    } else {
      console.error("The Web Serial API is not supported in this browser.");
      setError("This browser does not support the Web Serial API. Please try Chrome or Edge.");
    }
  };

  const handleDisconnectDevice = async () => {
    stopMonitoring(true);
    
    if (writerRef.current) {
        try {
            writerRef.current.releaseLock();
        } catch (error) { /* Ignore */ }
        writerRef.current = null;
    }

    if (readerRef.current) {
        try {
            await readerRef.current.cancel();
            readerRef.current.releaseLock();
        } catch (error) { /* Ignore */ }
        readerRef.current = null;
    }

    if (portRef.current) {
        try {
            await portRef.current.close();
        } catch (error) { /* Ignore */ }
        portRef.current = null;
    }
    setIsDeviceConnected(false);
    setIsMonitoring(false);
    setHasMonitored(false);
    console.log("Device disconnected.");
  };
  
  const chartConfig = {
    value: {
      label: "Value",
    },
  };
  
  return (
    <div className="bg-[#F8F9FA] min-h-screen p-8 relative">
       {showRedirectingOverlay && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Generating Your Report...</h2>
          <p className="text-gray-500">Please wait while we analyze your data.</p>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mental Health Dashboard</h1>
            <p className="text-gray-500">Real-time monitoring of your vital signs</p>
          </div>
          <div className="flex items-center gap-2">
            {!isDeviceConnected ? (
              <Button onClick={handleConnectDevice}>
                <Plug className="mr-2 h-4 w-4" />
                Connect Device
              </Button>
            ) : (
              <Button onClick={handleDisconnectDevice} variant="outline">
                <Plug className="mr-2 h-4 w-4" />
                Disconnect Device
              </Button>
            )}
             {!isMonitoring ? (
                <Button onClick={startMonitoring} disabled={!isDeviceConnected}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Monitoring
                </Button>
             ) : (
                <Button onClick={() => stopMonitoring()} variant="destructive">
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Monitoring
                </Button>
             )}
             <Button onClick={handleGenerateReport} disabled={!hasMonitored || isMonitoring || isGenerating}>
                {isGenerating ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                     </>
                ) : (
                    <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
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
                {isMonitoring ? 'Monitoring live data...' : (hasMonitored ? 'Monitoring paused. Ready to generate report.' : (isDeviceConnected ? 'Device connected. Click "Start Monitoring" to begin.' : 'Please connect your device to start.'))}
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
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span>{isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <VitalSignCard icon={Heart} title="Heart Rate" value={latestValues.heartRate.toFixed(0)} unit="BPM" isLoading={isMonitoring && data.heartRate.length === 0} />
          <VitalSignCard icon={Droplets} title="Blood Oxygen" value={`${latestValues.spo2.toFixed(1)}`} unit="%" isLoading={isMonitoring && data.spo2.length === 0} />
          <VitalSignCard icon={Activity} title="ECG Signal" value={latestValues.ecg.toFixed(2)} unit="mV" isLoading={isMonitoring && data.ecg.length === 0} />
          <VitalSignCard icon={Zap} title="Stress Level (GSR)" value={latestValues.gsr.toFixed(2)} unit="μS" isLoading={isMonitoring && data.gsr.length === 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <ChartCard title="ECG Waveform" isPaused={!isMonitoring && data.ecg.length === 0}>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
               <AreaChart data={data.ecg} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 3.3]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
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
          <ChartCard title="GSR (Stress Level)" isPaused={!isMonitoring && data.gsr.length === 0}>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={data.gsr} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
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

      </div>
    </div>
  );
}

const VitalSignCard = ({ icon: Icon, title, value, unit, isLoading }: { icon: any, title: string, value: string | number, unit: string, isLoading: boolean }) => (
  <Card className="bg-white shadow-sm hover:shadow-lg transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <p className="text-gray-500">{title}</p>
        </div>
      </div>
       {isLoading ? (
        <Skeleton className="h-8 w-3/4 mt-1" />
      ) : (
        <div className="text-3xl font-bold text-gray-800">
          {value} <span className="text-lg font-medium text-gray-500">{unit}</span>
        </div>
      )}
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
