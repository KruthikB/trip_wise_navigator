
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/page-header';
import { Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookings } from '@/hooks/use-bookings';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { bookings, deleteBooking, loading: bookingsLoading } = useBookings();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router, isClient]);

  if (!isClient || authLoading || !user || bookingsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-12">
          <h1 className="mb-8 text-3xl font-bold tracking-tight">My Bookings</h1>
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <CardTitle className="text-xl">{booking.destination}</CardTitle>
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBooking(booking.id)}
                        aria-label="Delete booking"
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Booked On: {format(new Date(booking.bookingDate), 'PPP')}
                    </p>
                    <p>
                      Status:{' '}
                      <span className="font-semibold text-green-600">
                        {booking.status}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">You have no bookings yet. Go plan a trip!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
