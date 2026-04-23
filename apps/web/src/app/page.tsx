import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Features } from '@/components/landing/features';
import { Steps } from '@/components/landing/steps';
import { Roles } from '@/components/landing/roles';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <Steps />
      <Roles />
      <Cta />
      <Footer />
    </main>
  );
}
