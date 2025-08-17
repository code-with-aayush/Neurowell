
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, doc, writeBatch } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2, Users, ArrowRight, UserPlus, FileText, Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { deletePatientAction } from './actions';

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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);


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
  
  const handleDeletePatient = async (patientId: string) => {
      if (!user) {
          toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to delete a patient.' });
          return;
      }
      setIsDeleting(patientId);

      const result = await deletePatientAction({ patientId, clinicianId: user.uid });

      if (result.success) {
          toast({ title: 'Success', description: 'Patient and all associated reports have been deleted.' });
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
      setIsDeleting(null);
  }

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
                                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-lg">{patient.patientName}</p>
                                            <p className="text-sm text-muted-foreground">ID: {patient.patientId}</p>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Button variant="outline" asChild size="sm">
                                                <Link href={`/reports/${patient.id}`}>
                                                     <FileText className="mr-2 h-4 w-4" />
                                                     Reports
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm">
                                                <Link href={`/dashboard?patientId=${patient.id}&patientName=${encodeURIComponent(patient.patientName)}`}>
                                                    Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" disabled={isDeleting === patient.id}>
                                                        {isDeleting === patient.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert />Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                          This action cannot be undone. This will permanently delete the patient <span className="font-bold">{patient.patientName}</span> and all of their associated reports.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeletePatient(patient.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Yes, delete patient
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
