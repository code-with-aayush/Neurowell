
'use server'

import { generateHealthReport } from '@/ai/flows/generate-health-report'
import { redirect } from 'next/navigation'

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export async function createReport(
  currentState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
  try {
    const heartRateData = JSON.parse(formData.get('heartRate') as string);
    const spo2Data = JSON.parse(formData.get('spo2') as string);
    const ecgData = JSON.parse(formData.get('ecg') as string);
    const gsrData = JSON.parse(formData.get('gsr') as string);
    
    if (heartRateData.length === 0) {
      return {
        success: false,
        message: 'Monitoring data is empty. Please start monitoring before generating a report.',
      };
    }
    
    const heartRate = average(heartRateData.map((d: any) => d.value));
    const spo2 = average(spo2Data.map((d: any) => d.value));
    const ecg = average(ecgData.map((d: any) => d.value));
    const gsr = average(gsrData.map((d: any) => d.value));

    const userProfile = "A 35-year-old individual interested in monitoring their general wellness and stress levels. No known chronic conditions, but experiences occasional anxiety.";
  
    const report = await generateHealthReport({
      heartRate,
      spo2,
      ecg,
      gsr,
      userProfile,
    });
  
    const summary = encodeURIComponent(report.summary);
    const suggestions = encodeURIComponent(JSON.stringify(report.recommendations));
    
    const redirectUrl = `/report?summary=${summary}&suggestions=${suggestions}&avgHr=${heartRate.toFixed(0)}&avgStress=${gsr.toFixed(1)}`;
    
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
