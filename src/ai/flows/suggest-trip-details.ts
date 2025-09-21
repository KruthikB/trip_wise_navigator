
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
  numberOfTravellers: z.coerce.number().optional().describe('The number of travellers.'),
});

export type SuggestTripDetailsInput = z.infer<typeof SuggestTripDetailsInputSchema>;

const SuggestTripDetailsOutputSchema = z.object({
  destination: z.string().describe('The suggested destination in India.'),
  budget: z.string().describe('The suggested budget in INR.'),
  duration: z.coerce.number().describe('The suggested duration in days as a number.'),
  theme: z.string().describe('The suggested theme.'),
  numberOfTravellers: z.coerce.number().describe('The suggested number of travellers.'),
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
- Number of Travellers: {{{numberOfTravellers}}}

Rules:
1. If **destination** is missing → suggest one in India based on other fields.
2. If **budget** is missing → suggest a realistic budget in INR based on other fields.
3. If **duration** is missing → suggest an optimal trip duration in days (as a number) based on other fields.
4. If **theme** is missing → suggest a theme that best fits the other fields.
5. If **numberOfTravellers** is missing -> suggest a common number, like 2 or 4.
6. If **all fields are missing** → suggest a complete recommended trip (destination, budget, duration, theme, numberOfTravellers) within India.
7. If **all fields are filled** → generate an alternative surprise suggestion with slightly different values.
8. Always return results in **India only**.
9. Always return output in valid JSON format. The duration and numberOfTravellers must be a number, not a string.
`,
});

const suggestTripDetailsFlow = ai.defineFlow(
  {
    name: 'suggestTripDetailsFlow',
    inputSchema: SuggestTripDetailsInputSchema,
    outputSchema: SuggestTripDetailsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      // Fallback to a default suggestion if AI fails without throwing.
      if (!output) {
        return {
          destination: input.destination || 'Goa, India',
          budget: input.budget || '50000',
          duration: input.duration || 7,
          theme: input.theme || 'Beaches and Nightlife',
          numberOfTravellers: input.numberOfTravellers || 2,
        };
      }
      return output;
    } catch (error) {
      console.error('Error in suggestTripDetailsFlow:', error);
      // On error, return the original inputs to avoid breaking the form.
      return {
        destination: input.destination || 'Goa, India',
        budget: input.budget || '50000',
        duration: input.duration || 7,
        theme: input.theme || 'Beaches and Nightlife',
        numberOfTravellers: input.numberOfTravellers || 2,
      };
    }
  }
);
