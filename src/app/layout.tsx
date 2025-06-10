import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import JsonLd from '@/components/json-ld';
import { tradingDashboardJsonLd } from '@/core/utils';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Real-Time Cryptocurrency Price Tracking',
    template: '%s | Real-Time Cryptocurrency Price Tracking',
  },
  description:
    'Track cryptocurrency prices in real-time with advanced charts. Built with Next.js, React and TypeScript',
  keywords: [
    'Cryptocurrency',
    'Bitcoin',
    'Crypto',
    'Price Tracking',
    'Real-Time',
    'Trading Dashboard',
    'Market Overview',
    'Live Charts',
    'WebSocket',
    'Next.js',
    'React',
    'TypeScript',
  ],
  authors: [{ name: 'Mohammad Bekr' }],
  creator: 'Mohammad Bekr',
  publisher: 'Real-Time Cryptocurrency Price Tracking',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://real-time-cryptocurrency-price-trac.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Real-Time Cryptocurrency Price Tracking',
    description:
      'Track cryptocurrency prices in real-time with advanced chart. Built with Next.js, React and TypeScript',
    url: 'https://real-time-cryptocurrency-price-trac.vercel.app',
    siteName: 'Real-Time Cryptocurrency Price Tracking',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Real-Time Cryptocurrency Price Tracking',
    description:
      'Track cryptocurrency prices in real-time with advanced charts. Built with Next.js, React and TypeScript',
    creator: '@mohammadbekran',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd data={tradingDashboardJsonLd} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
