
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, BarChart, FileText, Cpu, ArrowRight } from 'lucide-react';
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

  const handleGetStartedRedirect = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (user) {
      router.push('/patients');
    } else {
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
              Advance Your Practice with <br />
              <span className="text-primary">Objective Patient Insights</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              NeuroWell is a clinical-grade monitoring platform that empowers therapists, psychiatrists, and wellness professionals with real-time biometric data and AI-driven reports to enhance patient care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold">
                <Link href="/patients" onClick={handleGetStartedRedirect}>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/neurowell_home.png"
              alt="A clinician reviewing patient data on a tablet."
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">A Seamless Workflow for Clinicians</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Integrate objective data into your practice with a simple, three-step process designed for clinical efficiency.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <div className="flex items-center justify-between mb-4">
                <BarChart className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">1</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitor Patient Vitals</h3>
              <p className="text-muted-foreground">The patient uses the NeuroWell device to capture key biometrics like heart rate, GSR, and ECG during their daily life.</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-background">
               <div className="flex items-center justify-between mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">2</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contextualize with Questionnaires</h3>
              <p className="text-muted-foreground">Patients complete brief, guided questionnaires to provide lifestyle context to their biometric data.</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-background">
               <div className="flex items-center justify-between mb-4">
                <Cpu className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">3</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Access AI-Generated Reports</h3>
              <p className="text-muted-foreground">Receive comprehensive, AI-powered reports that correlate data, identify trends, and provide actionable insights for treatment.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Clinical Excellence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Our platform provides the tools you need to deliver data-informed care.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-card">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <BarChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Longitudinal Tracking</h3>
              <p className="text-sm text-muted-foreground">Monitor patient progress and treatment efficacy over time.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-card">
               <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Objective Data</h3>
              <p className="text-sm text-muted-foreground">Supplement subjective reports with verifiable biometric signals.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-card">
               <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">AI-Powered Summaries</h3>
              <p className="text-sm text-muted-foreground">Save time with reports that highlight key trends and insights.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-card">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure & Compliant</h3>
              <p className="text-sm text-muted-foreground">Patient data is encrypted, secure, and handled with care.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Elevate Your Patient Care Today</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join the growing community of clinicians using NeuroWell to provide deeper, more effective mental healthcare.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold">
            <Link href="/patients" onClick={handleGetStartedRedirect}>Start Monitoring Patients <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

    