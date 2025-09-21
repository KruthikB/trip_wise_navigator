import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ItineraryActivity } from '@/lib/types';
import { Clock, IndianRupee, MapPin } from 'lucide-react';

type ItineraryItemCardProps = {
  activity: ItineraryActivity;
};

export default function ItineraryItemCard({ activity }: ItineraryItemCardProps) {
  return (
    <div className="relative">
      <div className="absolute -left-[29px] top-1 h-6 w-6 rounded-full bg-primary ring-4 ring-background" />
      <Card className="ml-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary"/>{activity.placeName}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {activity.travelTime && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {activity.travelTime}</span>}
            {activity.cost && <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4"/> {activity.cost}</span>}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{activity.description}</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
