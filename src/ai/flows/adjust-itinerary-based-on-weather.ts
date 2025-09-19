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
  itinerary: z.string().describe('The current itinerary as a string.'),
  weatherCondition: z.string().describe('The current weather condition (e.g., rainy, sunny).'),
});

export type AdjustItineraryBasedOnWeatherInput = z.infer<
  typeof AdjustItineraryBasedOnWeatherInputSchema
>;

const AdjustItineraryBasedOnWeatherOutputSchema = z.object({
  adjustedItinerary: z.string().describe('The adjusted itinerary based on the weather.'),
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

Current Itinerary: {{{itinerary}}}
Weather Condition: {{{weatherCondition}}}

Adjusted Itinerary:`,
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
