
import { BrainCircuit } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
                 <BrainCircuit className="h-6 w-6 text-primary" />
                 <span className="font-bold text-lg text-foreground">NeuroWell</span>
            </div>
          <p className="text-sm text-muted-foreground">
            A Hackathon Project for Advanced Patient Monitoring.
          </p>
           <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            © 2024. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
