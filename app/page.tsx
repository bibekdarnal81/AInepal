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

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="dot-grid">
        <Header />
        <main>
          <HeroWithTabs />
          <ServicesSection />
          <ProjectsSection />
          <PostsSection />
          <MonitorSection />
          <EvolveSection />
          <CustomersSection />
          <TweetsSection />
          <StatsSection />
          <CTASection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

