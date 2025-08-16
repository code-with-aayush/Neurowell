
'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Download, User, Moon, Brain, Coffee, Footprints, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const statusColors = {
  Good: 'text-green-600 bg-green-100',
  Moderate: 'text-yellow-600 bg-yellow-100',
  'Needs Attention': 'text-red-600 bg-red-100',
  Low: 'text-green-600',
  High: 'text-red-600',
  Normal: 'bg-green-100 text-green-800',
  Elevated: 'bg-yellow-100 text-yellow-800',
  'Slightly Low': 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const getStatusColorClass = (status?: string) => {
    if (!status) return statusColors.default;
    const s = status as keyof typeof statusColors;
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
    default: return <Lightbulb className={combinedClass} />;
  }
};

const safelyDecodeAndParse = (str: string | null) => {
    if (!str) return null;
    try {
        const decoded = Buffer.from(str, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch (e) {
        console.error("Failed to decode or parse string from URL:", e);
        return null; 
    }
}

function ReportContent() {
  const searchParams = useSearchParams();

  const patientId = searchParams.get('patientId');
  const patientName = searchParams.get('patientName');
  const physiologicalSummary = searchParams.get('physiologicalSummary') || 'No summary available.';
  const mentalHealthSummary = searchParams.get('mentalHealthSummary') || 'No insights available.';
  const recommendationsStr = searchParams.get('recommendations');
  const vitalsStr = searchParams.get('vitals');
  const wellnessScoreStr = searchParams.get('wellnessScore');
  const wellnessStatus = searchParams.get('wellnessStatus') || 'Moderate';
  
  const recommendations = safelyDecodeAndParse(recommendationsStr) || [];
  const vitals = safelyDecodeAndParse(vitalsStr) || {};
  const wellnessScore = wellnessScoreStr ? parseInt(wellnessScoreStr, 10) : 76;
  
  const { heartRate, spo2, ecg, stress } = vitals;
  
  const mentalBoostTip = recommendations?.[0];
  const suggestionBoxTips = recommendations?.slice(0, 2);
  const remainingRecommendations = recommendations?.slice(1);

  const dashboardUrl = patientId && patientName ? `/dashboard?patientId=${patientId}&patientName=${patientName}` : '/patients';

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                   <Link href={dashboardUrl} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4 transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Patient Dashboard
                  </Link>
                  <div className='flex justify-between items-center'>
                     <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Patient Wellness Report</h1>
                  </div>
                  {patientName && (
                    <div className="flex items-center gap-2 mt-2 text-gray-500">
                        <User className="h-5 w-5" />
                        <span>{patientName} (ID: {patientId})</span>
                        <span className="text-sm ml-4">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
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
                                            <stop offset="0%" stopColor="#D0BFFF" />
                                            <stop offset="100%" stopColor="#B3E283" />
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
                            <span className={`mt-4 px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusColorClass(wellnessStatus)}`}>{wellnessStatus}</span>
                            <div className="text-gray-600 mt-4 text-center space-y-1">
                                <p>{physiologicalSummary}</p>
                                <p>{mentalHealthSummary}</p>
                            </div>
                        </div>
                        
                        <Card className="bg-primary/10 border-primary/20 p-6 rounded-lg">
                            <CardTitle className="text-lg font-semibold text-primary-foreground/80 mb-4 flex items-center gap-2">
                                <Lightbulb />
                                AI-Based Suggestion Box
                            </CardTitle>
                            <div className="space-y-4">
                                {suggestionBoxTips && suggestionBoxTips.length > 0 ? (
                                    suggestionBoxTips.map((tip: any, index: number) => (
                                        <RecommendationItem key={index} {...tip} />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">No immediate suggestions. Keep up the good work!</p>
                                )}
                            </div>
                        </Card>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-md rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">Physiological Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <PhysiologicalStat title="Heart Rate" data={heartRate} />
                        <PhysiologicalStat title="SpO2" data={spo2} />
                        <PhysiologicalStat title="ECG Signal" data={ecg} />
                        <PhysiologicalStat title="Stress Level (GSR)" data={stress} />
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
                {mentalBoostTip && (
                <Card className="bg-white shadow-md rounded-xl">
                   <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">Today’s Mental Boost Tip</CardTitle>
                    </CardHeader>
                   <CardContent>
                        <RecommendationItem 
                            icon={mentalBoostTip.icon}
                            title={mentalBoostTip.title}
                            description={mentalBoostTip.description}
                        />
                   </CardContent>
                </Card>
                )}
                
                <Card className="bg-white shadow-md rounded-xl">
                   <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-800">Recommendations</CardTitle>
                        <CardDescription>Actionable steps for the patient's well-being.</CardDescription>
                    </CardHeader>
                   <CardContent>
                        {remainingRecommendations && remainingRecommendations.length > 0 ? (
                           <div className="space-y-5">
                               {remainingRecommendations.map((rec: any, index: number) => (
                                   <RecommendationItem key={index} {...rec} />
                               ))}
                           </div>
                        ) : (
                            <p className="text-gray-500">No further recommendations for today.</p>
                        )}
                   </CardContent>
               </Card>
            </div>
        </div>

        <div className="mt-12 text-center">
             <Button variant="outline" onClick={() => window.print()} className="mt-2 sm:mt-0">
                  <Download className="mr-2 h-4 w-4" />
                  Download or Print Report
              </Button>
        </div>
      </div>
    </div>
  );
}

const PhysiologicalStat = ({ title, data }: { title: string, data?: { value: string, status: string }}) => {
    if (!data) return null;
    return (
        <div className="flex justify-between items-center py-2 border-b">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{data.value}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColorClass(data.status)}`}>{data.status}</span>
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
