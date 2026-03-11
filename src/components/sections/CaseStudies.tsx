'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface CaseStudy {
  slug: string;
  badge: string;
  badgeColor: 'pink' | 'purple' | 'green' | 'blue';
  image: string;
  imageBadges: Array<{ text: string; color: string }>;
  headline: string;
  subheadline: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  tags: string[];
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'spinemat',
    badge: 'Case Study',
    badgeColor: 'pink',
    image: 'https://images.unsplash.com/photo-1761839257144-297ce252742e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8',
    imageBadges: [
      { text: 'ROAS 6X', color: 'bg-yellow-400 text-black' },
      { text: '100%', color: 'bg-primary text-white' },
      { text: 'BOOTSTRAPPED', color: 'bg-white text-black' },
    ],
    headline: '₹45 Lakhs',
    subheadline: 'in a Single Month',
    description:
      "A manufacturer's son took his family's offline product online. Shipped us the product.",
    metrics: [
      { label: '', value: '2.5L in 24hrs' },
      { label: '', value: '12,500' },
      { label: '', value: '7 before chai' },
    ],
    tags: ['Ads', 'Landing Page', 'AI Automations'],
  },
  {
    slug: 'case-study-2',
    badge: 'Case Study',
    badgeColor: 'purple',
    image: 'https://plus.unsplash.com/premium_photo-1772902298649-7b3ebcbe2f29?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMXx8fGVufDB8fHx8fA%3D%3D',
    imageBadges: [
      { text: 'ROAS 4X', color: 'bg-purple-400 text-white' },
      { text: 'ZERO EXP', color: 'bg-primary text-white' },
    ],
    headline: '₹25 Lakhs',
    subheadline: '/Month Bootstrapped',
    description:
      'A first-time founder with zero prior D2C experience. We built her funnel from scratch.',
    metrics: [
      { label: 'Month 1', value: '₹6.5 Lakhs' },
      { label: 'Month 8', value: '₹25 Lakhs' },
      { label: 'ROAS', value: 'Profitable' },
    ],
    tags: ['Full Funnel', 'Ads', 'Follow-Up'],
  },
  {
    slug: 'case-study-3',
    badge: 'Case Study',
    badgeColor: 'green',
    image: '/case-study-3.jpg',
    imageBadges: [
      { text: 'DAY 1', color: 'bg-green-400 text-black' },
      { text: '2.5L VIEWS', color: 'bg-primary text-white' },
    ],
    headline: '2.5L Views',
    subheadline: 'on Day 1',
    description:
      '₹10,000/day ad budget on day one. Within 24 hours — 2.5 Lakh impressions, 12,500 clicks.',
    metrics: [
      { label: 'Impressions', value: '2.5L/24hrs' },
      { label: 'Clicks', value: '12,500' },
      { label: 'Customers', value: '7 before chai' },
    ],
    tags: ['Meta Ads', 'Launch Strategy'],
  },
  {
    slug: 'case-study-4',
    badge: 'Case Study',
    badgeColor: 'blue',
    image: '/case-study-4.jpg',
    imageBadges: [
      { text: '90 DAYS', color: 'bg-blue-400 text-white' },
      { text: '₹8L MRR', color: 'bg-primary text-white' },
    ],
    headline: '₹8L MRR',
    subheadline: 'in 90 Days',
    description:
      'A senior developer spent 8 months building a consumer app. Zero marketing. Zero paying users.',
    metrics: [
      { label: 'Before Us', value: '₹0 revenue' },
      { label: 'Action', value: 'Positioning fix' },
      { label: '90 Days', value: '₹8L MRR' },
    ],
    tags: ['Positioning', 'Meta Ads', 'Paywall'],
  },
];

const badgeColors = {
  pink: 'bg-badge-pink-bg text-badge-pink-text',
  purple: 'bg-badge-purple-bg text-badge-purple-text',
  green: 'bg-success-light text-success',
  blue: 'bg-badge-purple-bg text-badge-purple-text',
};

export default function CaseStudies() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-swipe on mobile
  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % caseStudies.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.offsetWidth * 0.85; // 85% width per card
          scrollRef.current.scrollTo({
            left: next * cardWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 3000); // 3 seconds between swipes

    return () => clearInterval(interval);
  }, [isMobile]);

  // Handle manual scroll to update indicator
  const handleScroll = () => {
    if (!scrollRef.current || !isMobile) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.85;
    const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setCurrentIndex(newIndex);
  };

  return (
    <section id="case-studies" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
              Our Case Studies
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              This Could Be Your <br /> Brand Story Next
            </h2>
          </div>
          
        </div>

        {/* Case Study Cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {caseStudies.map((study, index) => (
            <Link
              href={`/case-study/${study.slug}`}
              key={index}
              className="flex-shrink-0 w-[85vw] aspect-square min-[465px]:w-[392px] min-[465px]:h-[392px] min-[465px]:aspect-auto md:w-auto md:aspect-auto md:h-[395px] snap-center bg-card-bg rounded-2xl border border-border overflow-hidden card-shadow hover:card-shadow-hover transition-shadow duration-300 cursor-pointer"
            >
              {/* Image Section with Overlays */}
              <div className="relative h-48 sm:h-56">
                <img
                  src={study.image}
                  alt={study.headline}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                

                {/* Stats Badges (scattered on image) */}
                
              </div>

              {/* Content Section with Blurred Background */}
              <div className="relative overflow-hidden">
                {/* Blurred background image */}
                <div className="absolute inset-0">
                  <img
                    src={study.image}
                    alt=""
                    className="w-full h-full object-cover scale-110 blur-2xl"
                  />
                  <div className="absolute inset-0 bg-black/70"></div>
                </div>
                
                {/* Content */}
                <div className="relative p-2">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {study.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[8px] text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl lg:text-3xl font-bold text-white">
                    {study.headline}{' '}
                    <span className="text-sm lg:text-xl font-normal text-white/70">
                      {study.subheadline}
                    </span>
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 text-xs mt-2 mb-4">{study.description}</p>

                  {/* Separator line */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-1"></div>

                  {/* View Case Study Link */}
                  <span
                    className="flex items-center justify-center text-sm  font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    View Case Study
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Dot Indicators */}
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {caseStudies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.offsetWidth * 0.85;
                  scrollRef.current.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-primary w-6'
                  : 'bg-border hover:bg-text-muted'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
