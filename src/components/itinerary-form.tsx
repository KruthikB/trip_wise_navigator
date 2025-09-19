
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, WandSparkles, Briefcase, Plane, Hotel, Tag } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Link from 'next/link';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  duration: z.coerce.number().int().min(1, { message: 'Duration must be at least 1 day.' }),
  budget: z.string().min(1, { message: 'Please enter a budget.' }),
  themes: z.string().min(2, { message: 'Please enter at least one interest or theme.' }),
});

type ItineraryFormProps = {
  onSubmit: (data: z.infer<typeof formSchema> & { themes: string[] }) => void;
  isGenerating: boolean;
};

export default function ItineraryForm({ onSubmit, isGenerating }: ItineraryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: 'Goa, India',
      duration: 7,
      budget: '50000',
      themes: 'cultural heritage, adventure, nightlife, relaxing, museums',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      themes: values.themes.split(',').map(theme => theme.trim()).filter(Boolean),
    });
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <Tabs defaultValue="holidays">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="holidays"><Briefcase className='mr-2'/>Holidays</TabsTrigger>
            <TabsTrigger value="flights" asChild>
                <Link href="https://www.easemytrip.com/flights.html" target="_blank"><Plane className='mr-2'/>Flights</Link>
            </TabsTrigger>
            <TabsTrigger value="hotels" asChild>
                <Link href="https://www.easemytrip.com/hotels/" target="_blank"><Hotel className='mr-2'/>Hotels</Link>
            </TabsTrigger>
            <TabsTrigger value="deals" asChild>
                <Link href="https://www.easemytrip.com/offers/holiday-deals.html" target="_blank"><Tag className='mr-2'/>Holiday Deals</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="holidays">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Goa, India" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <div className="flex gap-2">
                           <FormControl>
                            <Input placeholder="e.g., 50000" {...field} />
                          </FormControl>
                          <Select defaultValue="INR">
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="themes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests & Themes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., cultural heritage, adventure, nightlife, relaxing, museums..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate themes with commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-grow bg-[#FF5722] hover:bg-[#E64A19] text-white" disabled={isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : <WandSparkles className='mr-2'/>}
                    Generate My Itinerary
                  </Button>
                  <Button size="lg" variant="outline" className="flex-grow" disabled>
                    <WandSparkles className='mr-2'/> Surprise Me!
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
