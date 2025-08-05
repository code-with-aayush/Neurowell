
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
) {
  try {
    // Hardcoded data provided by the user
    const heartRate = 74;
    const spo2 = 95;
    const ecg = 1.44;
    const gsr = 2.02;

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
    
    redirect(`/report?summary=${summary}&suggestions=${suggestions}&avgHr=${heartRate.toFixed(0)}&avgStress=${gsr.toFixed(1)}`);

  } catch (error) {
    console.error("Report Generation Error:", error);
    return {
      message: 'Failed to generate report. The AI model may be overloaded. Please try again in a few moments.',
    };
  }
}
