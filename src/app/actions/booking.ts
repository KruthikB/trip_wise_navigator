'use server';

import type { Itinerary } from '@/lib/types';
import { saveBooking } from './firestore-actions';
import { auth } from 'firebase-admin';

export async function mockBookItinerary(itinerary: Itinerary) {
  try {
    // In a real app, you would get the current user's ID from the session
    // For this mock, we'll assume a user is logged in.
    // The server action needs a way to get the current user.
    // This part of the code is illustrative and may need a proper auth setup.
    // const user = auth().currentUser; // This is client-side, won't work here.
    // A proper implementation would pass the user's auth token and verify it.
    // For now, we'll proceed without a specific user ID for the mock.
    
    await saveBooking(itinerary);

    return {
      success: true,
      message: `Your trip to ${itinerary.destination} is confirmed. Happy travels!`,
    };
  } catch (error) {
    console.error('Booking failed:', error);
    return {
      success: false,
      message: 'There was an error processing your booking. Please try again.',
    };
  }
}
