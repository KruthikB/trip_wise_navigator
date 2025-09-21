
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
import { Loader2, WandSparkles, Briefcase, Plane, Hotel, Tag, Users } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import { suggestTripDetails } from '@/ai/flows/suggest-trip-details';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
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
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="holidays"><Briefcase className='mr-2'/>{t('holidays')}</TabsTrigger>
            <TabsTrigger value="flights" onClick={() => handleTabLinkClick('https://www.easemytrip.com/flights.html')}>
                <Plane className='mr-2'/>{t('flights')}
            </TabsTrigger>
            <TabsTrigger value="hotels" onClick={() => handleTabLinkClick('https://www.easemytrip.com/hotels/')}>
                <Hotel className='mr-2'/>{t('hotels')}
            </TabsTrigger>
            <TabsTrigger value="deals" onClick={() => handleTabLinkClick('https://www.easemytrip.com/offers/holiday-deals.html')}>
                <Tag className='mr-2'/>{t('holidayDeals')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="holidays">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
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
                        <FormLabel>Number of Travellers</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2" {...field} />
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
                </div>

                <FormField
                  control={form.control}
                  name="themes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('interestsAndThemes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('themesPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('themesDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
        </Tabs>
      </CardContent>
    </Card>
  );
}
