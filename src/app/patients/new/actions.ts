
'use server';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  patientId: z.string().min(4, { message: "A unique patient ID of at least 4 characters is required." }),
});

export async function addPatientAction(prevState: any, formData: FormData): Promise<{ success: boolean, error: string | null }> {
  const user = auth.currentUser;
  if (!user) {
      return { success: false, error: 'You must be logged in to add a patient.' };
  }

  const validatedFields = formSchema.safeParse({
    patientName: formData.get('patientName'),
    patientId: formData.get('patientId'),
  });

  if (!validatedFields.success) {
      return {
          success: false,
          error: validatedFields.error.flatten().fieldErrors.patientName?.[0] || validatedFields.error.flatten().fieldErrors.patientId?.[0] || 'Invalid data.',
      };
  }
  
  const { patientName, patientId } = validatedFields.data;

  try {
    // Check if a patient with this ID already exists for this clinician
    const q = query(
        collection(db, 'patients'), 
        where('patientId', '==', patientId),
        where('clinicianId', '==', user.uid)
    );
    const existingPatientSnapshot = await getDocs(q);
    if (!existingPatientSnapshot.empty) {
        return { success: false, error: 'A patient with this ID already exists.' };
    }

    // Add the new patient
    await addDoc(collection(db, 'patients'), {
      patientName,
      patientId,
      clinicianId: user.uid,
      createdAt: new Date(),
    });

    revalidatePath('/patients');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error adding patient: ', error);
    return { success: false, error: 'An unexpected error occurred while adding the patient.' };
  }
}
