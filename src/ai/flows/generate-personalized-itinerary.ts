'use server';
/**
 * @fileOverview AI-powered personalized trip itinerary generator.
 *
 * - generatePersonalizedItinerary - A function that takes destination, trip duration, budget, and themes to generate a personalized itinerary.
 * - GeneratePersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - GeneratePersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the trip.'),
  duration: z.number().describe('The duration of the trip in days.'),
  budget: z.string().describe('The budget for the trip (e.g., "$1000", "5000 INR").'),
  themes: z.array(z.string()).describe('The travel themes (e.g., ["heritage", "nightlife", "adventure"]).'),
});
export type GeneratePersonalizedItineraryInput = z.infer<typeof GeneratePersonalizedItineraryInputSchema>;

const GeneratePersonalizedItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated trip itinerary in JSON format.'),
});
export type GeneratePersonalizedItineraryOutput = z.infer<typeof GeneratePersonalizedItineraryOutputSchema>;

export async function generatePersonalizedItinerary(
  input: GeneratePersonalizedItineraryInput
): Promise<GeneratePersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedItineraryPrompt',
  input: {schema: GeneratePersonalizedItineraryInputSchema},
  output: {schema: GeneratePersonalizedItineraryOutputSchema},
  prompt: `You are an expert travel planner. Generate a personalized trip itinerary in JSON format based on the following information:

Destination: {{{destination}}}
Duration: {{{duration}}} days
Budget: {{{budget}}}
Themes: {{#each themes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Ensure the itinerary includes place name, description, travel time, and cost breakdown for each day. The top-level JSON response must include a "destination" (string), "duration" (number), "budget" (string), and an "itinerary" (array of day objects). Return a valid JSON object. Do not include any explanations or conversational text. Only provide the JSON. If any theme is impossible given the destination or budget, make a reasonable alternative. Do not return an empty JSON object.`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
