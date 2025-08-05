
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
    const heartRateData = JSON.parse(formData.get('heartRate') as string);
    const spo2Data = JSON.parse(formData.get('spo2') as string);
    const ecgData = JSON.parse(formData.get('ecg') as string);
    const gsrData = JSON.parse(formData.get('gsr') as string);
    
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
    
    redirect(`/report?summary=${summary}&suggestions=${suggestions}&avgHr=${heartRate.toFixed(0)}&avgStress=${gsr.toFixed(1)}`);

  } catch (error) {
    console.error("Report Generation Error:", error);
    return {
      message: 'Failed to generate report. The AI model may be overloaded. Please try again in a few moments.',
    };
  }
}
