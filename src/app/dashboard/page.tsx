'use client';

import { useState } from 'react';
import { generatePersonalizedItinerary } from '@/ai/flows/generate-personalized-itinerary';
import ItineraryForm from '@/components/itinerary-form';
import ItineraryDisplay from '@/components/itinerary/itinerary-display';
import { useToast } from '@/hooks/use-toast';
import type { Itinerary } from '@/lib/types';
import { ItinerarySchema } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleItineraryGeneration = async (data: {
    destination: string;
    duration: number;
    budget: string;
    themes: string[];
  }) => {
    setLoading(true);
    setItinerary(null);
    try {
      const result = await generatePersonalizedItinerary(data);
      // The AI might return a string that needs parsing.
      const aiResponseData = JSON.parse(result.itinerary);
      
      // Combine form data with AI response for robustness
      const combinedData = {
        destination: data.destination,
        duration: data.duration,
        budget: data.budget,
        ...aiResponseData,
      };

      const parsedItinerary = ItinerarySchema.parse(combinedData);
      setItinerary(parsedItinerary);
    } catch (error) {
      console.error('Failed to generate or parse itinerary:', error);
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'We couldn\'t generate your itinerary. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ItineraryForm
            onSubmit={handleItineraryGeneration}
            isGenerating={loading}
          />
        </div>
        <div className="lg:col-span-8">
          {loading && (
            <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">
                Crafting your perfect trip...
              </p>
            </div>
          )}
          {itinerary && (
            <ItineraryDisplay 
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
                <h2 className="text-2xl font-bold tracking-tight">Let's Plan Your Adventure</h2>
                <p className="mt-2 text-muted-foreground">Fill out the form to generate your personalized travel itinerary.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
