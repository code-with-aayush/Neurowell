'use server';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function signUpAction(prevState: any, formData: FormData): Promise<{ success: boolean, error: string | null }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
    });
    return { success: true, error: null };
  } catch (error: any) {
    let message = 'An unknown error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already in use. Please login.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
            default:
                message = 'Failed to sign up. Please try again later.';
        }
    }
    return { success: false, error: message };
  }
}
