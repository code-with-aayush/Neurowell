
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
      Create Account
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
        <div className="w-full max-w-md mx-auto">
             <div className="flex justify-center mb-8">
                <Image 
                    src="/auth_page.png"
                    alt="Illustration of a professional helping a patient"
                    width={200}
                    height={200}
                    className="rounded-full"
                    data-ai-hint="professional therapy wellness"
                    priority
                />
            </div>
            <Card className="w-full shadow-2xl bg-card border-none rounded-2xl">
                <CardHeader className="text-center space-y-3">
                <CardTitle className="text-4xl font-bold tracking-tight text-foreground">Create Your Account</CardTitle>
                <CardDescription className="text-muted-foreground text-base">Join NeuroWell to enhance your clinical practice.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 py-6">
                <form className="space-y-6" action={formAction}>
                    <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="dr.jane@example.com" required className="bg-background rounded-full h-12 px-5 text-base"/>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required className="bg-background rounded-full h-12 px-5 text-base" placeholder="Must be at least 6 characters"/>
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
        </div>
    </div>
  );
}

    