
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase';
import { BookingSchema, ItinerarySchema } from '@/lib/types';
import type { Booking, Itinerary } from '@/lib/types';
import { revalidatePath } from 'next/cache';

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

export async function GET() {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
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

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = await getUserIdFromToken();
    if (!userId) {
        return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    try {
        const itineraryData = await req.json();
        const validatedItinerary = ItinerarySchema.parse(itineraryData);
        
        const bookingRef = adminDb.collection('bookings').doc();
        const newBooking = {
            id: bookingRef.id,
            userId: userId,
            ...validatedItinerary,
            bookingDate: new Date().toISOString(),
        };

        await bookingRef.set(newBooking);
        revalidatePath('/'); // Revalidate the landing page
        return NextResponse.json({ success: true, message: `Your trip to ${validatedItinerary.destination} is confirmed. Happy travels!` });

    } catch (error) {
        console.error('Error saving booking: ', error);
        return NextResponse.json({ success: false, message: 'Failed to save booking' }, { status: 500 });
    }
}
