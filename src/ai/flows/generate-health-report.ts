
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
  q1: z.number().describe('Score (0-3) for "tired or lacking energy"'),
  q2: z.number().describe('Score for "quality sleep" (0=6-8hrs, 1=>8hrs, 2=4-6hrs, 3=<4hrs)'),
  q3: z.number().describe('Score (0-3) for "feeling overwhelmed"'),
  q4: z.number().describe('Score (0-3) for "consumed caffeine more than usual"'),
  q5: z.number().describe('Score (0-3) for "mentally present and focused"'),
  q6: z.number().describe('Score (0-3) for "had time to relax"'),
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
    interpretation: z.string().describe("A brief, one-sentence interpretation of the reading. IMPORTANT: This should be a factual statement about the sensor data itself, not a diagnosis. E.g., 'Your heart rate was in the normal resting range.'")
});

const GenerateHealthReportOutputSchema = z.object({
  wellnessScore: z.number().describe("An overall wellness score from 0 to 100, calculated by weighing sensor data against questionnaire answers. A lower score indicates a higher risk profile."),
  summary: z.string().describe("A nuanced summary of the user's wellness state. It MUST distinguish between physical signs (sensors) and behavioral patterns (questionnaire). For example: 'Physically, your vital signs appear calm. However, your reported sleep patterns and feelings of anxiety indicate a potential risk for stress buildup.' Avoid definitive diagnoses like 'You are stressed.'"),
  recommendations: z.array(RecommendationSchema).describe('A list of personalized health recommendations based on all available data.'),
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
  prompt: `You are a mental health and wellness expert. Your task is to analyze biometric sensor data alongside answers from a lifestyle questionnaire to generate a comprehensive wellness report. Your primary goal is to identify potential risk factors and offer preventative advice, NOT to diagnose a current emotional state.

  ## Core Principle:
  Your analysis must distinguish between objective physical data (sensors) and subjective behavioral data (questionnaire). A user can have normal vitals but be at high risk due to poor lifestyle habits. Your language must reflect this nuance. Avoid definitive statements like "You are stressed." Instead, use phrases like "Your habits suggest a risk of..." or "Your body's signals are calm, but..."

  ## Reference Data for Analysis:

  **Sensor Data Interpretation Logic:**
  - **Heart Rate (BPM):** Normal resting: 60-100. Elevated HR can be a sign of physical or mental arousal.
  - **SpO2 (%):** Normal: >95%. Relevant for context, especially if combined with panic symptoms.
  - **GSR (Galvanic Skin Response, μS):** Measures emotional arousal. Spikes can indicate a stress response.
  - **ECG (mV):** Provides context on cardiac electrical activity. Normal: ~1.0-1.5mV.

  **Wellness States Logic (Risk Profiles):**
  - **Healthy State:** Normal, stable vitals and low scores on the questionnaire.
  - **At Risk / Needs Attention:** Vitals may be normal, but questionnaire answers indicate risk factors (e.g., poor sleep, high caffeine). This is a key state to identify.
  - **Immediate Concern:** Vitals are abnormal (e.g., high HR, high GSR) AND questionnaire scores are high.

  ## User's Data to Analyze:

  **Sensor Readings:**
  - Average Heart Rate: {{{heartRate}}} BPM
  - Average SpO2: {{{spo2}}}%
  - Average ECG Signal: {{{ecg}}} mV
  - Average Stress Level (GSR): {{{gsr}}} μS

  **Questionnaire Scores:**
  - Lacking energy (0-3): {{{q1}}}
  - Quality sleep (0=6-8hrs, 1=>8hrs, 2=4-6hrs, 3=<4hrs): {{{q2}}}
  - Feeling overwhelmed (0-3): {{{q3}}}
  - High caffeine use (0-3): {{{q4}}}
  - Lacking focus (0-3): {{{q5}}}
  - No time to relax (0-3): {{{q6}}}

  ## Your Task: Generate the Report in JSON Format

  1.  **Wellness Score**: Calculate an overall wellness score from 0-100. A lower score means a higher risk profile. The score should heavily factor in the questionnaire. Normal vitals with high-risk answers should result in a score around 50-65.
  2.  **Vitals Analysis**: For each of the four vitals, provide:
      - A 'value' string with the number and its unit.
      - A 'status' (e.g., "Normal", "Elevated", "Slightly Low", "High").
      - A concise, one-sentence 'interpretation'. This MUST be a factual statement about the data, not a conclusion about the user's feelings. (e.g., "Your heart rate was within the normal resting range.").
  3.  **Summary**: Generate a nuanced summary (2-3 sentences). It MUST start by addressing the physical data, then connect it to the behavioral data from the questionnaire to describe the overall wellness/risk status. For example: "Physically, your vital signs appear calm and stable during the reading. However, your self-reported feelings of anxiety and difficulty sleeping are important patterns to be aware of, as they can contribute to stress over time."
  4.  **Recommendations**: Provide four distinct, personalized recommendations. These recommendations MUST be based on the combined analysis, targeting the highest-risk areas identified (e.g., if sleep score is high, recommend a sleep-related action). Each must include a title, description, and priority.`,
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
