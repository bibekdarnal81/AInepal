import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalChatWidget } from '@/components/chat/conditional-chat-widget';
import { ThemeScript } from '@/components/theme-script';
import { TopBanner } from '@/components/top-banner';
import { AuthProvider } from '@/lib/auth/provider';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://AINepal.dev'),
  title: {
    default: "AINepal - Modern Software Solutions & Digital Services",
    template: "%s | AINepal"
  },
  description: "AINepal delivers cutting-edge software solutions, web development, cloud hosting, and digital services. Transform your business with our modern tech stack and expert team.",
  keywords: [
    "software development",
    "web development",
    "cloud hosting",
    "digital solutions",
    "tech company",
    "modern software",
    "AINepal",
    "SaaS",
    "web applications",
    "API development",
    "full-stack development",
    "digital transformation"
  ],
  authors: [{ name: "AINepal Team" }],
  creator: "AINepal",
  publisher: "AINepal",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'AINepal',
    title: 'AINepal - Modern Software Solutions & Digital Services',
    description: 'Transform your business with cutting-edge software solutions, web development, and cloud hosting. Built by experts, designed for scale.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'AINepal - Modern Software Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINepal - Modern Software Solutions & Digital Services',
    description: 'Transform your business with cutting-edge software solutions, web development, and cloud hosting.',
    images: ['/logo.png'],
    creator: '@AINepaltech',
    site: '@AINepaltech',
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

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
        <AuthProvider>
          <TopBanner />
          {children}
          <ConditionalChatWidget />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

