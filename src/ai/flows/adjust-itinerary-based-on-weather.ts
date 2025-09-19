'use server';

/**
 * @fileOverview Adjusts the itinerary based on real-time weather conditions.
 *
 * - adjustItineraryBasedOnWeather - A function that adjusts the itinerary based on weather.
 * - AdjustItineraryBasedOnWeatherInput - The input type for the adjustItineraryBasedOnWeather function.
 * - AdjustItineraryBasedOnWeatherOutput - The return type for the adjustItineraryBasedOnWeather function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustItineraryBasedOnWeatherInputSchema = z.object({
  itinerary: z.string().describe('The current itinerary as a JSON string.'),
  weatherCondition: z.string().describe('The current weather condition (e.g., rainy, sunny).'),
});

export type AdjustItineraryBasedOnWeatherInput = z.infer<
  typeof AdjustItineraryBasedOnWeatherInputSchema
>;

const AdjustItineraryBasedOnWeatherOutputSchema = z.object({
  adjustedItinerary: z.string().describe('The adjusted itinerary based on the weather, in JSON format.'),
});

export type AdjustItineraryBasedOnWeatherOutput = z.infer<
  typeof AdjustItineraryBasedOnWeatherOutputSchema
>;

export async function adjustItineraryBasedOnWeather(
  input: AdjustItineraryBasedOnWeatherInput
): Promise<AdjustItineraryBasedOnWeatherOutput> {
  return adjustItineraryBasedOnWeatherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustItineraryBasedOnWeatherPrompt',
  input: {schema: AdjustItineraryBasedOnWeatherInputSchema},
  output: {schema: AdjustItineraryBasedOnWeatherOutputSchema},
  prompt: `Given the current itinerary and weather condition, adjust the itinerary to suggest indoor activities if it is raining, and outdoor activities if it is sunny.

You must return the full itinerary object as a valid JSON string, including all original fields (day, title, activities, placeName, description, etc.). Do not omit any fields. Only change the activities that need to be adjusted for the weather.

Current Itinerary (JSON): {{{itinerary}}}
Weather Condition: {{{weatherCondition}}}

Return only the adjusted itinerary as a single, complete JSON string.`,
});

const adjustItineraryBasedOnWeatherFlow = ai.defineFlow(
  {
    name: 'adjustItineraryBasedOnWeatherFlow',
    inputSchema: AdjustItineraryBasedOnWeatherInputSchema,
    outputSchema: AdjustItineraryBasedOnWeatherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {adjustedItinerary: output!.adjustedItinerary};
  }
);
