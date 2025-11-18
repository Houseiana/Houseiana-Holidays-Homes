'use client';

import { Suspense, useEffect } from 'react';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/layout/hero';
import { TrendingDestinations } from '@/components/layout/trending-destinations';
import { PropertyTypes } from '@/components/layout/property-types';
import { WhyChooseUs } from '@/components/layout/why-choose-us';
import { MobileAppCta } from '@/components/layout/mobile-app-cta';
import { Testimonials } from '@/components/layout/testimonials';
import { NewsletterSignup } from '@/components/layout/newsletter-signup';
import { BecomeAHost } from '@/components/layout/become-a-host';
import { HeroSearchSkeleton } from '@/components/ui/skeleton';
import { MobileNav } from '@/components/layout/mobile-nav';

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'signin') {
      // Trigger login modal from header
      const event = new CustomEvent('openLoginModal');
      window.dispatchEvent(event);
    } else if (authParam === 'signup') {
      // Redirect to signup page instead of opening modal
      router.push('/signup');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />
        <TrendingDestinations />
        <PropertyTypes />
        <WhyChooseUs />
        <MobileAppCta />
        <Testimonials />
        <NewsletterSignup />
        <BecomeAHost />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <div className="h-16 bg-white border-b border-gray-200 animate-pulse" />
          <div className="flex-1 bg-gradient-to-br from-primary-50 to-white py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
              </div>
              <HeroSearchSkeleton />
            </div>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}