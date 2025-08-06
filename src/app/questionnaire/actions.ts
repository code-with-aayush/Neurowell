
'use server'

import { generateHealthReport } from '@/ai/flows/generate-health-report'
import { redirect } from 'next/navigation';

export async function createReportWithQuestions(
  currentState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
  try {
    const heartRate = parseFloat(formData.get('heartRate') as string);
    const spo2 = parseFloat(formData.get('spo2') as string);
    const ecg = parseFloat(formData.get('ecg') as string);
    const gsr = parseFloat(formData.get('gsr') as string);
    
    const answers = {
        q1: parseInt(formData.get('q1') as string, 10),
        q2: parseInt(formData.get('q2') as string, 10),
        q3: parseInt(formData.get('q3') as string, 10),
        q4: parseInt(formData.get('q4') as string, 10),
        q5: parseInt(formData.get('q5') as string, 10),
        q6: parseInt(formData.get('q6') as string, 10),
    }

    if (!heartRate || !spo2 || !ecg || !gsr || Object.values(answers).some(v => isNaN(v))) {
      return {
        success: false,
        message: 'Missing required fields to generate a report.',
      };
    }
  
    const report = await generateHealthReport({
      heartRate,
      spo2,
      ecg,
      gsr,
      ...answers
    });
  
    const params = new URLSearchParams();
    params.set('wellnessScore', report.wellnessScore.toString());
    params.set('wellnessStatus', report.wellnessStatus);
    params.set('physiologicalSummary', report.physiologicalSummary);
    params.set('mentalHealthSummary', report.mentalHealthSummary);
    
    // Encode complex objects to Base64 to safely pass them in the URL
    params.set('recommendations', Buffer.from(JSON.stringify(report.recommendations)).toString('base64'));
    params.set('vitals', Buffer.from(JSON.stringify(report.vitals)).toString('base64'));

    const redirectUrl = `/report?${params.toString()}`;
    
    return {
        success: true,
        message: 'Report generated successfully.',
        redirectUrl: redirectUrl
    };

  } catch (error: any) {
    console.error("Report Generation Error:", error);
    let errorMessage = 'Failed to generate report. Please try again in a few moments.';
    if (error.message && error.message.includes('overloaded')) {
        errorMessage = 'The AI model is currently overloaded. Please try again later.';
    } else if (error.message) {
        errorMessage = `An unexpected error occurred: ${error.message}`;
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}
