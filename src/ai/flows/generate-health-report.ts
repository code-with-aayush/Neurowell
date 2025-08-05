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
  heartRateData: z.array(z.number()).describe('Array of heart rate values.'),
  spo2Data: z.array(z.number()).describe('Array of SpO2 (blood oxygen saturation) values.'),
  ecgData: z.array(z.number()).describe('Array of ECG (electrocardiogram) values.'),
  gsrData: z.array(z.number()).describe('Array of GSR (galvanic skin response) values.'),
  userProfile: z.string().describe('Summary of the user profile including age, gender and known conditions.'),
});
export type GenerateHealthReportInput = z.infer<typeof GenerateHealthReportInputSchema>;

const GenerateHealthReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the health data.'),
  suggestions: z.string().describe('Personalized suggestions based on the health data.'),
});
export type GenerateHealthReportOutput = z.infer<typeof GenerateHealthReportOutputSchema>;

export async function generateHealthReport(input: GenerateHealthReportInput): Promise<GenerateHealthReportOutput> {
  return generateHealthReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthReportPrompt',
  input: {schema: GenerateHealthReportInputSchema},
  output: {schema: GenerateHealthReportOutputSchema},
  prompt: `You are a health and wellness expert. Analyze the provided health data and generate a summary and personalized suggestions.

  User Profile: {{{userProfile}}}
  Heart Rate Data: {{{heartRateData}}}
  SpO2 Data: {{{spo2Data}}}
  ECG Data: {{{ecgData}}}
  GSR Data: {{{gsrData}}}

  Summary:
  Suggestions: `,
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
