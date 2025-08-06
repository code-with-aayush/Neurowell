
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Heart, Droplets, Activity, Zap, Play, StopCircle, Loader2, AlertCircle, Plug } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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

const REQUIRED_DATA_POINTS = 5;

export default function DashboardClient() {
  const [data, setData] = useState(initialDataState);
  const [latestValues, setLatestValues] = useState(initialLatestValues);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRedirectingOverlay, setShowRedirectingOverlay] = useState(false);
  
  const router = useRouter();
  
  const portRef = useRef<any | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<any> | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nonZeroDataCountRef = useRef(0);
  
  const isMonitoringRef = useRef(isMonitoring);
  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  const handleGenerateReport = async (values: typeof initialLatestValues) => {
    if (isGenerating) return;

     if (values.heartRate === 0 || values.spo2 === 0 || values.ecg === 0 || values.gsr === 0) {
        setError("Cannot generate report with zero values. Please monitor again.");
        return;
    }

    setIsGenerating(true); 
    setShowRedirectingOverlay(true);
    setError(null);
      
    const formData = new FormData();
    formData.append('heartRate', values.heartRate.toString());
    formData.append('spo2', values.spo2.toString());
    formData.append('ecg', values.ecg.toString());
    formData.append('gsr', values.gsr.toString());
  
    const result = await createReport(null, formData);
  
    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setError(result.message);
      setIsGenerating(false);
      setShowRedirectingOverlay(false);
    }
  };
  
  const stopMonitoring = () => {
    if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
    }
    setIsMonitoring(false);
    
    setLatestValues(currentLatestValues => {
      if(currentLatestValues.heartRate > 0 || currentLatestValues.spo2 > 0) {
          setShowRedirectingOverlay(true); 
          setTimeout(() => {
            handleGenerateReport(currentLatestValues);
          }, 5000); 
      }
      return currentLatestValues;
    });
  }

  const handleDisconnectDevice = async () => {
    if (isMonitoring) {
      stopMonitoring();
    }
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      } catch (error) { /* Ignore */ }
      readerRef.current = null;
    }
    
    if (writerRef.current) {
        try {
            writerRef.current.releaseLock();
        } catch (error) { /* Ignore */ }
        writerRef.current = null;
    }

    if (portRef.current) {
        try {
            await portRef.current.close();
        } catch (error) { /* Ignore */ }
        portRef.current = null;
    }

    console.log("Device disconnected.");
  };

  const readLoop = async () => {
    const textDecoder = new TextDecoder();
    let buffer = '';

    while (portRef.current?.readable) {
      try {
        const { value, done } = await readerRef.current!.read();
        if (done) {
          break;
        }

        buffer += textDecoder.decode(value, { stream: true });
        
        let jsonEnd;
        while ((jsonEnd = buffer.indexOf('}')) !== -1) {
          const jsonStart = buffer.lastIndexOf('{', jsonEnd);
          if (jsonStart !== -1) {
            const jsonString = buffer.substring(jsonStart, jsonEnd + 1);
            buffer = buffer.substring(jsonEnd + 1); 

            try {
              const sensorData = JSON.parse(jsonString);
              
              const isDataValid = sensorData.heartRate && sensorData.heartRate.length > 0;
              const isDataNonZero = isDataValid && sensorData.heartRate[0] > 0 && sensorData.spo2[0] > 0 && sensorData.ecg[0] > 0 && sensorData.gsr[0] > 0;

              if (isMonitoringRef.current && isDataValid) {
                  const now = new Date();
                  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

              if (isMonitoringRef.current && isDataNonZero) {
                 nonZeroDataCountRef.current += 1;
                 if(nonZeroDataCountRef.current >= REQUIRED_DATA_POINTS) {
                    stopMonitoring();
                 }
              }

            } catch (e) {
                console.warn("Could not parse JSON from serial:", jsonString, e);
            }
          } else {
             buffer = buffer.substring(jsonEnd + 1);
          }
        }
      } catch (err: any) {
        if (!err.message.includes('The port is closed.')) {
           console.error("Error in read loop:", err);
           setError("Error reading from device. It may have been disconnected.");
           handleDisconnectDevice();
        }
        break; 
      }
    }
  };

  const startMonitoring = async () => {
    if (!portRef.current) {
      if ('serial' in navigator) {
        try {
          // @ts-ignore
          const port = await navigator.serial.requestPort();
          await port.open({ baudRate: 9600 });
          portRef.current = port;
          writerRef.current = port.writable.getWriter();
          readerRef.current = port.readable.getReader();
          readLoop();
        } catch (err: any) {
          if (err.name !== 'NotFoundError') {
            setError("Failed to connect to the device. Please ensure it's plugged in and try again.");
          }
          return;
        }
      } else {
        setError("This browser does not support the Web Serial API. Please use Chrome or Edge.");
        return;
      }
    }

    setData(initialDataState);
    setError(null);
    setIsMonitoring(true);
    nonZeroDataCountRef.current = 0;

    monitoringIntervalRef.current = setInterval(async () => {
       if (writerRef.current) {
          try {
            const textEncoder = new TextEncoder();
            await writerRef.current.write(textEncoder.encode("M"));
          } catch (err) {
             console.error("Error writing to serial port:", err);
             setError("Could not send command to device.");
             stopMonitoring();
          }
       }
    }, 1000);
  };
  
  const getStatusMessage = () => {
      if (showRedirectingOverlay) {
        return 'Monitoring complete. Generating your report...';
      }
      if (isMonitoring) {
        return `Monitoring... (${nonZeroDataCountRef.current}/${REQUIRED_DATA_POINTS} valid readings)`;
      }
      return 'Click "Start Monitoring" to begin.';
  }

  const isDeviceConnected = !!portRef.current;
  
  const chartDataBPM = [ { name: 'Normal', value: 80 }, { name: 'Live', value: latestValues.heartRate } ];
  const chartDataSpO2 = [ { name: 'Normal', value: 97 }, { name: 'Live', value: latestValues.spo2 } ];
  const chartDataECG = [ { name: 'Normal', value: 1.0 }, { name: 'Live', value: latestValues.ecg } ];
  const chartDataGSR = [ { name: 'Normal', value: 5.0 }, { name: 'Live', value: latestValues.gsr } ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-8 relative">
       {showRedirectingOverlay && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Analyzing Data & Generating Report...</h2>
          <p className="text-gray-500">Please wait. This will take about 5 seconds.</p>
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
                <Button onClick={startMonitoring}>
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
                <Button onClick={stopMonitoring} variant="destructive">
                    <StopCircle className="mr-2 h-4 w-4" />
                    Stop Monitoring
                </Button>
             )}
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
                {getStatusMessage()}
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
          <VitalSignCard icon={Heart} title="Heart Rate" value={latestValues.heartRate.toFixed(0)} unit="BPM" isLoading={isMonitoring && data.heartRate.length === 0}/>
          <VitalSignCard icon={Droplets} title="Blood Oxygen" value={`${latestValues.spo2.toFixed(1)}`} unit="%" isLoading={isMonitoring && data.spo2.length === 0} />
          <VitalSignCard icon={Activity} title="ECG Signal" value={latestValues.ecg.toFixed(2)} unit="mV" isLoading={isMonitoring && data.ecg.length === 0} />
          <VitalSignCard icon={Zap} title="Stress Level (GSR)" value={latestValues.gsr.toFixed(2)} unit="μS" isLoading={isMonitoring && data.gsr.length === 0} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Heart Rate (BPM)" data={chartDataBPM} dataKey="value" domain={[0, 150]} />
            <ChartCard title="Blood Oxygen (SpO2)" data={chartDataSpO2} dataKey="value" domain={[80, 100]} />
            <ChartCard title="ECG Signal (mV)" data={chartDataECG} dataKey="value" domain={[0, 3.3]} />
            <ChartCard title="Stress Level (GSR)" data={chartDataGSR} dataKey="value" domain={[0, 20]} />
        </div>

      </div>
    </div>
  );
}

const VitalSignCard = ({ icon: Icon, title, value, unit, isLoading }: { icon: any, title: string, value: string | number, unit: string, isLoading: boolean }) => {
  return (
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
};


const ChartCard = ({ title, data, dataKey, domain }: { title: string, data: any[], dataKey: string, domain: [number, number] }) => {
    return (
    <Card className="bg-white shadow-sm hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[200px] w-full">
                <ChartContainer config={{}} className="w-full h-full">
                    <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis type="number" domain={domain} tick={{ fontSize: 12 }} />
                        <Tooltip
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} >
                           {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Live' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}/>
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>
        </CardContent>
    </Card>
    );
};
