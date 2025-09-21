
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
    duration: number;
    budget: string;
    themes: string[];
    numberOfTravellers: number;
  }) => {
    setLoading(true);
    setItinerary(null);
    try {
      const result = await generatePersonalizedItinerary(data);
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
      <main className="flex-1">
        <section className="bg-[#0070F3] py-20 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        <section className="-mt-16">
          <div className="container mx-auto max-w-4xl">
             <ItineraryForm
                onSubmit={handleItineraryGeneration}
                isGenerating={loading}
              />
          </div>
        </section>

        <section className="py-16">
            <div className="container mx-auto max-w-7xl">
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
                <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50">
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
        </section>
      </main>
    </div>
  );
}
