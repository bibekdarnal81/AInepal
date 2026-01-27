import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Hero from '@/components/sections/hero-with-tabs';
import { PricingComparison } from '@/components/sections/pricing-comparison';
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
import { ClassesSection } from '@/components/sections/classes-section';
import { CareersSection } from '@/components/sections/careers-section';

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://AINepal.tech/#organization",
      "name": "AINepal",
      "url": "https://AINepal.dev",
      "logo": {
        "@type": "ImageObject",
        "url": "https://AINepal.dev/logo.jpg",
        "width": 200,
        "height": 200
      },
      "description": "AINepal delivers cutting-edge software solutions, web development, cloud hosting, and digital services.",
      "sameAs": [
        "https://twitter.com/AINepaltech",
        "https://github.com/AINepaltech",
        "https://linkedin.com/company/AINepaltech"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://AINepal.tech/#website",
      "url": "https://AINepal.tech",
      "name": "AINepal",
      "description": "Modern Software Solutions & Digital Services",
      "publisher": {
        "@id": "https://AINepal.tech/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://AINepal.tech/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "AINepal Platform",
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
          <Hero />
          <ServicesSection />
          <PricingComparison />
          <ClassesSection />
          <CareersSection />
          <TechStackSection />
          <ProjectsSection />
          <PortfoliosSection />

          {/* <PostsSection /> */}
          {/* <MonitorSection /> */}
          <PlatformSection />
          <EvolveSection />
          <CustomersSection />
          {/* <TweetsSection /> */}
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
