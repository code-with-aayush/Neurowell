

'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, TrendingUp, Heart, Zap, Activity, AlertTriangle, Droplets, Bell } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';


const RecommendationIcon = ({ title, className }: { title: string, className?: string }) => {
  const baseClass = "h-6 w-6";
  const combinedClass = `${baseClass} ${className}`;

  if (title.toLowerCase().includes('physical')) return <Activity className={combinedClass} />;
  if (title.toLowerCase().includes('sleep')) return <Bell className={combinedClass} />;
  if (title.toLowerCase().includes('stress')) return <AlertTriangle className={combinedClass} />;
  if (title.toLowerCase().includes('hydration') || title.toLowerCase().includes('nutrition')) return <Droplets className={combinedClass} />;
  return <Heart className={combinedClass} />;
};

const PriorityBadge = ({ priority }: {priority: 'HIGH' | 'MEDIUM' | 'LOW' }) => {
    const priorityStyles = {
        HIGH: 'bg-red-100 text-red-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        LOW: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityStyles[priority]}`}>{priority}</span>
}

function ReportContent() {
  const searchParams = useSearchParams();

  const summary = searchParams.get('summary') || 'No summary available.';
  const recommendationsStr = searchParams.get('suggestions');
  const recommendations = recommendationsStr ? JSON.parse(recommendationsStr) : [];
  
  const avgHr = searchParams.get('avgHr') || 'N/A';
  const avgStress = searchParams.get('avgStress') || 'N/A';

  return (
    <div className="bg-[#F8F9FA] p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-start">
            <div>
                 <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Your Health Report</h1>
                <p className="text-gray-500">Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Button variant="outline" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Average Heart Rate" value={`${avgHr} BPM`} icon={Heart} />
        <StatCard title="Average Stress Level" value={`${avgStress} μS`} icon={Zap} />
        <StatCard title="Session" value="5s Capture" icon={Activity} />
      </div>

       <Card className="mb-8">
           <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Heart className="text-primary"/>Personalized Recommendations</CardTitle>
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

      <div className="bg-primary/10 text-center p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-primary">Report Summary</h2>
        <p className="text-primary/80 max-w-2xl mx-auto mt-2">{summary}</p>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Monitor Again</Link>
        </Button>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, change }: { title: string, value: string, icon: any, change?: string }) => {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-500">{title}</p>
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex justify-between items-baseline">
                    <p className="text-2xl font-bold">{value}</p>
                    {change && <p className={`text-sm font-semibold`}>{change}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

const RecommendationItem = ({ title, description, priority }: { title: string, description: string, priority: 'HIGH' | 'MEDIUM' | 'LOW' }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
        <div className="text-primary pt-1">
            <RecommendationIcon title={title} />
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
    
