
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface DeletePayload {
    patientId: string;
    clinicianId: string;
}

export async function deletePatientAction(payload: DeletePayload): Promise<{ success: boolean, error: string | null }> {
    try {
        const { patientId, clinicianId } = payload;
        
        if (!patientId || !clinicianId) {
            return { success: false, error: "Missing patient or clinician ID." };
        }

        const patientRef = doc(db, 'patients', patientId);
        const patientDoc = await getDocs(query(collection(db, 'patients'), where('__name__', '==', patientId), where('clinicianId', '==', clinicianId)));
        
        if(patientDoc.empty){
            return { success: false, error: 'Unauthorized or patient not found.' };
        }

        const batch = writeBatch(db);

        // Delete all reports in the subcollection
        const reportsQuery = query(collection(db, `patients/${patientId}/reports`));
        const reportsSnapshot = await getDocs(reportsQuery);
        reportsSnapshot.forEach(reportDoc => {
            batch.delete(reportDoc.ref);
        });

        // Delete the patient document
        batch.delete(patientRef);

        await batch.commit();

        revalidatePath('/patients');
        return { success: true, error: null };
    } catch (error) {
        console.error("Error deleting patient:", error);
        return { success: false, error: "An unexpected error occurred while deleting the patient." };
    }
}
