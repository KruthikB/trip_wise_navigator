import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import LandingHeader from '@/components/landing-header';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full md:h-[70vh]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="relative z-10 mx-4 max-w-3xl rounded-lg bg-background/50 p-8 backdrop-blur-sm">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Your Personal AI Planner for India
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/80">
                Craft your perfect domestic journey with TripWise Navigator. AI-powered itineraries, real-time adjustments, and seamless planning for travel across India.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <p className="text-base font-semibold leading-7 text-primary">Everything you need to explore India</p>
              <h2 className="mt-2 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Plan smarter, travel better
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                TripWise leverages cutting-edge AI to build itineraries that match your style and budget, making every trip across India unforgettable.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
