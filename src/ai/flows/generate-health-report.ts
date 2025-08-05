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

const GenerateHealthReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the overall health score and key indicators.'),
  recommendations: z.array(RecommendationSchema).describe('A list of personalized health recommendations.'),
});
export type GenerateHealthReportOutput = z.infer<typeof GenerateHealthReportOutputSchema>;

export async function generateHealthReport(input: GenerateHealthReportInput): Promise<GenerateHealthReportOutput> {
  return generateHealthReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthReportPrompt',
  input: {schema: GenerateHealthReportInputSchema},
  output: {schema: GenerateHealthReportOutputSchema},
  prompt: `You are a health and wellness expert. Analyze the provided health data and generate a summary, an overall health score, and a list of personalized recommendations. The recommendations should have a title, description, and priority (HIGH, MEDIUM, LOW).

  User Profile: {{{userProfile}}}
  Average Heart Rate: {{{heartRate}}} BPM
  Average SpO2: {{{spo2}}}%
  Average ECG Signal: {{{ecg}}} mV
  Average Stress Level (GSR): {{{gsr}}} μS

  Generate a concise summary about the user's overall health score and what it means.
  Then, provide four distinct personalized recommendations based on the data. Ensure each recommendation includes a title, a brief description, and a priority level.`,
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
