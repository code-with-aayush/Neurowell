
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Heart, Droplets, Activity, Zap, Play, Loader2, AlertCircle, Plug } from 'lucide-react';
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
  const router = useRouter();
  
  const readerRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<any> | null>(null);
  const portRef = useRef<any | null>(null); 
  const keepReading = useRef(false);

  const readFromSerialPort = async () => {
    if (!readerRef.current) return;
    
    const textDecoder = new TextDecoder();
    let buffer = '';

    while (keepReading.current) {
      try {
        const { value, done } = await readerRef.current.read();
        if (done) {
          break;
        }
        
        buffer += textDecoder.decode(value, { stream: true });
        
        let jsonEnd = buffer.indexOf('}');
        while (jsonEnd !== -1) {
            const jsonStart = buffer.lastIndexOf('{', jsonEnd);
            if (jsonStart !== -1) {
                const jsonString = buffer.substring(jsonStart, jsonEnd + 1);
                
                try {
                    const sensorData = JSON.parse(jsonString);
                    keepReading.current = false; // Stop reading after getting data
                    
                    setIsMonitoring(false);

                    const now = new Date();
                    const formatTime = (sec: number) => new Date(now.getTime() - (5 - sec) * 1000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });

                    const heartRateData = sensorData.heartRate.map((val: number, i: number) => ({ time: formatTime(i), value: val }));
                    const spo2Data = sensorData.spo2.map((val: number, i: number) => ({ time: formatTime(i), value: val }));
                    const ecgData = sensorData.ecg.map((val: number, i: number) => ({ time: formatTime(i), value: val }));
                    const gsrData = sensorData.gsr.map((val: number, i: number) => ({ time: formatTime(i), value: val }));
                   
                    setData({
                      heartRate: heartRateData,
                      spo2: spo2Data,
                      ecg: ecgData,
                      gsr: gsrData
                    });

                    const last = (arr: any[]) => arr.length > 0 ? arr[arr.length - 1].value : 0;
                    setLatestValues({
                      heartRate: last(heartRateData),
                      spo2: last(spo2Data),
                      ecg: last(ecgData),
                      gsr: last(gsrData)
                    });
                    
                    // Wait for 5 seconds before generating the report
                    setTimeout(() => {
                        handleGenerateReport({ heartRate: sensorData.heartRate, spo2: sensorData.spo2, ecg: sensorData.ecg, gsr: sensorData.gsr });
                    }, 5000);


                    buffer = buffer.substring(jsonEnd + 1);
                    break; 

                } catch (e) {
                  console.warn("Could not parse JSON from serial:", jsonString, e);
                  setError("Received invalid data from device.");
                  setIsMonitoring(false);
                }
                
                buffer = buffer.substring(jsonEnd + 1);
            }
            jsonEnd = buffer.indexOf('}', jsonEnd > -1 ? jsonEnd + 1 : 0);
        }

      } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error("Error reading from serial port:", err);
            setError("Error reading from device. It may have been disconnected.");
            setIsDeviceConnected(false);
            keepReading.current = false;
        }
        setIsMonitoring(false);
        break;
      }
    }
  };


  const handleGenerateReport = async (collectedData: { heartRate: number[], spo2: number[], ecg: number[], gsr: number[]}) => {
    if (isGenerating) return;

    setIsGenerating(true); 
    setShowRedirectingOverlay(true);
    setError(null);
    
    const createDataPoint = (value: number, index: number) => ({ time: `${index}s`, value });

    const formData = new FormData();
    formData.append('heartRate', JSON.stringify(collectedData.heartRate.map(createDataPoint)));
    formData.append('spo2', JSON.stringify(collectedData.spo2.map(createDataPoint)));
    formData.append('ecg', JSON.stringify(collectedData.ecg.map(createDataPoint)));
    formData.append('gsr', JSON.stringify(collectedData.gsr.map(createDataPoint)));

    const result = await createReport(null, formData);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setError(result.message);
      setIsGenerating(false);
      setShowRedirectingOverlay(false);
    }
  };

  const startMonitoring = async () => {
    if (!writerRef.current) {
        setError("Device is not ready to write.");
        return;
    }
    setData(initialDataState);
    setLatestValues(initialLatestValues);
    setError(null);
    setIsMonitoring(true);
    setIsGenerating(false);

    try {
        const textEncoder = new TextEncoder();
        await writerRef.current.write(textEncoder.encode("M")); // Send 'M' to start monitoring
        
        keepReading.current = true;
        readFromSerialPort(); // Start reading AFTER sending the command
    } catch (err) {
        console.error("Error writing to serial port:", err);
        setError("Could not send command to device.");
        setIsMonitoring(false);
    }
  };


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

        // Do not start reading immediately. Wait for user to click "Start Monitoring"
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
    keepReading.current = false;
    
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
             <Button onClick={startMonitoring} disabled={!isDeviceConnected || isMonitoring || isGenerating}>
                {isMonitoring ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Monitoring...
                    </>
                ) : isGenerating ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
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
          <VitalSignCard icon={Heart} title="Heart Rate" value={latestValues.heartRate.toFixed(0)} unit="BPM" isLoading={isMonitoring} />
          <VitalSignCard icon={Droplets} title="Blood Oxygen" value={`${latestValues.spo2.toFixed(1)}`} unit="%" isLoading={isMonitoring} />
          <VitalSignCard icon={Activity} title="ECG Signal" value={latestValues.ecg.toFixed(2)} unit="mV" isLoading={isMonitoring} />
          <VitalSignCard icon={Zap} title="Stress Level (GSR)" value={latestValues.gsr.toFixed(2)} unit="μS" isLoading={isMonitoring} />
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
    

    