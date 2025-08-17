
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Users, LogOut, ArrowRight, UserPlus } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  
  const AuthNav = () => (
    <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className={cn("rounded-full", pathname === '/login' && 'font-bold')}>
            <Link href="/login">Log in</Link>
        </Button>
        <Button asChild className={cn("rounded-full", pathname === '/signup' ? 'bg-primary text-primary-foreground' : 'bg-white/50 text-primary')}>
            <Link href="/signup">Sign Up</Link>
        </Button>
    </div>
  );
  
  const LoggedInNav = () => (
    <div className="flex items-center gap-2">
      <Button asChild variant={pathname === '/patients' ? 'secondary' : 'ghost'} className="rounded-full">
        <Link href="/patients" className="flex items-center gap-2">
          <Users className="h-4 w-4"/>
          My Patients
        </Link>
      </Button>
      <Button asChild variant={pathname === '/patients/new' ? 'secondary' : 'ghost'} className="rounded-full">
        <Link href="/patients/new" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4"/>
          New Patient
        </Link>
      </Button>
      <Button variant="outline" onClick={handleLogout} className="rounded-full">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );

  const LoggedOutNav = () => (
    <div className="hidden sm:flex items-center gap-2">
       <Button asChild variant="ghost" className="rounded-full">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
        <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  );

  if (!isMounted) {
    return (
       <header className={cn("bg-background/80 backdrop-blur-sm sticky top-0 z-50", !isAuthPage && "border-b")}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <span className="font-semibold">NeuroWell</span>
          </Link>
          <div className="h-10 w-24 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className={cn("bg-background/80 backdrop-blur-sm sticky top-0 z-50", !isAuthPage && "border-b")}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="font-semibold">NeuroWell</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <LoggedInNav />
          ) : isAuthPage ? (
             <AuthNav />
          ) : (
            <LoggedOutNav />
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
