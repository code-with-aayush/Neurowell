'use server'

import { generateHealthReport } from '@/ai/flows/generate-health-report'
import { redirect } from 'next/navigation'

export async function createReport(
  currentState: any,
  formData: FormData
) {
  try {
    const heartRateData = JSON.parse(formData.get('heartRateData') as string);
    const spo2Data = JSON.parse(formData.get('spo2Data') as string);
    const ecgData = JSON.parse(formData.get('ecgData') as string);
    const gsrData = JSON.parse(formData.get('gsrData') as string);

    if (!heartRateData || !spo2Data || !ecgData || !gsrData) {
      throw new Error("Missing sensor data.");
    }
  
    const userProfile = "A 35-year-old individual interested in monitoring their general wellness and stress levels. No known chronic conditions, but experiences occasional anxiety.";
  
    const report = await generateHealthReport({
      heartRateData,
      spo2Data,
      ecgData,
      gsrData,
      userProfile,
    });
  
    const summary = encodeURIComponent(report.summary);
    const suggestions = encodeURIComponent(report.suggestions);
    
    redirect(`/report?summary=${summary}&suggestions=${suggestions}`);

  } catch (error) {
    console.error("Report Generation Error:", error);
    return {
      message: 'Failed to generate report. The AI model may be overloaded. Please try again in a few moments.',
    };
  }
}
