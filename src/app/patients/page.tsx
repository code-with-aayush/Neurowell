
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, Users, ArrowRight, UserPlus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Patient {
    id: string; // Document ID
    patientId: string; // The custom patient ID
    patientName: string;
    clinicianId: string;
}

export default function PatientListPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "patients"), where("clinicianId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const patientsData: Patient[] = [];
        querySnapshot.forEach((doc) => {
          patientsData.push({ id: doc.id, ...doc.data() } as Patient);
        });
        setPatients(patientsData);
        setIsLoadingPatients(false);
      }, (error) => {
          console.error("Error fetching patients: ", error);
          setIsLoadingPatients(false);
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  if (loading || !user) {
      return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="bg-background min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight">My Patients</h1>
                <p className="text-muted-foreground mt-2 text-lg">Select a patient to view their dashboard or see their report history.</p>
            </div>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users />
                            Patient List
                        </div>
                        <Button asChild>
                            <Link href="/patients/new">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add New Patient
                            </Link>
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Here is a list of all patients you have registered.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingPatients ? (
                         <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : patients.length > 0 ? (
                        <div className="space-y-4">
                            {patients.map((patient) => (
                                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-lg">{patient.patientName}</p>
                                            <p className="text-sm text-muted-foreground">ID: {patient.patientId}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" asChild>
                                                <Link href={`/reports/${patient.id}`}>
                                                     <FileText className="mr-2 h-4 w-4" />
                                                     View Reports
                                                </Link>
                                            </Button>
                                            <Button asChild>
                                                <Link href={`/dashboard?patientId=${patient.id}&patientName=${encodeURIComponent(patient.patientName)}`}>
                                                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold">No Patients Found</h3>
                            <p className="text-muted-foreground mt-2">Get started by adding your first patient.</p>
                            <Button asChild className="mt-4">
                                <Link href="/patients/new">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Patient
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
