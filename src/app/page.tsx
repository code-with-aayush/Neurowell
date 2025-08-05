import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Watch, Wifi, ClipboardCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <section className="text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            Tune Into Your Mind's Wellbeing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            MindSync Monitor is a revolutionary device that tracks key biometric signals to provide you with a holistic view of your mental state, offering AI-powered insights to guide you towards a healthier, more balanced life.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-7 px-8">
              <Link href="/dashboard">Start Monitoring</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-24 md:mt-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="https://placehold.co/600x400.png"
              alt="MindSync Device in use"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="wellness technology"
            />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold font-headline mb-6">Simple Steps to a Clearer Mind</h2>
            <p className="text-muted-foreground mb-8">
              Getting started with MindSync is effortless. Our streamlined process ensures you can focus on what truly matters - your wellbeing.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary-foreground p-3 rounded-full">
                  <Watch className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">1. Wear The Device</h3>
                  <p className="text-muted-foreground">Comfortably wear the lightweight MindSync device to begin collecting your biometric data seamlessly throughout the day.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary-foreground p-3 rounded-full">
                  <Wifi className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">2. Sync In Real-Time</h3>
                  <p className="text-muted-foreground">Your data is securely and wirelessly synced to our platform, allowing you to view live readings on your personal dashboard.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 text-primary-foreground p-3 rounded-full">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">3. Get AI Insights</h3>
                  <p className="text-muted-foreground">Our advanced AI analyzes your data to generate personalized reports and actionable suggestions for improving your mental wellness.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
