import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/sections/hero-section';
import { ProductsSection } from '@/components/sections/products-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { CoursesSection } from '@/components/sections/courses-section';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <ProductsSection />
        <ProjectsSection />
        <CoursesSection />
      </main>
      <Footer />
    </div>
  );
}
