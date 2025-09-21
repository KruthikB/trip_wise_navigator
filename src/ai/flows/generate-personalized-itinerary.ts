
'use server';
/**
 * @fileOverview AI-powered personalized trip itinerary generator for domestic travel in India.
 *
 * - generatePersonalizedItinerary - A function that takes destination, trip duration, budget, and themes to generate a personalized itinerary within India.
 * - GeneratePersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - GeneratePersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {
  GeneratePersonalizedItineraryInputSchema,
  type GeneratePersonalizedItineraryInput,
  GeneratePersonalizedItineraryOutputSchema,
  type GeneratePersonalizedItineraryOutput,
} from '@/lib/types';

export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedItineraryPrompt',
  input: {schema: GeneratePersonalizedItineraryInputSchema},
  output: {schema: GeneratePersonalizedItineraryOutputSchema},
  prompt: `You are an expert travel planner specializing in domestic travel within India. Generate a personalized trip itinerary in JSON format based on the following information:

Destination: {{{destination}}}, India
Duration: {{{duration}}} days
Budget: {{{budget}}} (Please assume this is in INR)
Themes: {{#each themes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

The response must be a valid JSON object matching the output schema.
The top-level JSON object must include:
- "destination": a string matching the user's input.
- "duration": a number matching the user's input.
- "budget": a string matching the user's input.
- "itinerary": an array of day objects.

Each day object in the "itinerary" array must include:
- "day": a number (e.g., 1, 2).
- "title": a string for the day's theme (e.g., "Cultural Exploration").
- "activities": an array of activity objects.

Each activity object in the "activities" array must include:
- "placeName": a string for the name of the place or activity.
- "description": a string describing the activity.
- "travelTime": an optional string for estimated travel time.
- "cost": an optional string for the estimated cost in INR.

Do not omit any of the required fields. All locations and activities must be within India. Do not include any explanations or conversational text. Only provide the raw JSON. If a theme is not feasible, choose a reasonable alternative suitable for the Indian destination.`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        // If the AI fails but doesn't throw, return an empty but valid structure.
        return {
          destination: input.destination,
          duration: input.duration,
          budget: input.budget,
          itinerary: [],
        };
      }
      return output;
    } catch (error) {
      console.error('Error in generatePersonalizedItineraryFlow:', error);
      // On error (e.g., rate limit), also return an empty structure.
      return {
        destination: input.destination,
        duration: input.duration,
        budget: input.budget,
        itinerary: [],
      };
    }
  }
);
