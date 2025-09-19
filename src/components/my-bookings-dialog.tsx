
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getBookings } from '@/app/actions/firestore-actions';
import type { Booking } from '@/lib/types';
import { Loader2, Inbox } from 'lucide-react';
import ItineraryDayView from './itinerary/itinerary-day-view';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from './ui/scroll-area';

type MyBookingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MyBookingsDialog({ open, onOpenChange }: MyBookingsDialogProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchBookings() {
      if (open && user) {
        setLoading(true);
        try {
          const idToken = await user.getIdToken();
          
          // Temporarily override fetch to add the auth header
          const originalFetch = global.fetch;
          (global as any).fetch = async (url: any, options: any) => {
            const headers = new Headers(options?.headers);
            headers.set('Authorization', `Bearer ${idToken}`);
            const newOptions = { ...options, headers };
            return originalFetch(url, newOptions);
          };

          try {
            const result = await getBookings();
            setBookings(result);
          } finally {
             // Restore original fetch
            (global as any).fetch = originalFetch;
          }

        } catch (error) {
          console.error("Failed to fetch bookings:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchBookings();
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>My Bookings</DialogTitle>
          <DialogDescription>
            Here are all the trips you've booked with TripWise.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <Inbox className="h-10 w-10 mb-2" />
                    <p className="font-semibold">No Bookings Found</p>
                    <p className="text-sm">You haven't booked any trips yet.</p>
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                {bookings.map((booking) => (
                    <AccordionItem key={booking.id} value={booking.id}>
                        <AccordionTrigger>
                            <div>
                                <h4 className="font-semibold text-left">Trip to {booking.destination}</h4>
                                <p className="text-sm text-muted-foreground font-normal">
                                    Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <Accordion type="single" collapsible className="w-full">
                                {booking.itinerary.map((day) => (
                                    <ItineraryDayView key={day.day} day={day} />
                                ))}
                            </Accordion>
                        </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
