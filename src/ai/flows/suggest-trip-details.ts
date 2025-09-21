'use server';
/**
 * @fileOverview An AI-powered assistant to help users plan trips within India
 * by intelligently filling in missing details.
 *
 * - suggestTripDetails - A function that suggests trip details based on partial user input.
 * - SuggestTripDetailsInput - The input type for the suggestTripDetails function.
 * - SuggestTripDetailsOutput - The return type for the suggestTripDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTripDetailsInputSchema = z.object({
  destination: z.string().optional().describe('The destination for the trip.'),
  duration: z.coerce.number().optional().describe('The duration of the trip in days.'),
  budget: z.string().optional().describe('The budget for the trip.'),
  theme: z.string().optional().describe('The travel themes.'),
});

export type SuggestTripDetailsInput = z.infer<typeof SuggestTripDetailsInputSchema>;

const SuggestTripDetailsOutputSchema = z.object({
  destination: z.string().describe('The suggested destination in India.'),
  budget: z.string().describe('The suggested budget in INR.'),
  duration: z.coerce.number().describe('The suggested duration in days as a number.'),
  theme: z.string().describe('The suggested theme.'),
});

export type SuggestTripDetailsOutput = z.infer<typeof SuggestTripDetailsOutputSchema>;

export async function suggestTripDetails(
  input: SuggestTripDetailsInput
): Promise<SuggestTripDetailsOutput> {
  return suggestTripDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTripDetailsPrompt',
  input: {schema: SuggestTripDetailsInputSchema},
  output: {schema: SuggestTripDetailsOutputSchema},
  prompt: `You are an AI-powered travel assistant for TripWise.
Your job is to intelligently fill in missing trip details for users planning trips within India.

Inputs provided:
- Destination: {{{destination}}}
- Budget: {{{budget}}}
- Duration: {{{duration}}}
- Theme: {{{theme}}}

Rules:
1. If **destination** is missing → suggest one in India based on budget, duration, and theme.
2. If **budget** is missing → suggest a realistic budget in INR based on destination, duration, and theme.
3. If **duration** is missing → suggest an optimal trip duration in days (as a number) based on destination, budget, and theme.
4. If **theme** is missing → suggest a theme that best fits the destination, budget, and duration.
   Example: Goa + 3 days + ₹20,000 → “Nightlife & Beaches.”
5. If **all fields are missing** → suggest a complete recommended trip (destination, budget, duration, theme) within India.
6. If **all fields are filled** → generate an alternative surprise suggestion with slightly different values (e.g., another destination in the same budget range or a different theme).
7. Always return results in **India only**.
8. Always return output in valid JSON format. The duration must be a number, not a string.
`,
});

const suggestTripDetailsFlow = ai.defineFlow(
  {
    name: 'suggestTripDetailsFlow',
    inputSchema: SuggestTripDetailsInputSchema,
    outputSchema: SuggestTripDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Fallback to a default suggestion if AI fails.
    if (!output) {
      return {
        destination: input.destination || 'Goa, India',
        budget: input.budget || '50000',
        duration: input.duration || 7,
        theme: input.theme || 'Beaches and Nightlife',
      };
    }
    return output;
  }
);
