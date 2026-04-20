import dynamic from 'next/dynamic';
import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Footer } from '@/components/landing/footer';

const Features = dynamic(() => import('@/components/landing/features').then((m) => m.Features), {
  ssr: true,
});
const Steps = dynamic(() => import('@/components/landing/steps').then((m) => m.Steps), {
  ssr: true,
});
const Cta = dynamic(() => import('@/components/landing/cta').then((m) => m.Cta), {
  ssr: true,
});

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <Steps />
      <Cta />
      <Footer />
    </main>
  );
}
