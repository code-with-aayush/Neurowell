
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Heart, Activity, Shield, Cpu, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleDashboardRedirect = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      router.push('/login');
    }
  };

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter">
              Your Mental Health, <br />
              <span className="text-primary">Monitored</span> Continuously
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Advanced biometric monitoring that tracks your mental well-being in real-time, providing insights to help you maintain optimal mental health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold">
                <Link href="/dashboard" onClick={handleDashboardRedirect}>Start Monitoring <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-6">
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-muted-foreground">Monitoring</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-muted-foreground">Vital Signs</p>
              </div>
              <div>
                <p className="text-2xl font-bold">AI</p>
                <p className="text-muted-foreground">Powered</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/hero-image.jpg"
              alt="Woman with biometric data overlay"
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Simple steps to start monitoring your mental health with advanced biometric technology.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Heart className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">1</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Wear Your Device</h3>
              <p className="text-muted-foreground">Put on your comfortable monitoring device to start tracking your vital signs.</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
               <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">2</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitor Continuously</h3>
              <p className="text-muted-foreground">Real-time tracking of heart rate, SpO2, ECG, and stress levels throughout your day.</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
               <div className="flex items-center justify-between mb-4">
                <Cpu className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">3</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
              <p className="text-muted-foreground">Receive personalized recommendations and detailed reports about your mental well-being.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Monitoring Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Advanced Monitoring Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Professional-grade sensors and AI-powered analysis for comprehensive mental health tracking.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:scale-105 transition-transform">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Heart Rate Monitoring</h3>
              <p className="text-sm text-muted-foreground">Continuous tracking with intelligent alerts.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform">
               <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">ECG Analysis</h3>
              <p className="text-sm text-muted-foreground">Professional-grade electrocardiogram readings.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform">
               <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Stress Detection</h3>
              <p className="text-sm text-muted-foreground">Advanced GSR sensors for stress level monitoring.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Privacy First</h3>
              <p className="text-sm text-muted-foreground">Your health data is encrypted and secure.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Take Control of Your Mental Health?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Start your journey to better mental well-being with our advanced monitoring technology.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold">
            <Link href="/dashboard" onClick={handleDashboardRedirect}>Start Monitoring Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
