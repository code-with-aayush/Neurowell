
"use client";

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';

async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    let message = 'An unknown error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/user-not-found':
                message = 'No account found with this email. Please sign up.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            default:
                message = 'Failed to login. Please try again later.';
        }
    }
    return { message };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full text-base py-6 rounded-full transition-transform hover:scale-105">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sign In
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsClient(true);
    if (state?.success) {
      router.push('/patients');
    }
  }, [state, router]);

  const authImageSrc = isClient && theme === 'dark' ? '/dark_auth_page.png' : '/auth_page.png';

  return (
    <div className="flex-grow flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-8">
            {isClient ? (
              <Image 
                  src={authImageSrc}
                  alt="Illustration of a professional helping a patient"
                  width={200}
                  height={200}
                  className="rounded-full"
                  priority
              />
            ) : (
                <div className="w-[200px] h-[200px] bg-muted rounded-full animate-pulse"></div>
            )}
        </div>
        <Card className="w-full shadow-2xl bg-card border-none rounded-2xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-4xl font-bold tracking-tight text-foreground">Clinician Portal</CardTitle>
            <CardDescription className="text-muted-foreground text-base">Sign in to access your patient dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input id="email" name="email" type="email" placeholder="dr.jane@example.com" required className="bg-background rounded-full h-12 px-5 text-base"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required className="bg-background rounded-full h-12 px-5 text-base"/>
              </div>
              {state?.message && <p className="text-sm font-medium text-destructive text-center">{state.message}</p>}
              <div className="pt-4">
                <SubmitButton />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
             <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-primary hover:text-primary/90 transition-colors">
                  Sign up
                </Link>
              </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
