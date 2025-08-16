
import { Suspense } from 'react';
import DashboardClient from './dashboard-client';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// This is a server component to protect the route
export default async function DashboardPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const patientId = searchParams.patientId as string;
  const patientName = searchParams.patientName as string;

  // This is a placeholder for real auth check
  // In a real app, you would get the current user from the session
  // and check if they have permission to view this patient.
  if (!patientId || !patientName) {
     redirect('/patients');
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen w-full"><Loader2 className="h-8 w-8 animate-spin" /> <p className="ml-2">Loading Patient Dashboard...</p></div>}>
      <DashboardClient />
    </Suspense>
  );
}
