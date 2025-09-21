
'use client'

import type { Itinerary } from '@/lib/types';
import { Button } from '../ui/button';
import { Share2, FileDown, Briefcase, CloudDrizzle, Sun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import ItineraryDayView from './itinerary-day-view';
import MapView from './map-view';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useState, useRef, useEffect } from 'react';
import { exportToPdf } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { adjustItineraryBasedOnWeather } from '@/ai/flows/adjust-itinerary-based-on-weather';
import { ItinerarySchema } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { translateText } from '@/ai/flows/translate-text';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useBookings } from '@/hooks/use-bookings';

type ItineraryDisplayProps = {
  itinerary: Itinerary;
  setItinerary: React.Dispatch<React.SetStateAction<Itinerary | null>>;
};

export default function ItineraryDisplay({ itinerary: itineraryProp, setItinerary }: ItineraryDisplayProps) {
  const itineraryContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [openDays, setOpenDays] = useState<string[]>(['day-1']);
  const { t } = useTranslation();
  const { addBooking } = useBookings();
  
  const [translatedItinerary, setTranslatedItinerary] = useState<Itinerary>(itineraryProp);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateItineraryContent = async () => {
      if (language === 'en') {
        setTranslatedItinerary(itineraryProp);
        return;
      }
      if (!itineraryProp) return;

      setIsTranslating(true);
      try {
        const textsToTranslate: string[] = [itineraryProp.destination];
        itineraryProp.itinerary.forEach(day => {
          textsToTranslate.push(day.title);
          day.activities.forEach(activity => {
            textsToTranslate.push(activity.placeName);
            textsToTranslate.push(activity.description);
          });
        });

        const { translatedTexts } = await translateText({ textsToTranslate, targetLanguage: language });

        if (translatedTexts.length !== textsToTranslate.length) {
            throw new Error("Translation returned incorrect number of items.");
        }

        let counter = 0;
        const newDestination = translatedTexts[counter++];

        const newItineraryDays = itineraryProp.itinerary.map(day => {
            const newTitle = translatedTexts[counter++];
            const newActivities = day.activities.map(activity => {
                const newPlaceName = translatedTexts[counter++];
                const newDescription = translatedTexts[counter++];
                return {
                    ...activity,
                    placeName: newPlaceName,
                    description: newDescription,
                };
            });
            return {
                ...day,
                title: newTitle,
                activities: newActivities,
            };
        });

        setTranslatedItinerary({
          ...itineraryProp,
          destination: newDestination,
          itinerary: newItineraryDays,
        });

      } catch (error) {
        console.error("Failed to translate itinerary", error);
        toast({ variant: 'destructive', title: t('translationFailedTitle'), description: t('translationFailedDescription') });
        setTranslatedItinerary(itineraryProp); // Revert to original if translation fails
      } finally {
        setIsTranslating(false);
      }
    };

    translateItineraryContent();
  }, [language, itineraryProp, toast, t]);


  const handleExport = () => {
    if (itineraryContentRef.current) {
      // Expand all accordion items before exporting
      const allDayKeys = translatedItinerary.itinerary.map(day => `day-${day.day}`);
      setOpenDays(allDayKeys);

      // Allow time for the UI to update before exporting
      setTimeout(() => {
        exportToPdf(itineraryContentRef.current!, `TripWise-Itinerary-${translatedItinerary.destination}`);
      }, 500); // 500ms delay to ensure content is expanded
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('linkCopiedTitle'),
      description: t('linkCopiedDescription'),
    });
  };

  const handleBooking = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: t('authRequiredTitle'),
            description: t('authRequiredDescription'),
        });
        return;
    }
    
    // Use the original, untranslated itinerary for booking
    addBooking(itineraryProp);
    
    toast({
        title: t('bookingConfirmedTitle'),
        description: t('bookingConfirmedDescription', { destination: translatedItinerary.destination }),
    });
  };

  const handleWeatherAdjust = async (weather: 'rainy' | 'sunny') => {
    toast({ title: t('adjustingItineraryTitle', { weather }) });
    try {
        // Always use the original prop for adjustments
        const currentItineraryString = JSON.stringify(itineraryProp.itinerary);
        const result = await adjustItineraryBasedOnWeather({ itinerary: currentItineraryString, weatherCondition: weather });
        const newItineraryActivities = JSON.parse(result.adjustedItinerary);
        
        const updatedItineraryDays = itineraryProp.itinerary.map((day, index) => ({
            ...day,
            activities: newItineraryActivities[index]?.activities ?? day.activities,
        }));

        const updatedItinerary = {
            ...itineraryProp,
            itinerary: updatedItineraryDays
        };
        
        const parsedItinerary = ItinerarySchema.parse(updatedItinerary);
        
        // Update the parent component state. This will trigger a re-render and translation.
        setItinerary(parsedItinerary);

        toast({ title: t('itineraryUpdatedTitle'), description: t('itineraryUpdatedDescription') });

    } catch (error) {
        console.error("Failed to adjust itinerary", error);
        toast({ variant: 'destructive', title: t('updateFailedTitle'), description: t('updateFailedDescription') });
    }
  }
  
  if (isTranslating) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          {t('translatingItinerary')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">{t('yourTripTo', { destination: translatedItinerary.destination })}</h3>
            <p className="text-sm text-muted-foreground">{t('tripDetails', { duration: translatedItinerary.duration, budget: translatedItinerary.budget })}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{t('adjustForWeather')}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{t('selectWeather')}</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => handleWeatherAdjust('rainy')}><CloudDrizzle className='mr-2 h-4 w-4'/>{t('rainy')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleWeatherAdjust('sunny')}><Sun className='mr-2 h-4 w-4'/>{t('sunny')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={handleExport}><FileDown className="h-4 w-4" /></Button>
            <Button onClick={handleBooking}><Briefcase className="mr-2 h-4 w-4" /> {t('bookNow')}</Button>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <Tabs defaultValue="itinerary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="itinerary">{t('itineraryDetails')}</TabsTrigger>
              <TabsTrigger value="map">{t('mapView')}</TabsTrigger>
            </TabsList>
            <TabsContent value="itinerary">
              <div ref={itineraryContentRef} className="mt-4">
                <Accordion 
                  type="multiple" 
                  value={openDays}
                  onValueChange={setOpenDays}
                  className="w-full"
                >
                  {translatedItinerary.itinerary.map((day) => (
                    <ItineraryDayView key={day.day} day={day} />
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            <TabsContent value="map">
              <div className="mt-4 h-[500px] w-full rounded-md overflow-hidden">
                <MapView itinerary={translatedItinerary} />
              </div>
            </TabsContent>
          </Tabs>
        </APIProvider>
      </div>
    </div>
  );
}
