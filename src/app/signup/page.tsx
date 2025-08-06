
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { signUpAction } from './actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full text-base py-6 rounded-full transition-transform hover:scale-105">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Get Started
    </Button>
  );
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUpAction, { success: false, error: null });
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push('/login');
    }
  }, [state, router]);

  return (
    <div className="flex-grow flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">
            <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-sm border-none rounded-2xl md:order-2">
                <CardHeader className="text-center space-y-3">
                <CardTitle className="text-4xl font-bold tracking-tight text-foreground">Sign Up</CardTitle>
                <CardDescription className="text-muted-foreground text-base">Create your account to begin your journey</CardDescription>
                </CardHeader>
                <CardContent className="px-8 py-6">
                <form className="space-y-6" action={formAction}>
                    <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="jane@example.com" required className="bg-white/70 rounded-full h-12 px-5 text-base"/>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required className="bg-white/70 rounded-full h-12 px-5 text-base"/>
                    </div>
                    {state?.error && <p className="text-sm font-medium text-destructive text-center">{state.error}</p>}
                     <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:text-primary/90 transition-colors">
                        Log in
                    </Link>
                    </p>
                </CardFooter>
            </Card>
            <div className="hidden md:flex justify-center md:order-1">
                <Image 
                    src="https://placehold.co/400x500.png"
                    alt="Illustration of a person in a calm state"
                    width={400}
                    height={500}
                    className="rounded-2xl"
                    data-ai-hint="woman thinking wellness"
                    priority
                />
            </div>
      </div>
    </div>
  );
}
