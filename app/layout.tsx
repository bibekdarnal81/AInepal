import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalChatWidget } from '@/components/chat/conditional-chat-widget';
import { TopBanner } from '@/components/top-banner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rusha.co'),
  title: {
    default: "Rusha - Digital Solutions for Your Business",
    template: "%s | Rusha"
  },
  description: "Transform your business with our comprehensive digital solutions designed to drive growth and innovation. Web Development, SEO, and more.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Rusha',
    title: 'Rusha - Digital Solutions for Your Business',
    description: 'Transform your business with our comprehensive digital solutions.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rusha Digital Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rusha - Digital Solutions for Your Business',
    description: 'Transform your business with our comprehensive digital solutions.',
    images: ['/og-image.jpg'],
    creator: '@rusha',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopBanner />
        {children}
        <ConditionalChatWidget />
      </body>
    </html>
  );
}
