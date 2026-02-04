
// import { MacOSDock } from '@/components/ui/mac-os-dock';
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
  // Mock apps for Dock
  // Mock apps for Dock
  /* const dockApps = [
    { id: 'finder', name: 'Finder', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Finder_Icon_macOS_Big_Sur.png' },
    { id: 'launchpad', name: 'Launchpad', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Launchpad_icon_%28macOS_Big_Sur%29.svg/2048px-Launchpad_icon_%28macOS_Big_Sur%29.svg.png' },
    { id: 'safari', name: 'Safari', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.png' },
    { id: 'messages', name: 'Messages', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Apple_Messages_logo.svg/1024px-Apple_Messages_logo.svg.png' },
    { id: 'mail', name: 'Mail', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg' },
    { id: 'maps', name: 'Maps', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Apple_Maps_icon.svg' },
    { id: 'photos', name: 'Photos', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Apple_Photos_icon.svg' },
    { id: 'facetime', name: 'FaceTime', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/FaceTime_macOS_Big_Sur.png' },
    { id: 'calendar', name: 'Calendar', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Calendar_%282019-present%29.svg' },
    { id: 'contacts', name: 'Contacts', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Apple_Contacts_icon.svg' },
    { id: 'notes', name: 'Notes', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Apple_Notes_icon.svg' },
    { id: 'music', name: 'Music', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg' },
    { id: 'podcasts', name: 'Podcasts', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_Podcasts.svg' },
    { id: 'tv', name: 'TV', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Apple_TV_app_icon.png' },
    { id: 'news', name: 'News', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_News_icon.svg' },
    { id: 'settings', name: 'Settings', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg' }
  ]; */

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
      {/* <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto">
          <MacOSDock apps={dockApps} />
        </div>
      </div> */}
    </div>
  );
}
