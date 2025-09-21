
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
import { Loader2, WandSparkles, Briefcase, Plane, Hotel, Tag, CalendarIcon } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import { suggestTripDetails } from '@/ai/flows/suggest-trip-details';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  startDate: z.date({ required_error: 'A start date is required.' }),
  duration: z.coerce.number().int().min(1, { message: 'Duration must be at least 1 day.' }),
  numberOfTravellers: z.coerce.number().int().min(1, { message: 'Must have at least 1 traveller.' }),
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
      startDate: new Date(),
      duration: 7,
      numberOfTravellers: 2,
      budget: '50000',
      themes: 'cultural heritage, adventure, nightlife, relaxing, museums',
    },
  });

  const [activeTab, setActiveTab] = useState('holidays');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      themes: values.themes.split(',').map(theme => theme.trim()).filter(Boolean),
    });
  }

  const handleTabLinkClick = (url: string) => {
    window.open(url, '_blank');
    setActiveTab('holidays');
  };
  
  const handleSurpriseMe = async () => {
    setIsSuggesting(true);
    try {
      const currentValues = form.getValues();
      const result = await suggestTripDetails({
        destination: currentValues.destination,
        duration: currentValues.duration,
        budget: currentValues.budget,
        theme: currentValues.themes,
        numberOfTravellers: currentValues.numberOfTravellers,
      });

      // budget might come back with currency, remove it for the form
      const budgetValue = result.budget.replace(/[^0-9]/g, '');

      form.setValue('destination', result.destination);
      form.setValue('duration', result.duration);
      form.setValue('budget', budgetValue);
      form.setValue('themes', result.theme);
      form.setValue('numberOfTravellers', result.numberOfTravellers);
      // Let's not change the date for surprise me, user might have specific dates in mind.

    } catch(error) {
       console.error('Failed to get suggestion:', error);
      toast({
        variant: 'destructive',
        title: t('toastErrorTitle'),
        description: t('surpriseErrorDescription'),
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <Card className="shadow-lg border-none">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent p-0 h-auto justify-start gap-4">
            <TabsTrigger value="holidays" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary p-3 font-semibold">
                <Briefcase className='mr-2'/>{t('holidays')}
            </TabsTrigger>
            <TabsTrigger value="flights" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary p-3 font-semibold" onClick={() => handleTabLinkClick('https://www.easemytrip.com/flights.html')}>
                <Plane className='mr-2'/>{t('flights')}
            </TabsTrigger>
            <TabsTrigger value="hotels" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary p-3 font-semibold" onClick={() => handleTabLinkClick('https://www.easemytrip.com/hotels/')}>
                <Hotel className='mr-2'/>{t('hotels')}
            </TabsTrigger>
            <TabsTrigger value="deals" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary p-3 font-semibold" onClick={() => handleTabLinkClick('https://www.easemytrip.com/offers/holiday-deals.html')}>
                <Tag className='mr-2'/>{t('holidayDeals')}
            </TabsTrigger>
          </TabsList>
          <div className='bg-card p-6 rounded-b-lg rounded-tr-lg'>
          <TabsContent value="holidays" className="m-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>{t('destination')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('destinationPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('startDate')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>{t('pickADate')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date() || date > new Date("2100-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('duration')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="numberOfTravellers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('numberOfTravellers')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('budget')}</FormLabel>
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
                     <FormField
                      control={form.control}
                      name="themes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('interestsAndThemes')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('themesPlaceholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-grow bg-[#FF5722] hover:bg-[#E64A19] text-white" disabled={isGenerating || isSuggesting}>
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : <WandSparkles className='mr-2'/>}
                    {t('generateItineraryButton')}
                  </Button>
                  <Button size="lg" variant="outline" className="flex-grow" onClick={handleSurpriseMe} disabled={isGenerating || isSuggesting}>
                    {isSuggesting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : <WandSparkles className='mr-2'/>}
                     {t('surpriseMeButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
