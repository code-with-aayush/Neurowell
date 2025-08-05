import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-lg sm:text-xl font-bold font-headline text-foreground transition-opacity hover:opacity-80">
          <div className="bg-primary/20 p-2 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">MindSync Monitor</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} className="transition-transform hover:scale-105">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
