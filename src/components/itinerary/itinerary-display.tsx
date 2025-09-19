

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

type ItineraryDisplayProps = {
  itinerary: Itinerary;
  setItinerary: React.Dispatch<React.SetStateAction<Itinerary | null>>;
};

export default function ItineraryDisplay({ itinerary: originalItinerary, setItinerary }: ItineraryDisplayProps) {
  const itineraryContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [openDays, setOpenDays] = useState<string[]>(['day-1']);

  const [itinerary, setTranslatedItinerary] = useState<Itinerary>(originalItinerary);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateItineraryContent = async () => {
      if (language === 'en') {
        setTranslatedItinerary(originalItinerary);
        return;
      }

      setIsTranslating(true);
      try {
        const translatableContent = {
          destination: originalItinerary.destination,
          itinerary: originalItinerary.itinerary.map(day => ({
            title: day.title,
            activities: day.activities.map(activity => ({
              placeName: activity.placeName,
              description: activity.description,
            })),
          })),
        };

        const result = await translateText({
          content: JSON.stringify(translatableContent),
          targetLanguage: language,
        });

        const translatedContent = JSON.parse(result.translatedContent);

        const newItinerary: Itinerary = {
          ...originalItinerary,
          destination: translatedContent.destination,
          itinerary: originalItinerary.itinerary.map((day, dayIndex) => ({
            ...day,
            title: translatedContent.itinerary[dayIndex].title,
            activities: day.activities.map((activity, activityIndex) => ({
              ...activity,
              placeName: translatedContent.itinerary[dayIndex].activities[activityIndex].placeName,
              description: translatedContent.itinerary[dayIndex].activities[activityIndex].description,
            })),
          })),
        };
        setTranslatedItinerary(newItinerary);

      } catch (error) {
        console.error("Failed to translate itinerary", error);
        toast({ variant: 'destructive', title: 'Translation Failed', description: 'Could not translate the itinerary.' });
        setTranslatedItinerary(originalItinerary); // Revert to original if translation fails
      } finally {
        setIsTranslating(false);
      }
    };

    translateItineraryContent();
  }, [language, originalItinerary, toast]);


  const handleExport = () => {
    if (itineraryContentRef.current) {
      // Expand all accordion items before exporting
      const allDayKeys = itinerary.itinerary.map(day => `day-${day.day}`);
      setOpenDays(allDayKeys);

      // Allow time for the UI to update before exporting
      setTimeout(() => {
        exportToPdf(itineraryContentRef.current!, `TripWise-Itinerary-${itinerary.destination}`);
      }, 500); // 500ms delay to ensure content is expanded
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied!',
      description: 'Itinerary link has been copied to your clipboard.',
    });
  };

  const handleBooking = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'You must be logged in to book a trip.',
        });
        return;
    }
    // In a real app, you'd call the booking API here.
    // For this demo, we'll just show a success message.
    toast({
        title: 'Booking Confirmed!',
        description: `Your trip to ${itinerary.destination} is confirmed. Happy travels!`,
    });
  };

  const handleWeatherAdjust = async (weather: 'rainy' | 'sunny') => {
    toast({ title: 'Adjusting itinerary for ' + weather + ' weather...' });
    try {
        const currentItineraryString = JSON.stringify(itinerary.itinerary);
        const result = await adjustItineraryBasedOnWeather({ itinerary: currentItineraryString, weatherCondition: weather });
        const newItineraryActivities = JSON.parse(result.adjustedItinerary);
        
        // A simple way to merge, assuming the structure is preserved
        const updatedItineraryDays = itinerary.itinerary.map((day, index) => ({
            ...day,
            activities: newItineraryActivities[index]?.activities ?? day.activities,
        }));

        const updatedItinerary = {
            ...itinerary,
            itinerary: updatedItineraryDays
        };
        
        // Validate the new structure
        const parsedItinerary = ItinerarySchema.parse(updatedItinerary);

        setItinerary(parsedItinerary);
        toast({ title: 'Itinerary Updated!', description: 'Your plan has been adjusted for the weather.' });

    } catch (error) {
        console.error("Failed to adjust itinerary", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not adjust the itinerary.' });
    }
  }
  
  if (isTranslating) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Translating your itinerary...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Your Trip to {itinerary.destination}</h3>
            <p className="text-sm text-muted-foreground">{itinerary.duration} days, est. budget {itinerary.budget}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Adjust for Weather</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Weather</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => handleWeatherAdjust('rainy')}><CloudDrizzle className='mr-2 h-4 w-4'/>Rainy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleWeatherAdjust('sunny')}><Sun className='mr-2 h-4 w-4'/>Sunny</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={handleExport}><FileDown className="h-4 w-4" /></Button>
            <Button onClick={handleBooking}><Briefcase className="mr-2 h-4 w-4" /> Book Now</Button>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <Tabs defaultValue="itinerary">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="itinerary">Itinerary Details</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            <TabsContent value="itinerary">
              <div ref={itineraryContentRef} className="mt-4">
                <Accordion 
                  type="multiple" 
                  value={openDays}
                  onValueChange={setOpenDays}
                  className="w-full"
                >
                  {itinerary.itinerary.map((day) => (
                    <ItineraryDayView key={day.day} day={day} />
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            <TabsContent value="map">
              <div className="mt-4 h-[500px] w-full rounded-md overflow-hidden">
                <MapView itinerary={itinerary} />
              </div>
            </TabsContent>
          </Tabs>
        </APIProvider>
      </div>
    </div>
  );
}
