
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Itinerary } from '@/lib/types';
import { useAuth } from './use-auth';

export interface Booking extends Itinerary {
  id: string;
  bookingDate: string;
  status: 'Confirmed';
}

const getBookingsFromStorage = (userId: string): Booking[] => {
  if (typeof window === 'undefined') return [];
  const storedBookings = localStorage.getItem(`bookings_${userId}`);
  return storedBookings ? JSON.parse(storedBookings) : [];
};

const saveBookingsToStorage = (userId: string, bookings: Booking[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`bookings_${userId}`, JSON.stringify(bookings));
};

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setBookings(getBookingsFromStorage(user.uid));
    }
    setLoading(false);
  }, [user]);

  const addBooking = useCallback((itinerary: Itinerary) => {
    if (!user) return;

    const newBooking: Booking = {
      ...itinerary,
      id: `${itinerary.destination}-${new Date().getTime()}`,
      bookingDate: new Date().toISOString(),
      status: 'Confirmed',
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    saveBookingsToStorage(user.uid, updatedBookings);
  }, [user, bookings]);

  const deleteBooking = useCallback((bookingId: string) => {
    if (!user) return;
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    setBookings(updatedBookings);
    saveBookingsToStorage(user.uid, updatedBookings);
  }, [user, bookings]);


  return { bookings, addBooking, deleteBooking, loading };
};
