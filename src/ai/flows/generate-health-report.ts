
'use server';

/**
 * @fileOverview A health report generation AI agent.
 *
 * - generateHealthReport - A function that handles the generation of a health report.
 * - GenerateHealthReportInput - The input type for the generateHealthReport function.
 * - GenerateHealthReportOutput - The return type for the generateHealthReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHealthReportInputSchema = z.object({
  heartRate: z.number().describe('Average heart rate value.'),
  spo2: z.number().describe('Average SpO2 (blood oxygen saturation) value.'),
  ecg: z.number().describe('Average ECG (electrocardiogram) value.'),
  gsr: z.number().describe('Average GSR (galvanic skin response) value, representing stress.'),
  userProfile: z.string().describe('Summary of the user profile including age, gender and known conditions.'),
});
export type GenerateHealthReportInput = z.infer<typeof GenerateHealthReportInputSchema>;

const RecommendationSchema = z.object({
  title: z.string().describe('The title of the recommendation.'),
  description: z.string().describe('A detailed description of the recommendation.'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('The priority of the recommendation.'),
});

const VitalSignAnalysisSchema = z.object({
    value: z.string().describe("The formatted value of the vital sign, including units (e.g., '80 BPM')."),
    status: z.string().describe("The status of the vital sign (e.g., 'Normal', 'Elevated', 'Low')."),
    interpretation: z.string().describe("A brief, one-sentence interpretation of the reading.")
});

const GenerateHealthReportOutputSchema = z.object({
  wellnessScore: z.number().describe("An overall wellness score from 0 to 100."),
  summary: z.string().describe('A summary of the overall health score and key indicators.'),
  recommendations: z.array(RecommendationSchema).describe('A list of personalized health recommendations.'),
  vitals: z.object({
    heartRate: VitalSignAnalysisSchema,
    spo2: VitalSignAnalysisSchema,
    ecg: VitalSignAnalysisSchema,
    stress: VitalSignAnalysisSchema,
  }).describe("A detailed breakdown and interpretation for each key vital sign.")
});
export type GenerateHealthReportOutput = z.infer<typeof GenerateHealthReportOutputSchema>;

export async function generateHealthReport(input: GenerateHealthReportInput): Promise<GenerateHealthReportOutput> {
  return generateHealthReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthReportPrompt',
  input: {schema: GenerateHealthReportInputSchema},
  output: {schema: GenerateHealthReportOutputSchema},
  prompt: `You are a health and wellness expert. Analyze the provided health data and generate a comprehensive wellness report.

  User Profile: {{{userProfile}}}
  Average Heart Rate: {{{heartRate}}} BPM
  Average SpO2: {{{spo2}}}%
  Average ECG Signal: {{{ecg}}} mV
  Average Stress Level (GSR): {{{gsr}}} μS

  Your response must be in the specified JSON format.

  1.  **Wellness Score**: Calculate an overall wellness score from 0-100 based on the provided data. A higher score indicates better health. Consider all vitals. For example, a heart rate of 75, SpO2 of 98%, ECG of 1.1mV and GSR of 4uS would be a high score. Deviations from normal ranges should lower the score.
  2.  **Vitals Analysis**: For each of the four vitals (Heart Rate, SpO2, ECG, Stress), provide:
      - A value string with the number and its unit.
      - A status (e.g., "Normal", "Elevated", "Slightly Low", "High"). Normal ranges are: HR 60-100, SpO2 >95%, ECG ~1.0-1.5mV, GSR < 10uS.
      - A concise, one-sentence interpretation of the reading.
  3.  **Summary**: Generate a concise summary (2-3 sentences) about the user's overall wellness based on the score and key indicators.
  4.  **Recommendations**: Provide four distinct, personalized recommendations. Each must include a title, a brief description, and a priority level (HIGH, MEDIUM, LOW).`,
});

const generateHealthReportFlow = ai.defineFlow(
  {
    name: 'generateHealthReportFlow',
    inputSchema: GenerateHealthReportInputSchema,
    outputSchema: GenerateHealthReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
