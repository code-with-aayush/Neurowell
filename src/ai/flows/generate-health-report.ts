
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
  icon: z.enum(['sleep', 'mindfulness', 'activity', 'caffeine']).describe('The most relevant icon for the recommendation.'),
});

const VitalSignAnalysisSchema = z.object({
    value: z.string().describe("The formatted value of the vital sign, including units (e.g., '70 BPM')."),
    status: z.string().describe("The status of the vital sign (e.g., 'Normal', 'Elevated', 'Low')."),
});

const MentalHealthInsightSchema = z.object({
  fatigueProbability: z.enum(['Low', 'Moderate', 'High']).describe("The user's probability of fatigue."),
  mindfulnessScore: z.enum(['Low', 'Moderate', 'High']).describe("The user's mindfulness score based on their focus and relaxation answers."),
  riskOfBurnout: z.enum(['Low', 'Moderate', 'High']).describe("The user's risk of burnout based on feeling overwhelmed and lacking relaxation."),
});


const GenerateHealthReportOutputSchema = z.object({
  wellnessScore: z.number().min(0).max(100).describe("An overall wellness score from 0 to 100. A lower score indicates a higher risk profile. Calculated by weighing sensor data against questionnaire answers."),
  wellnessStatus: z.enum(['Good', 'Moderate', 'Needs Attention']).describe("A single-word status for the wellness score."),
  physiologicalSummary: z.string().describe("A one-sentence summary of the user's physiological state based on the sensor data only. Example: 'Your key physiological signs are within normal ranges.'"),
  mentalHealthSummary: z.string().describe("A one-sentence summary of the user's mental/lifestyle state based on the questionnaire. Example: 'However, your lifestyle habits indicate a high risk of burnout.'"),
  recommendations: z.array(RecommendationSchema).min(4).max(4).describe('A list of exactly 4 personalized health recommendations based on all available data. The first recommendation should always be the single most important "Mental Boost Tip".'),
  vitals: z.object({
    heartRate: VitalSignAnalysisSchema,
    spo2: VitalSignAnalysisSchema,
    ecg: VitalSignAnalysisSchema,
    stress: VitalSignAnalysisSchema,
  }).describe("A detailed breakdown for each key vital sign.")
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
  Your analysis must distinguish between objective physical data (sensors) and subjective behavioral data (questionnaire). A user can have normal vitals but be at high risk due to poor lifestyle habits. Your language must reflect this nuance. Avoid definitive statements like "You are stressed." Instead, use phrases like "Your habits suggest a risk of..." or "Your body's signals are calm, but..." Your tone should be supportive and educational.

  ## Reference Data for Analysis:

  **Sensor Data Interpretation Logic:**
  - **Heart Rate (BPM):** Normal resting: 60-100.
  - **SpO2 (%):** Normal: >95%.
  - **GSR (Galvanic Skin Response, μS):** Measures emotional arousal. Normal resting: 1-10 μS. Elevated values (10-20 μS) suggest heightened arousal, which can be linked to stress. High values (>20 μS) indicate a strong stress response.
  - **ECG (mV):** Normal: ~1.0-1.5mV.

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
  2.  **Wellness Status**: Based on the score, determine a status: >80 is 'Good', 50-80 is 'Moderate', <50 is 'Needs Attention'.
  3.  **Physiological Summary**: Write a one-sentence summary about the sensor data only.
  4.  **Mental Health Summary**: Write a one-sentence summary about the lifestyle/questionnaire data.
  5.  **Vitals Analysis**: For each of the four vitals, provide:
      - A 'value' string with the number and its unit.
      - A 'status' string (e.g., "Normal", "Elevated", "Slightly Low", "High").
      - **For the 'stress' vital specifically:** Determine its status by combining the GSR value with the answers for "feeling overwhelmed" (q3) and "time to relax" (q6). If GSR is elevated and q3/q6 scores are high (2 or 3), the status should be "High" or "Elevated". If GSR is normal but q3/q6 scores are high, the status could be "Moderate" reflecting mental stress not yet fully manifesting physically.
  6.  **Recommendations**: Provide exactly four distinct, personalized recommendations. Each must include a title, a short description (max 15 words), and a relevant icon ('sleep', 'mindfulness', 'activity', 'caffeine'). These recommendations MUST be based on the combined analysis, targeting the highest-risk areas identified. The first recommendation in the array should be the most impactful and serve as the "Mental Boost Tip".`,
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
