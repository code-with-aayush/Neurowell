
'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Heart, Zap, Activity, Droplets, Moon, Brain, Coffee, Footprints } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"


const statusColors = {
  Good: 'text-green-600',
  Moderate: 'text-yellow-600',
  'Needs Attention': 'text-red-600',
  Low: 'text-green-600',
  High: 'text-red-600',
  Normal: 'bg-green-100 text-green-800',
  Elevated: 'bg-yellow-100 text-yellow-800',
  Like: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const getStatusColor = (status: string, type: 'text' | 'bg' = 'bg') => {
    const s = status as keyof typeof statusColors;
    if(type === 'text') {
        return statusColors[s] || 'text-gray-600';
    }
    return statusColors[s] || statusColors.default;
};

const RecommendationIcon = ({ icon, className }: { icon: string, className?: string }) => {
  const baseClass = "h-6 w-6";
  const combinedClass = `${baseClass} ${className}`;
  switch(icon) {
    case 'sleep': return <Moon className={combinedClass} />;
    case 'mindfulness': return <Brain className={combinedClass} />;
    case 'activity': return <Footprints className={combinedClass} />;
    case 'caffeine': return <Coffee className={combinedClass} />;
    default: return <Heart className={combinedClass} />;
  }
};


function ReportContent() {
  const searchParams = useSearchParams();

  const physiologicalSummary = searchParams.get('physiologicalSummary') || 'No summary available.';
  const recommendationsStr = searchParams.get('recommendations');
  const vitalsStr = searchParams.get('vitals');
  const wellnessScoreStr = searchParams.get('wellnessScore');
  const wellnessStatus = searchParams.get('wellnessStatus') || 'Moderate';
  const mentalHealthInsightsStr = searchParams.get('mentalHealthInsights');
  
  const recommendations = recommendationsStr ? JSON.parse(recommendationsStr) : [];
  const vitals = vitalsStr ? JSON.parse(vitalsStr) : {};
  const mentalHealthInsights = mentalHealthInsightsStr ? JSON.parse(mentalHealthInsightsStr) : {};
  const wellnessScore = wellnessScoreStr ? parseInt(wellnessScoreStr, 10) : 76;
  
  const { heartRate, spo2, ecg, stress } = vitals;
  const { fatigueProbability, mindfulnessScore, riskOfBurnout } = mentalHealthInsights;
  
  const stressChartData = [
    { time: "6 AM", value: 2 },
    { time: "10 AM", value: 3 },
    { time: "12 PM", value: 2.5 },
    { time: "4 PM", value: 4 },
    { time: "8 PM", value: 3.5 },
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                   <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4 transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Dashboard
                  </Link>
                  <div className='flex justify-between items-center'>
                     <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Mental Wellness Report</h1>
                     <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
              </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-8">
                 <Card className="bg-white shadow-md rounded-xl">
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative h-48 w-48">
                                <svg className="absolute inset-0" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8A2BE2" />
                                            <stop offset="100%" stopColor="#32CD32" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="45" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                                    <circle 
                                        cx="50" cy="50" r="45" 
                                        stroke="url(#gradient)" strokeWidth="10" fill="none" 
                                        strokeDasharray={2 * Math.PI * 45}
                                        strokeDashoffset={(2 * Math.PI * 45) * (1 - wellnessScore / 100)}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-5xl font-bold text-gray-800">{wellnessScore}</p>
                                </div>
                            </div>
                            <span className={`mt-4 px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(wellnessStatus, 'bg')}`}>{wellnessStatus}</span>
                            <p className="text-gray-600 mt-4 text-center">{physiologicalSummary}</p>
                        </div>
                        <div className="h-64">
                             <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Daily Stress Trend</h3>
                             <ChartContainer config={{}} className="w-full h-full">
                                <AreaChart data={stressChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#chartGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">Physiological Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <PhysiologicalStat title="Heart Rate" icon={Heart} data={heartRate} />
                        <PhysiologicalStat title="SpO2" icon={Droplets} data={spo2} />
                        <PhysiologicalStat title="ECG Signal" icon={Activity} data={ecg} />
                        <PhysiologicalStat title="Stress Level" icon={Zap} data={stress} />
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
                <Card className="bg-white shadow-md rounded-xl">
                   <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">Mental Health Insights</CardTitle>
                    </CardHeader>
                   <CardContent className="space-y-4">
                        <InsightItem label="Fatigue Probability" value={fatigueProbability} />
                        <InsightItem label="Mindfulness Score" value={mindfulnessScore} />
                        <InsightItem label="Risk of Burnout" value={riskOfBurnout} />
                   </CardContent>
                </Card>
                <Card className="bg-white shadow-md rounded-xl">
                   <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">Recommendations</CardTitle>
                    </CardHeader>
                   <CardContent>
                        {recommendations.length > 0 ? (
                           <div className="space-y-5">
                               {recommendations.map((rec: any, index: number) => (
                                   <RecommendationItem key={index} title={rec.title} description={rec.description} icon={rec.icon} />
                               ))}
                           </div>
                        ) : (
                            <p className="text-gray-500">No recommendations were generated for this report.</p>
                        )}
                   </CardContent>
               </Card>
            </div>
        </div>

        <div className="mt-12 text-center">
             <Button variant="outline" onClick={() => window.print()} className="mt-2 sm:mt-0">
                  <Download className="mr-2 h-4 w-4" />
                  Download or Print
              </Button>
        </div>
      </div>
    </div>
  );
}

const PhysiologicalStat = ({ title, data }: { title: string, icon: any, data?: { value: string, status: string }}) => {
    if (!data) return null;
    return (
        <div className="flex justify-between items-center py-2 border-b">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{data.value}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(data.status)}`}>{data.status}</span>
        </div>
    )
}

const InsightItem = ({ label, value }: { label: string, value: string }) => {
    if(!value) return null;
    return (
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-700">{label}</p>
            <span className={`text-sm font-medium px-4 py-1 rounded-full ${getStatusColor(value, 'bg')}`}>{value}</span>
        </div>
    )
}

const RecommendationItem = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
    <div className="flex items-start gap-4">
        <div className="text-primary bg-primary/10 p-3 rounded-full mt-1">
            <RecommendationIcon icon={icon} />
        </div>
        <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-lg">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </div>
)


export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
