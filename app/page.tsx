import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroWithTabs } from '@/components/sections/hero-with-tabs';
import { MonitorSection } from '@/components/sections/monitor-section';
import { EvolveSection } from '@/components/sections/evolve-section';
import { CustomersSection } from '@/components/sections/customers-section';
import { TweetsSection } from '@/components/sections/tweets-section';
import { StatsSection } from '@/components/sections/stats-section';
import { CTASection } from '@/components/sections/cta-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { PostsSection } from '@/components/sections/posts-section';
import { ProjectsSection } from '@/components/sections/projects-showcase';
import { ServicesSection } from '@/components/sections/services-showcase';
import { BundleOffersSection } from '@/components/sections/bundle-offers-section';
import { PlatformSection } from '@/components/sections/platform-section';
import { PortfoliosSection } from '@/components/sections/portfolios-section';
import { TechStackSection } from '@/components/sections/tech-stack-section';
import { HostingSection } from '@/components/sections/hosting-section';

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dunzo.tech/#organization",
      "name": "Dunzo",
      "url": "https://dunzo.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dunzo.tech/logo.jpg",
        "width": 200,
        "height": 200
      },
      "description": "Dunzo delivers cutting-edge software solutions, web development, cloud hosting, and digital services.",
      "sameAs": [
        "https://twitter.com/dunzotech",
        "https://github.com/dunzotech",
        "https://linkedin.com/company/dunzotech"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://dunzo.tech/#website",
      "url": "https://dunzo.tech",
      "name": "Dunzo",
      "description": "Modern Software Solutions & Digital Services",
      "publisher": {
        "@id": "https://dunzo.tech/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dunzo.tech/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Dunzo Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1949"
      }
    }
  ]
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="dot-grid">
        <Header />
        <main>

          <HeroWithTabs />
          <ServicesSection />
          <TechStackSection />
          <ProjectsSection />
          <PortfoliosSection />

          <PostsSection />
          <MonitorSection />
          <PlatformSection />
          <EvolveSection />
          <CustomersSection />
          <TweetsSection />
          <StatsSection />
          <CTASection />
          <HostingSection />
          <BundleOffersSection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
