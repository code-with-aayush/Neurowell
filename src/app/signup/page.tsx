
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full transition-transform hover:scale-105">
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
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center bg-gradient-to-br from-background to-secondary px-4 py-12 sm:px-6 lg:px-8">
       <Card className="w-full max-w-md shadow-2xl transition-all hover:shadow-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create an Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join NeuroWell to start your wellness journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" action={formAction}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="transition-all focus:ring-2 focus:ring-primary/50"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required className="transition-all focus:ring-2 focus:ring-primary/50"/>
            </div>
            {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
           <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80">
                Login
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
