
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
  heartRate: z.number().describe('Average heart rate value (BPM).'),
  spo2: z.number().describe('Average SpO2 (blood oxygen saturation) value (%).'),
  ecg: z.number().describe('Average ECG (electrocardiogram) value (mV).'),
  gsr: z.number().describe('Average GSR (galvanic skin response) value (μS), representing stress.'),
  q1: z.number().describe('Score (0-3) for "nervous, anxious, or on edge"'),
  q2: z.number().describe('Score (0-3) for "trouble relaxing"'),
  q3: z.number().describe('Score (0-3) for "sad or hopeless"'),
  q4: z.number().describe('Score (0-3) for "lost interest or pleasure"'),
  q5: z.number().describe('Score (0-3) for "difficulty concentrating"'),
  q6: z.number().describe('Score (0-3) for "sudden panic or dread"'),
  q7: z.number().describe('Score (0-3) for "tired or no energy"'),
  q8: z.number().describe('Score (0-3) for "feeling worthless or guilty"'),
  q9: z.number().describe('Score (0-3) for "irritable or easily annoyed"'),
  q10: z.number().describe('Score (0-3) for "trouble sleeping"'),
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
    interpretation: z.string().describe("A brief, one-sentence interpretation of the reading, considering both sensor data and the user's psychological state.")
});

const GenerateHealthReportOutputSchema = z.object({
  wellnessScore: z.number().describe("An overall wellness score from 0 to 100, calculated by weighing sensor data against questionnaire answers."),
  summary: z.string().describe("A summary of the user's likely mental state (e.g., Calm, Stressed/Anxious, Depressed/Fatigued) and key indicators, synthesized from both sensor data and questionnaire answers."),
  recommendations: z.array(RecommendationSchema).describe('A list of personalized health recommendations based on all available data.'),
  vitals: z.object({
    heartRate: VitalSignAnalysisSchema,
    spo2: VitalSignAnalysisSchema,
    ecg: VitalSignAnalysisSchema,
    stress: VitalSignAnalysisSchema,
  }).describe("A detailed breakdown and interpretation for each key vital sign, contextualized with the user's psychological state.")
});
export type GenerateHealthReportOutput = z.infer<typeof GenerateHealthReportOutputSchema>;

export async function generateHealthReport(input: GenerateHealthReportInput): Promise<GenerateHealthReportOutput> {
  return generateHealthReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHealthReportPrompt',
  input: {schema: GenerateHealthReportInputSchema},
  output: {schema: GenerateHealthReportOutputSchema},
  prompt: `You are a mental health and wellness expert. Your task is to analyze biometric sensor data alongside answers from a psychological screening questionnaire (inspired by GAD-7 & PHQ-9) to generate a comprehensive wellness report.

  ## Reference Data for Analysis:
  
  **Sensor Data Interpretation Logic:**
  - **Heart Rate (BPM):** Normal resting: 60-100. Consistently elevated HR can indicate stress/anxiety. Low HR with low variability might suggest fatigue or depression.
  - **SpO2 (%):** Normal: >95%. Significant drops combined with high HR can be related to panic or respiratory distress.
  - **GSR (Galvanic Skin Response, μS):** Normal resting: < 10. Measures emotional arousal. Spikes indicate stress or anxiety triggers.
  - **ECG (mV):** Normal: ~1.0-1.5mV. Provides context on cardiac electrical activity.

  **Psychological States Logic:**
  - **Calm:** Normal HR, stable GSR, good SpO2, and low scores on questionnaire (mostly 0s and 1s).
  - **Stressed/Anxious:** Elevated HR, high GSR, and high scores on questions about nervousness, relaxation, panic, and irritability (q1, q2, q6, q9).
  - **Depressed/Fatigued:** Low or normal HR, low energy, and high scores on questions about sadness, loss of interest, concentration, worthlessness, and sleep (q3, q4, q5, q7, q8, q10).

  ## User's Data to Analyze:

  **Sensor Readings:**
  - Average Heart Rate: {{{heartRate}}} BPM
  - Average SpO2: {{{spo2}}}%
  - Average ECG Signal: {{{ecg}}} mV
  - Average Stress Level (GSR): {{{gsr}}} μS

  **Questionnaire Scores (0=Not at all, 3=Nearly every day):**
  - Nervous/Anxious: {{{q1}}}
  - Trouble Relaxing: {{{q2}}}
  - Sad/Hopeless: {{{q3}}}
  - Lost Interest: {{{q4}}}
  - Trouble Concentrating: {{{q5}}}
  - Panic/Dread: {{{q6}}}
  - Tired/No Energy: {{{q7}}}
  - Feeling Worthless: {{{q8}}}
  - Irritable: {{{q9}}}
  - Trouble Sleeping: {{{q10}}}

  ## Your Task: Generate the Report in JSON Format

  1.  **Wellness Score**: Calculate an overall wellness score from 0-100. This score MUST be a weighted combination of sensor data and questionnaire answers. A person with perfect sensor data but high anxiety scores should have a significantly lower score than someone with perfect data and low scores.
  2.  **Vitals Analysis**: For each of the four vitals, provide:
      - A 'value' string with the number and its unit.
      - A 'status' (e.g., "Normal", "Elevated", "Slightly Low", "High").
      - A concise, one-sentence 'interpretation'. CRITICAL: This interpretation must be contextualized by the questionnaire answers. For example, if GSR is high and the user reported high anxiety, state that the high stress reading aligns with their self-reported feelings of anxiety.
  3.  **Summary**: Generate a concise summary (2-3 sentences) identifying the user's most likely mental state (e.g., Calm, Stressed/Anxious, Depressed/Fatigued). This summary MUST synthesize key findings from both the physical sensors and the psychological feedback. For instance: "Your physical signs, such as an elevated heart rate, combined with your feelings of anxiety, suggest a state of high stress."
  4.  **Recommendations**: Provide four distinct, personalized recommendations. These recommendations MUST be based on the combined analysis. For example, if sleep score (q10) is high and stress (GSR) is high, suggest a relaxation technique before bed. Each recommendation must include a title, a brief description, and a priority level (HIGH, MEDIUM, LOW).`,
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
