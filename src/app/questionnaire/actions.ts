
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
  
    const wellnessScore = report.wellnessScore;
    const summary = encodeURIComponent(report.summary);
    const recommendations = encodeURIComponent(JSON.stringify(report.recommendations));
    const vitals = encodeURIComponent(JSON.stringify(report.vitals));
    
    const redirectUrl = `/report?wellnessScore=${wellnessScore}&summary=${summary}&recommendations=${recommendations}&vitals=${vitals}`;
    
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
