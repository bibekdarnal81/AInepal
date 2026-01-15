import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalChatWidget } from '@/components/chat/conditional-chat-widget';
import { ThemeScript } from '@/components/theme-script';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dunzo.tech'),
  title: {
    default: "Dunzo - Modern Software Solutions & Digital Services",
    template: "%s | Dunzo"
  },
  description: "Dunzo delivers cutting-edge software solutions, web development, cloud hosting, and digital services. Transform your business with our modern tech stack and expert team.",
  keywords: [
    "software development",
    "web development",
    "cloud hosting",
    "digital solutions",
    "tech company",
    "modern software",
    "Dunzo",
    "SaaS",
    "web applications",
    "API development",
    "full-stack development",
    "digital transformation"
  ],
  authors: [{ name: "Dunzo Team" }],
  creator: "Dunzo",
  publisher: "Dunzo",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Dunzo',
    title: 'Dunzo - Modern Software Solutions & Digital Services',
    description: 'Transform your business with cutting-edge software solutions, web development, and cloud hosting. Built by experts, designed for scale.',
    images: [
      {
        url: '/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Dunzo - Modern Software Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dunzo - Modern Software Solutions & Digital Services',
    description: 'Transform your business with cutting-edge software solutions, web development, and cloud hosting.',
    images: ['/logo.jpg'],
    creator: '@dunzotech',
    site: '@dunzotech',
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
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeScript />
        <TopBanner />
        {children}
        <ConditionalChatWidget />
      </body>
    </html>
  );
}
