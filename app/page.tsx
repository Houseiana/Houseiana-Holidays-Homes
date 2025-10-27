'use client';

import { useEffect } from 'react';
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

export default function HomePage() {
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
    </div>
  );
}