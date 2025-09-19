import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { ItineraryDay } from '@/lib/types';
import ItineraryItemCard from './itinerary-item-card';
import { CalendarDays } from 'lucide-react';

type ItineraryDayViewProps = {
  day: ItineraryDay;
};

export default function ItineraryDayView({ day }: ItineraryDayViewProps) {
  return (
    <AccordionItem value={`day-${day.day}`}>
      <AccordionTrigger>
        <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
                <h4 className="font-semibold text-left">Day {day.day}: {day.title}</h4>
                <p className="text-sm text-muted-foreground font-normal">{day.activities.length} activities planned</p>
            </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pl-4 border-l-2 border-primary/20 ml-5">
            {day.activities.map((activity, index) => (
                <ItineraryItemCard key={index} activity={activity} />
            ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
