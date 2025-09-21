
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LandingHeader from '@/components/landing-header';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
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

  if (!isClient || authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Placeholder bookings data
  const bookings = [
    { id: 1, destination: 'Goa, India', date: '2024-09-15', status: 'Confirmed' },
    { id: 2, destination: 'Jaipur, India', date: '2024-11-20', status: 'Confirmed' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 pt-20">
        <div className="container mx-auto max-w-4xl py-12">
          <h1 className="mb-8 text-3xl font-bold tracking-tight">My Bookings</h1>
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{booking.destination}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Travel Date: {booking.date}
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
              <p>You have no bookings yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
