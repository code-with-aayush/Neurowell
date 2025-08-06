
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
              A Clearer View of Your <br />
              <span className="text-primary">Wellness & Lifestyle</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              NeuroWell connects your daily habits with your mental state. Our monitor provides a holistic view of your well-being by combining biometric data with lifestyle insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold">
                <Link href="/dashboard" onClick={handleDashboardRedirect}>Start Monitoring <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/neurowell_home.png"
              alt="A person using the NeuroWell device to monitor their wellness."
              width={600}
              height={400}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            A simple, three-step process to connect your lifestyle to your well-being.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <Heart className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">1</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitor Your Vitals</h3>
              <p className="text-muted-foreground">Wear your comfortable device to track key biometric signals like heart rate and stress levels.</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
               <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">2</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Answer a Few Questions</h3>
              <p className="text-muted-foreground">Briefly tell us about your day—sleep, activities, and mood—to add context to your data.</p>
            </Card>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
               <div className="flex items-center justify-between mb-4">
                <Cpu className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">3</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Holistic Insights</h3>
              <p className="text-muted-foreground">Receive a personalized report that connects your lifestyle choices to your mental well-being.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Monitoring Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Understand the Full Picture</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            Our technology analyzes both your body's signals and your life's context.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-white">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Biometric Analysis</h3>
              <p className="text-sm text-muted-foreground">Continuous tracking of heart rate, SpO2, and stress.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-white">
               <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Lifestyle Context</h3>
              <p className="text-sm text-muted-foreground">Integrates your sleep, diet, and activity levels.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-white">
               <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">Identifies patterns and potential risk factors.</p>
            </Card>
            <Card className="p-6 text-center hover:scale-105 transition-transform bg-white">
              <div className="inline-block bg-primary/10 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Private and Secure</h3>
              <p className="text-sm text-muted-foreground">Your health data is encrypted and secure.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Understand Your Wellness?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Start your journey to better well-being by understanding the connection between your lifestyle and your mental state.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-semibold">
            <Link href="/dashboard" onClick={handleDashboardRedirect}>Start Monitoring Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
