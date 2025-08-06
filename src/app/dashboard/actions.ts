
'use server'

import { generateHealthReport } from '@/ai/flows/generate-health-report'

export async function createReport(
  currentState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
  try {
    const heartRate = parseFloat(formData.get('heartRate') as string);
    const spo2 = parseFloat(formData.get('spo2') as string);
    const ecg = parseFloat(formData.get('ecg') as string);
    const gsr = parseFloat(formData.get('gsr') as string);
    
    if (!heartRate || !spo2 || !ecg || !gsr) {
      return {
        success: false,
        message: 'No monitoring data available to generate a report.',
      };
    }

    const userProfile = "A 35-year-old individual interested in monitoring their general wellness and stress levels. No known chronic conditions, but experiences occasional anxiety.";
  
    const report = await generateHealthReport({
      heartRate,
      spo2,
      ecg,
      gsr,
      userProfile,
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
