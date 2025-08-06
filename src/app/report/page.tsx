

'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, TrendingUp, Heart, Zap, Activity, AlertTriangle, Droplets, Bell, CheckCircle, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

const RecommendationIcon = ({ title, className }: { title: string, className?: string }) => {
  const baseClass = "h-6 w-6";
  const combinedClass = `${baseClass} ${className}`;

  if (title.toLowerCase().includes('physical')) return <Activity className={combinedClass} />;
  if (title.toLowerCase().includes('sleep')) return <Bell className={combinedClass} />;
  if (title.toLowerCase().includes('stress')) return <Zap className={combinedClass} />;
  if (title.toLowerCase().includes('hydration') || title.toLowerCase().includes('nutrition')) return <Droplets className={combinedClass} />;
  return <Heart className={combinedClass} />;
};

const PriorityBadge = ({ priority }: {priority: 'HIGH' | 'MEDIUM' | 'LOW' }) => {
    const priorityStyles = {
        HIGH: 'bg-red-100 text-red-800 border-red-200',
        MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        LOW: 'bg-green-100 text-green-800 border-green-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${priorityStyles[priority]}`}>{priority}</span>
}

const statusStyles: { [key: string]: string } = {
  normal: 'bg-green-100 text-green-800',
  elevated: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800',
};

const getStatusStyle = (status: string) => {
    const lowerCaseStatus = status.toLowerCase();
    for (const key in statusStyles) {
        if (lowerCaseStatus.includes(key)) {
            return statusStyles[key];
        }
    }
    return statusStyles.default;
};


function ReportContent() {
  const searchParams = useSearchParams();

  const summary = searchParams.get('summary') || 'No summary available.';
  const recommendationsStr = searchParams.get('recommendations');
  const vitalsStr = searchParams.get('vitals');
  const wellnessScoreStr = searchParams.get('wellnessScore');
  
  const recommendations = recommendationsStr ? JSON.parse(recommendationsStr) : [];
  const vitals = vitalsStr ? JSON.parse(vitalsStr) : {};
  const wellnessScore = wellnessScoreStr ? parseInt(wellnessScoreStr, 10) : 0;
  
  const { heartRate, spo2, ecg, stress } = vitals;

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                   <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4 transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Dashboard
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Wellness Report</h1>
                  <p className="text-gray-500 mt-1">Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <Button variant="outline" onClick={() => window.print()} className="mt-2 sm:mt-0">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
              </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                 <Card className="bg-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3 font-bold text-gray-800"><ShieldCheck className="text-primary"/>Overall Wellness</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-600 mb-2">Your Wellness Score</p>
                            <p className={`text-6xl font-bold ${wellnessScore > 80 ? 'text-green-600' : wellnessScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>{wellnessScore}<span className="text-3xl text-gray-400">/100</span></p>
                        </div>
                        <Progress value={wellnessScore} className="h-3"/>
                        <p className="text-center text-gray-600 leading-relaxed max-w-2xl mx-auto pt-2">{summary}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3 font-bold text-gray-800"><Activity className="text-primary"/>Vital Signs Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <VitalStatCard title="Heart Rate" icon={Heart} data={heartRate} />
                        <VitalStatCard title="Blood Oxygen" icon={Droplets} data={spo2} />
                        <VitalStatCard title="ECG Signal" icon={TrendingUp} data={ecg} />
                        <VitalStatCard title="Stress Level" icon={Zap} data={stress} />
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
                <Card className="bg-white shadow-lg">
                   <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3 font-bold text-gray-800"><CheckCircle className="text-primary"/>Recommendations</CardTitle>
                    </CardHeader>
                   <CardContent>
                        {recommendations.length > 0 ? (
                           <div className="space-y-4">
                               {recommendations.map((rec: any, index: number) => (
                                   <RecommendationItem key={index} title={rec.title} description={rec.description} priority={rec.priority} />
                               ))}
                           </div>
                        ) : (
                            <p className="text-gray-500">No recommendations were generated for this report.</p>
                        )}
                   </CardContent>
               </Card>
               <div className="bg-primary/10 text-center p-6 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-bold text-primary">Monitor Again</h3>
                    <p className="text-primary/80 text-sm max-w-2xl mx-auto mt-1">Regular monitoring helps track your progress over time.</p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard">Start New Session</Link>
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

const VitalStatCard = ({ title, icon: Icon, data }: { title: string, icon: any, data?: { value: string, status: string, interpretation: string }}) => {
    if (!data) return null;
    return (
        <Card className="bg-gray-50/50 border-gray-200/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-600 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-bold text-gray-800">{data.value}</p>
                   <span className={`text-sm font-medium px-2 py-1 rounded-md ${getStatusStyle(data.status)}`}>{data.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 flex items-start gap-2"><Info size={14} className="mt-0.5 shrink-0"/>{data.interpretation}</p>
            </CardContent>
        </Card>
    )
}

const RecommendationItem = ({ title, description, priority }: { title: string, description: string, priority: 'HIGH' | 'MEDIUM' | 'LOW' }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200/80 shadow-sm">
        <div className="text-primary bg-primary/10 p-2 rounded-full mt-1">
            <RecommendationIcon title={title} className="h-5 w-5" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <PriorityBadge priority={priority} />
            </div>
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
