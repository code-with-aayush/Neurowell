
'use client'

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { Loader2, ArrowLeft, FileText, Calendar, LineChart, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Report {
  id: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  wellnessScore: number;
  wellnessStatus: string;
  physiologicalSummary: string;
}

interface Patient {
    patientName: string;
}

const statusColors: { [key: string]: string } = {
  Good: 'bg-green-100 text-green-800',
  Moderate: 'bg-yellow-100 text-yellow-800',
  'Needs Attention': 'bg-red-100 text-red-800',
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Good': return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'Moderate': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'Needs Attention': return <Activity className="h-5 w-5 text-red-600" />;
        default: return <LineChart className="h-5 w-5 text-gray-600" />;
    }
}

export default function ReportHistoryPage() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string;

    const [patient, setPatient] = useState<Patient | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && patientId) {
            // Fetch patient details
            const patientDocRef = doc(db, 'patients', patientId);
            const getPatientData = async () => {
                const patientDoc = await getDoc(patientDocRef);
                if (patientDoc.exists() && patientDoc.data().clinicianId === user.uid) {
                    setPatient(patientDoc.data() as Patient);
                } else {
                    // Unauthorized or patient does not exist
                    router.push('/patients');
                }
            };
            getPatientData();

            // Subscribe to reports
            const q = query(
                collection(db, `patients/${patientId}/reports`), 
                orderBy('createdAt', 'desc')
            );
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const reportsData: Report[] = [];
                querySnapshot.forEach((doc) => {
                    reportsData.push({ id: doc.id, ...doc.data() } as Report);
                });
                setReports(reportsData);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching reports: ", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user, patientId, router]);
    
    if (loading || isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="bg-background min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/patients">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Patient List
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold tracking-tight">Report History</h1>
                    {patient && <p className="text-muted-foreground mt-2 text-xl">Patient: {patient.patientName}</p>}
                </div>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText />
                            All Generated Reports
                        </CardTitle>
                        <CardDescription>
                            Review past reports to track progress and identify trends over time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(report.wellnessStatus)}
                                                <div>
                                                    <p className="font-semibold">Wellness Report</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3"/> 
                                                        {new Date(report.createdAt.seconds * 1000).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="font-medium text-sm text-gray-600">{report.physiologicalSummary}</p>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-4">
                                                <div className="flex flex-col items-end">
                                                    <p className="text-sm text-muted-foreground">Score</p>
                                                    <p className="text-2xl font-bold">{report.wellnessScore}</p>
                                                </div>
                                                 <Badge className={`${statusColors[report.wellnessStatus]}`}>{report.wellnessStatus}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-semibold">No Reports Found</h3>
                                <p className="text-muted-foreground mt-2">Generate a new report from the patient's dashboard to see it here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
