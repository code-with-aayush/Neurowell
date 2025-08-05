'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

async function signUpAction(prevState: any, formData: FormData) {
  "use server";
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Signing Up...' : 'Sign Up'}
    </Button>
  );
}


export default function SignUpPage() {
  const [state, formAction] = useFormState(signUpAction, null);

  useEffect(() => {
    if (state?.success) {
      window.location.href = '/dashboard';
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" action={formAction}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required className="mt-1" autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required className="mt-1" autoComplete="new-password" />
            </div>
            <SubmitButton />
            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
