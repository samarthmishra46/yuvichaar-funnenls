import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import Quote from '@/components/sections/Quote';
import CaseStudies from '@/components/sections/CaseStudies';
import WhoIsThisFor from '@/components/sections/WhoIsThisFor';
import WhatWeDo from '@/components/sections/WhatWeDo';
import MeetTheFounder from '@/components/sections/MeetTheFounder';
import BehindTheScenes from '@/components/sections/BehindTheScenes';
import Timeline from '@/components/sections/Timeline';
import CTA from '@/components/sections/CTA';
import Footer from '@/components/sections/Footer';
import { StickyCTA } from '@/components/CTAButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Quote />
        {/* <CaseStudies /> */}
        <WhoIsThisFor />
        <WhatWeDo />
        <MeetTheFounder />
        <BehindTheScenes />
        <Timeline />
        <CTA />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
}
