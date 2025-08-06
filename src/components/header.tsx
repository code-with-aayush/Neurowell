
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Heart, LineChart, FileText, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  
  const navLinks = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/dashboard', label: 'Dashboard', icon: LineChart },
    { href: '/report', label: 'Report', icon: FileText },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="font-semibold">MindSync</span>
        </Link>
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button key={link.href} asChild variant={pathname === link.href ? 'secondary' : 'ghost'} className="rounded-full">
                <Link href={link.href} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4"/>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" onClick={handleLogout} className="rounded-full">
              Logout
            </Button>
          ) : (
            <>
               <Button asChild variant="ghost" className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
