import { z } from 'zod';

export const ItineraryActivitySchema = z.object({
  placeName: z.string().describe('Name of the place or activity.'),
  description: z.string().describe('A brief description of the place or activity.'),
  travelTime: z.string().optional().describe('Estimated travel time to this place.'),
  cost: z.string().optional().describe('Estimated cost for this activity.'),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional().describe('Latitude and longitude.'),
});

export const ItineraryDaySchema = z.object({
  day: z.number().describe('The day number of the itinerary (e.g., 1, 2).'),
  title: z.string().describe('A catchy title for the day\'s plan.'),
  activities: z.array(ItineraryActivitySchema).describe('A list of activities for the day.'),
});

export const ItinerarySchema = z.object({
  destination: z.string().describe('The main destination of the trip.'),
  startDate: z.string().describe('The start date of the trip in YYYY-MM-DD format.'),
  duration: z.number().describe('Total duration of the trip in days.'),
  budget: z.string().describe('The provided budget for the trip.'),
  numberOfTravellers: z.number().describe('The number of people travelling.'),
  itinerary: z.array(ItineraryDaySchema).describe('The day-by-day itinerary.'),
});

export const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the trip within India.'),
  startDate: z.string().describe('The start date of the trip in YYYY-MM-DD format.'),
  duration: z.number().describe('The duration of the trip in days.'),
  budget: z.string().describe('The budget for the trip in INR (e.g., "₹50,000").'),
  themes: z.array(z.string()).describe('The travel themes (e.g., ["heritage", "nightlife", "adventure"]).'),
  numberOfTravellers: z.number().describe('The number of people travelling.'),
});
export type GeneratePersonalizedItineraryInput = z.infer<typeof GeneratePersonalizedItineraryInputSchema>;

export const GeneratePersonalizedItineraryOutputSchema = ItinerarySchema;
export type GeneratePersonalizedItineraryOutput = z.infer<typeof GeneratePersonalizedItineraryOutputSchema>;


export type Itinerary = z.infer<typeof ItinerarySchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type ItineraryActivity = z.infer<typeof ItineraryActivitySchema>;
