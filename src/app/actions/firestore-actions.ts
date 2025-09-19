
'use server'

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase';
import type { Itinerary, Booking } from '@/lib/types';
import { ItinerarySchema, BookingSchema } from '@/lib/types';
import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase';

async function getUserIdFromToken() {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
        const idToken = authorization.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            return decodedToken.uid;
        } catch (error) {
            console.error('Error verifying auth token:', error);
            return null;
        }
    }
    return null;
}

export async function saveBooking(itineraryData: Itinerary): Promise<{ success: boolean, message: string }> {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return { success: false, message: "User not authenticated." };
    }

    try {
        const validatedItinerary = ItinerarySchema.parse(itineraryData);
        const bookingRef = adminDb.collection('bookings').doc();
        const newBooking = {
            id: bookingRef.id,
            userId: userId,
            ...validatedItinerary,
            bookingDate: new Date().toISOString(),
        };

        await bookingRef.set(newBooking);
        revalidatePath('/'); 
        return { success: true, message: 'Booking saved successfully' };
    } catch (error) {
        console.error('Error saving booking: ', error);
        return { success: false, message: 'Failed to save booking' };
    }
}

export async function getBookings(): Promise<Booking[]> {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return [];
    }

    try {
        const bookingsSnapshot = await adminDb.collection('bookings')
            .where('userId', '==', userId)
            .orderBy('bookingDate', 'desc')
            .get();
        
        const bookings: Booking[] = [];
        bookingsSnapshot.forEach(doc => {
            const data = doc.data();
            const parsedData = BookingSchema.safeParse(data);
            if (parsedData.success) {
                bookings.push(parsedData.data);
            } else {
                console.warn("Invalid booking data found in Firestore:", parsedData.error);
            }
        });

        return bookings;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}
