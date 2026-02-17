'use client';

import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Screenshots } from '@/components/landing/Screenshots';
import { Pricing } from '@/components/landing/Pricing';
import { About } from '@/components/landing/About';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/landing/Navbar';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Screenshots />
      <About />
      <Pricing />
      <Footer />
    </main>
  );
}