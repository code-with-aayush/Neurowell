
'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, TrendingUp, Heart, Zap, Smile, Shield, Activity, Bell, Droplets, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const weeklyTrendsData = [
  { name: 'Mon', stress: 2.8, hr: 75 },
  { name: 'Tue', stress: 3.1, hr: 78 },
  { name: 'Wed', stress: 2.5, hr: 72 },
  { name: 'Thu', stress: 3.5, hr: 82 },
  { name: 'Fri', stress: 4.0, hr: 85 },
  { name: 'Sat', stress: 1.8, hr: 68 },
  { name: 'Sun', stress: 1.5, hr: 65 },
];

const stressDistributionData = [
    { name: 'Low', value: 50, fill: '#34D399' },
    { name: 'Moderate', value: 35, fill: '#FBBF24' },
    { name: 'High', value: 15, fill: '#F87171' },
];

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

function ReportContent({ summary, suggestions, avgHr, avgStress }: { summary?: string; suggestions?: string, avgHr?: string, avgStress?: string }) {
  if (!summary || !suggestions) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle className="text-2xl">Report Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested report could not be generated. Please return to the dashboard and try again.</p>
           <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const decodedSummary = decodeURIComponent(summary);
  const decodedSuggestions = JSON.parse(decodeURIComponent(suggestions));
  const overallScore = decodedSummary.match(/\d+\/100/)?.[0] || '85/100';

  return (
    <div className="bg-[#F8F9FA] p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-start">
            <div>
                 <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Weekly Health Report</h1>
                <p className="text-gray-500">Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Average Heart Rate" value={`${avgHr || '73'} BPM`} change="+2%" icon={Heart} />
        <StatCard title="Stress Level" value={`${avgStress || '2.4'} μS`} change="-15%" icon={Zap} trend="down" />
        <StatCard title="Sleep Quality" value="7.5 hrs" change="+8%" icon={Smile} />
        <StatCard title="Recovery Score" value="85%" change="+12%" icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold"><TrendingUp className="text-primary"/>Weekly Trends</CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" axisLine={false} tickLine={false}/>
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="stress" fill="#8884d8" name="Stress" radius={[4, 4, 0, 0]}/>
                <Bar yAxisId="right" dataKey="hr" fill="#82ca9d" name="Heart Rate" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Zap className="text-primary"/>Stress Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie data={stressDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {stressDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

       <Card className="mb-8">
           <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Heart className="text-primary"/>Personalized Recommendations</CardTitle>
            </CardHeader>
           <CardContent>
               <div className="space-y-4">
                   {decodedSuggestions.map((rec: any, index: number) => (
                       <RecommendationItem key={index} title={rec.title} description={rec.description} priority={rec.priority} />
                   ))}
               </div>
           </CardContent>
       </Card>

      <div className="bg-primary/10 text-center p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-primary">Overall Health Score: {overallScore}</h2>
        <p className="text-primary/80 max-w-2xl mx-auto mt-2">{decodedSummary.replace(/Overall Health Score: \d+\/\d+\./, '')}</p>
        <Button asChild className="mt-6">
            <Link href="/dashboard">Continue Monitoring</Link>
        </Button>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, change, icon: Icon, trend = 'up' }: { title: string, value: string, change: string, icon: any, trend?: 'up' | 'down' }) => {
    const changeColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <div className="flex justify-between items-baseline">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>
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


export default function ReportPage({
  searchParams,
}: {
  searchParams: { summary?: string; suggestions?: string; avgHr?: string; avgStress?: string };
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading report...</div>}>
      <ReportContent summary={searchParams.summary} suggestions={searchParams.suggestions} avgHr={searchParams.avgHr} avgStress={searchParams.avgStress} />
    </Suspense>
  );
}
