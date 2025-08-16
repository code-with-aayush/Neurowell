
import { Suspense } from 'react';
import DashboardClient from './dashboard-client';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen w-full"><Loader2 className="h-8 w-8 animate-spin" /> <p className="ml-2">Loading Patient Dashboard...</p></div>}>
      <DashboardClient />
    </Suspense>
  );
}
