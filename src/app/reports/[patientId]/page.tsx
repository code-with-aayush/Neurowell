
'use client'

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft, FileText, Calendar, LineChart, CheckCircle, AlertTriangle, Activity, Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { deleteReportAction } from './actions';

interface Report {
  id: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  wellnessScore: number;
  wellnessStatus: string;
  physiologicalSummary: string;
  mentalHealthSummary: string;
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
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

    const handleDeleteReport = async (reportId: string) => {
        setIsDeleting(reportId);
        const result = await deleteReportAction({ patientId, reportId });
        if (result.success) {
            toast({ title: "Success", description: "Report deleted successfully." });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setIsDeleting(null);
    }
    
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
                            Review past reports to track progress and identify trends over time. Click a report to view details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <Card key={report.id} className="hover:shadow-md transition-shadow group">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <Link href={`/report?patientId=${patientId}&reportId=${report.id}`} className="flex-grow grid grid-cols-1 md:grid-cols-4 items-center gap-4">
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
                                                    <p className="font-medium text-sm text-foreground/80">{report.physiologicalSummary}</p>
                                                    <p className="font-medium text-sm text-foreground/80 italic mt-1">{report.mentalHealthSummary}</p>
                                                </div>
                                                <div className="flex items-center justify-end gap-4">
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-sm text-muted-foreground">Score</p>
                                                        <p className="text-2xl font-bold">{report.wellnessScore}</p>
                                                    </div>
                                                     <Badge className={`${statusColors[report.wellnessStatus]}`}>{report.wellnessStatus}</Badge>
                                                </div>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" disabled={isDeleting === report.id}>
                                                        {isDeleting === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert/>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                          This action cannot be undone. This will permanently delete this report generated on {new Date(report.createdAt.seconds * 1000).toLocaleDateString()}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteReport(report.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Yes, delete report
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
