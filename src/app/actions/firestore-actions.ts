
'use server'

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase';
import type { Itinerary } from '@/lib/types';
import { ItinerarySchema } from '@/lib/types';
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

// This file is now simplified. The saveBooking logic is now in the /api/bookings POST route.
// Keeping this file in case other server actions are needed later, but its direct cause of error is removed.
