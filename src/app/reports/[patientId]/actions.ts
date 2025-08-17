
'use server';

import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface DeleteReportPayload {
    patientId: string;
    reportId: string;
}

export async function deleteReportAction(payload: DeleteReportPayload): Promise<{ success: boolean, error: string | null }> {
    try {
        const { patientId, reportId } = payload;
        
        if (!patientId || !reportId) {
            return { success: false, error: "Missing patient or report ID." };
        }

        // Note: For a production app, you'd want to verify that the currently
        // logged-in user (clinician) has permission to delete this report.
        // For this demo, we'll proceed directly.

        const reportRef = doc(db, `patients/${patientId}/reports`, reportId);
        await deleteDoc(reportRef);

        revalidatePath(`/reports/${patientId}`);
        return { success: true, error: null };

    } catch (error) {
        console.error("Error deleting report:", error);
        return { success: false, error: "An unexpected error occurred while deleting the report." };
    }
}
