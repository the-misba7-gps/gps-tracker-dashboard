import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreHydration } from '@/components/StoreHydration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GPS Tracker - Professional Fleet Management & Real-Time Vehicle Tracking',
  description: 'Track your fleet in real-time with our professional GPS tracking solution. Features geofencing, analytics, alerts, and role-based access. Perfect for businesses and individuals.',
  keywords: 'GPS tracking, fleet management, vehicle tracking, geofencing, real-time tracking, fleet analytics',
  authors: [{ name: 'GPS Tracker Team' }],
  openGraph: {
    title: 'GPS Tracker - Professional Fleet Management',
    description: 'Real-time GPS tracking with geofencing, analytics, and comprehensive fleet management tools.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPS Tracker - Professional Fleet Management',
    description: 'Real-time GPS tracking with geofencing, analytics, and comprehensive fleet management tools.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}
