
'use client';

import { useState, useEffect } from 'react';
import ItineraryDisplay from '@/components/itinerary/itinerary-display';
import { useToast } from '@/hooks/use-toast';
import type { Itinerary } from '@/lib/types';
import { ItinerarySchema } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';
import ItineraryForm from '@/components/itinerary-form';
import LandingHeader from '@/components/landing-header';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';
import { generatePersonalizedItinerary } from '@/ai/flows/generate-personalized-itinerary';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleItineraryGeneration = async (data: {
    destination: string;
    startDate: Date;
    duration: number;
    budget: string;
    themes: string[];
    numberOfTravellers: number;
  }) => {
    setLoading(true);
    setItinerary(null);
    try {
      const result = await generatePersonalizedItinerary({
        ...data,
        startDate: data.startDate.toISOString().split('T')[0],
      });
      const parsedItinerary = ItinerarySchema.parse(result);
      setItinerary(parsedItinerary);
    } catch (error) {
      console.error('Failed to generate or parse itinerary:', error);
      toast({
        variant: 'destructive',
        title: t('toastErrorTitle'),
        description: t('toastErrorDescription'),
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 bg-primary/10">
        <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
            <ItineraryForm
                onSubmit={handleItineraryGeneration}
                isGenerating={loading}
            />

            <div className="mt-16">
                {loading && (
                    <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('loadingCraftingTrip')}
                    </p>
                    </div>
                )}
                {itinerary && (
                    <ItineraryDisplay 
                    key={itinerary.destination + itinerary.duration}
                    itinerary={itinerary}
                    setItinerary={setItinerary}
                    />
                )}
                {!loading && !itinerary && (
                    <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-card">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">{t('itineraryAwaitsTitle')}</h2>
                        <p className="mt-2 text-muted-foreground">{t('itineraryAwaitsSubtitle')}</p>
                    </div>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
