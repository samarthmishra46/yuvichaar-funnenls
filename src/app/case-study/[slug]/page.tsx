'use client';

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRef } from 'react';

// Case study data - you can edit this for each case study
const caseStudiesData: Record<string, CaseStudyData> = {
  'spinemat': {
    brandName: 'Spinemat',
    badge: 'CASE STUDY',
    brandBadge: 'SPINEMAT',
    headline: '₹45 Lakhs in a Single Month!',
    description: "A manufacturer's son took his family's offline product online. Here's exactly what we built — and how it worked.",
    brandStory: {
      icon: '🧘‍♂️',
      title: 'This is Spinemat.',
      description: 'A second generation family business from Jaipur. Decades of offline sales. The product was genuinely good but the internet had little idea they existed.',
    },
    metrics: [
      { icon: '📈', value: '₹25L/mo', label: 'Revenue' },
      { icon: '💎', value: '3.6x', label: 'ROAS' },
      { icon: '⏱️', value: '7 Months', label: 'Timeframe' },
      { icon: '🏆', value: '₹45L', label: 'Peak Month' },
    ],
    funnelIntro: {
      title: "Here's The Sales Funnel We Built That The Customer Experienced",
      story: "Meet Priya. She's scrolling Instagram on a Tuesday night. Tired. Half-paying attention.",
      hook: "Then she sees an ad.",
    },
    steps: [
      {
        number: 1,
        tag: 'PERFORMANCE ADS',
        tagColor: 'text-primary',
        title: 'Ads We Created For Spinemat 👇',
        images: [
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'WhatsApp Video Message', badge: '[SCREENSHOT — WhatsApp video message]'},
          { src: '/img2.jpg', label: 'Feed Ad', badge: 'Feed Ad', duration: '0:38' },
        ],
        description: "It doesn't feel like an ad. It feels like someone is talking directly to her problem. She stops scrolling.",
        transition: 'She clicks.',
      },
      {
        number: 2,
        tag: 'LANDING PAGE',
        tagColor: 'text-purple-500',
        title: 'Landing Page/ Website We Created For Spinemat 👇',
        intro: 'She clicks. Lands on a page.',
        images: [
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773214395/Screenshot_from_2026-03-11_12-24-27_fgll1g.png', label: 'Hero Section', badge: 'Above the Fold' },
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
        ],
        description: 'The page doesn\'t overwhelm her. It answers exactly the one question in her head — "is this actually for me?" — in about 30 seconds of reading.',
        transition: 'She browses. Interested. But doesn\'t buy yet.',
      },
      {
        number: 3,
        tag: 'WHATSAPP AUTOMATION',
        tagColor: 'text-green-500',
        title: 'Whatsapp Automations We Did For Spinemat 👇',
        intro: "She's interested. But she hasn't buy yet. Life happens. She closes the tab.",
        highlight: '5 mins later, she receives a whatsapp.',
        images: [
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'WhatsApp Video Message', badge: '[SCREENSHOT — WhatsApp video message]' },
        ],
        description: 'We show up on WhatsApp. Not with a discount. With a short video — someone who had the exact same hesitation she did. And bought anyway.',
        outro: 'She watches it. Still sitting on the fence.',
        transition: '45 mins later —',
      },
      {
        number: 4,
        tag: 'EMAIL',
        tagColor: 'text-orange-500',
        intro: '45 mins later —',
        description: 'an email. Not a newsletter. One line that answers the specific objection most people have at this stage.',
        images: [
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'Email Campaign', badge: '[SCREENSHOT — email]' },
        ],
        outro: '1 hour later, her phone rings.',
        transition: '1 hour later —',
      },
      {
        number: 5,
        tag: 'AI SALES CALL',
        tagColor: 'text-blue-500',
        title: "Here's The AI Sales Call Automation We Built —",
        images: [
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
        ],
        salesScript: [
          { step: 'Open', description: 'Acknowledge her exact hesitation from the ad she clicked' },
          { step: 'Bridge', description: 'Introduce the product as a solution she already considered' },
          { step: 'Social proof', description: 'Someone like her — same concern, now a happy customer' },
          { step: 'Close', description: 'One clear, low-pressure next step' },
        ],
        description: 'Not a spam call. Not a robotic voice. Someone — or something — that actually knows what she was looking at, why she might have hesitated, and what would make her feel confident about buying.',
        highlight: 'She talks for four minutes. Her last question gets answered.',
        transition: 'She\'s convinced.',
      },
      {
        number: 6,
        tag: 'ORDER BUMP',
        tagColor: 'text-pink-500',
        title: '[STEP 4] She goes back. Adds to cart.',
        description: 'Right before she pays — one small thing appears. A relevant add-on. One tap. Feels obvious. She adds it without really thinking about it.',
        orderBump: {
          title: 'Add Complementary Product',
          subtitle: 'Customers who bought this also love...',
        },
        highlight: 'This one addition. +25% average order value. On every order. Forever.',
        transition: 'She buys.',
      },
      {
        number: 7,
        tag: 'RETENTION & REPEAT',
        tagColor: 'text-teal-500',
        title: '[STEP 5] She buys. Gets her order. Loves it.',
        description: 'Three days later — a WhatsApp message. Not a discount blast. Something genuinely useful. A reason to come back.',
        images: [
          { src: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773215294/img_qxxjxd.png', label: 'WhatsApp Retention Flow', badge: '[SCREENSHOT — WhatsApp retention flow]' },
        ],
        outro: 'She comes back.',
      },
    ],
    growthTimeline: [
      { period: 'WEEK 1', value: '300+ units shipped', color: 'bg-primary' },
      { period: 'MONTH 1', value: '₹13 Lakhs', color: 'bg-green-500' },
      { period: 'MONTH 7', value: '₹45 Lakhs', color: 'bg-purple-500' },
    ],
    dashboardImage: '/img11.jpg',
    whyItWorked: {
      title: 'We thought about Priya the entire time.',
      points: [
        'What would make her stop scrolling?',
        'What would make her trust?',
        'What would answer that last question before she talked herself out of it?',
      ],
      conclusion: "That's the whole job.",
      quote: "We're not here to make beautiful campaigns. We're here to make sure Priya buys — and comes back.",
    },
    cta: {
      title: 'Think this could work for your brand?',
      buttonText: 'Book a Call',
      note: 'Minimum ₹5L marketing budget',
    },
  },
  // Add more case studies here with the same structure
  'case-study-2': {
    brandName: 'Brand 2',
    badge: 'CASE STUDY',
    brandBadge: 'BRAND 2',
    headline: '₹25 Lakhs /Month Bootstrapped',
    description: "A first-time founder with zero prior D2C experience. We built her funnel from scratch.",
    brandStory: {
      icon: '✨',
      title: 'This is Brand 2.',
      description: 'A first-time founder entering the D2C space with zero experience but a great product idea.',
    },
    metrics: [
      { icon: '📈', value: '₹25L/mo', label: 'Revenue' },
      { icon: '💎', value: '4x', label: 'ROAS' },
      { icon: '⏱️', value: '8 Months', label: 'Timeframe' },
      { icon: '🏆', value: '₹25L', label: 'Peak Month' },
    ],
    funnelIntro: {
      title: "Here's The Sales Funnel We Built That The Customer Experienced",
      story: "Meet Priya. She's scrolling Instagram on a Tuesday night. Tired. Half-paying attention.",
      hook: "Then she sees an ad.",
    },
    steps: [
      {
        number: 1,
        tag: 'PERFORMANCE ADS',
        tagColor: 'text-primary',
        title: 'Ads We Created ✨',
        images: [
          { src: '/img1.jpg', label: 'Reels Ad', badge: 'Reels Ad', duration: '0:22' },
          { src: '/img2.jpg', label: 'Feed Ad', badge: 'Feed Ad', duration: '0:38' },
        ],
        description: "It doesn't feel like an ad. It feels like someone is talking directly to her problem. She stops scrolling.",
      },
      {
        number: 2,
        tag: 'LANDING PAGE',
        tagColor: 'text-purple-500',
        title: 'Landing Page We Created ✨',
        intro: 'She clicks. Lands on a page.',
        images: [
          { src: '/img3.jpg', label: 'Hero Section', badge: 'Above the Fold' },
          { src: '/img4.jpg', label: 'Features', badge: 'Benefits' },
        ],
        description: 'The page doesn\'t overwhelm her. It answers exactly the one question in her head — "is this actually for me?"',
      },
      {
        number: 3,
        tag: 'WHATSAPP AUTOMATION',
        tagColor: 'text-green-500',
        title: 'Whatsapp Automations ✨',
        intro: "She's interested. But she hasn't buy yet. Life happens. She closes the tab.",
        highlight: '5 mins later, she receives a whatsapp.',
        images: [
          { src: '/img7.jpg', label: 'WhatsApp Video Message', badge: '[SCREENSHOT — WhatsApp video message]' },
        ],
        description: 'We show up on WhatsApp. Not with a discount. With a short video.',
        outro: 'She watches it. Still sitting on the fence.',
      },
      {
        number: 4,
        tag: 'EMAIL',
        tagColor: 'text-orange-500',
        intro: '45 mins later —',
        description: 'an email. Not a newsletter. One line that answers the specific objection most people have at this stage.',
        images: [
          { src: '/img8.jpg', label: 'Email Campaign', badge: '[SCREENSHOT — email]' },
        ],
        outro: '1 hour later, her phone rings.',
      },
      {
        number: 5,
        tag: 'AI SALES CALL',
        tagColor: 'text-blue-500',
        title: "Here's The AI Sales Call Automation We Built —",
        images: [
          { src: '/img9.jpg', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
        ],
        salesScript: [
          { step: 'Open', description: 'Acknowledge her exact hesitation from the ad she clicked' },
          { step: 'Bridge', description: 'Introduce the product as a solution she already considered' },
          { step: 'Social proof', description: 'Someone like her — same concern, now a happy customer' },
          { step: 'Close', description: 'One clear, low-pressure next step' },
        ],
        description: 'Not a spam call. Not a robotic voice.',
        highlight: 'She talks for four minutes. Her last question gets answered.',
      },
      {
        number: 6,
        tag: 'ORDER BUMP',
        tagColor: 'text-pink-500',
        title: '[STEP 4] She goes back. Adds to cart.',
        description: 'Right before she pays — one small thing appears. A relevant add-on.',
        orderBump: {
          title: 'Add Complementary Product',
          subtitle: 'Customers who bought this also love...',
        },
        highlight: 'This one addition. +25% average order value.',
      },
      {
        number: 7,
        tag: 'RETENTION & REPEAT',
        tagColor: 'text-teal-500',
        title: '[STEP 5] She buys. Gets her order. Loves it.',
        description: 'Three days later — a WhatsApp message. Not a discount blast. Something genuinely useful.',
        images: [
          { src: '/img10.jpg', label: 'WhatsApp Retention Flow', badge: '[SCREENSHOT — WhatsApp retention flow]' },
        ],
        outro: 'She comes back.',
      },
    ],
    growthTimeline: [
      { period: 'MONTH 1', value: '₹6.5 Lakhs', color: 'bg-primary' },
      { period: 'MONTH 4', value: '₹15 Lakhs', color: 'bg-green-500' },
      { period: 'MONTH 8', value: '₹25 Lakhs', color: 'bg-purple-500' },
    ],
    dashboardImage: '/img11.jpg',
    whyItWorked: {
      title: 'We thought about the customer the entire time.',
      points: [
        'What would make her stop scrolling?',
        'What would make her trust?',
        'What would answer that last question before she talked herself out of it?',
      ],
      conclusion: "That's the whole job.",
      quote: "We're not here to make beautiful campaigns. We're here to make sure she buys — and comes back.",
    },
    cta: {
      title: 'Think this could work for your brand?',
      buttonText: 'Book a Call',
      note: 'Minimum ₹5L marketing budget',
    },
  },
  'case-study-3': {
    brandName: 'Day 1 Launch',
    badge: 'CASE STUDY',
    brandBadge: 'LAUNCH',
    headline: '2.5L Views on Day 1',
    description: "₹10,000/day ad budget on day one. Within 24 hours — 2.5 Lakh impressions, 12,500 clicks.",
    brandStory: {
      icon: '🚀',
      title: 'This is a Day 1 Launch.',
      description: 'A brand new product launch with aggressive ad spend and optimized creatives.',
    },
    metrics: [
      { icon: '👁️', value: '2.5L', label: 'Impressions' },
      { icon: '👆', value: '12,500', label: 'Clicks' },
      { icon: '🛒', value: '7', label: 'Before Chai' },
      { icon: '💰', value: '₹10K', label: 'Daily Budget' },
    ],
    funnelIntro: {
      title: "Here's The Sales Funnel We Built That The Customer Experienced",
      story: "Meet Priya. She's scrolling Instagram on a Tuesday night. Tired. Half-paying attention.",
      hook: "Then she sees an ad.",
    },
    steps: [
      {
        number: 1,
        tag: 'PERFORMANCE ADS',
        tagColor: 'text-primary',
        title: 'Ads We Created ✨',
        images: [
          { src: '/img1.jpg', label: 'Reels Ad', badge: 'Reels Ad', duration: '0:22' },
          { src: '/img2.jpg', label: 'Feed Ad', badge: 'Feed Ad', duration: '0:38' },
        ],
        description: "It doesn't feel like an ad. It feels like someone is talking directly to her problem. She stops scrolling.",
      },
      {
        number: 2,
        tag: 'LANDING PAGE',
        tagColor: 'text-purple-500',
        title: 'Landing Page We Created ✨',
        intro: 'She clicks. Lands on a page.',
        images: [
          { src: '/img3.jpg', label: 'Hero Section', badge: 'Above the Fold' },
        ],
        description: 'The page doesn\'t overwhelm her. It answers exactly the one question in her head.',
      },
      {
        number: 3,
        tag: 'WHATSAPP AUTOMATION',
        tagColor: 'text-green-500',
        title: 'Whatsapp Automations ✨',
        intro: "She's interested. But she hasn't buy yet.",
        highlight: '5 mins later, she receives a whatsapp.',
        images: [
          { src: '/img7.jpg', label: 'WhatsApp Video Message', badge: '[SCREENSHOT — WhatsApp video message]' },
        ],
        description: 'We show up on WhatsApp. Not with a discount. With a short video.',
      },
      {
        number: 4,
        tag: 'EMAIL',
        tagColor: 'text-orange-500',
        intro: '45 mins later —',
        description: 'an email. Not a newsletter.',
        images: [
          { src: '/img8.jpg', label: 'Email Campaign', badge: '[SCREENSHOT — email]' },
        ],
      },
      {
        number: 5,
        tag: 'AI SALES CALL',
        tagColor: 'text-blue-500',
        title: "Here's The AI Sales Call Automation We Built —",
        images: [
          { src: '/img9.jpg', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
        ],
        salesScript: [
          { step: 'Open', description: 'Acknowledge her exact hesitation from the ad she clicked' },
          { step: 'Bridge', description: 'Introduce the product as a solution she already considered' },
          { step: 'Social proof', description: 'Someone like her — same concern, now a happy customer' },
          { step: 'Close', description: 'One clear, low-pressure next step' },
        ],
        description: 'Not a spam call. Not a robotic voice.',
      },
      {
        number: 6,
        tag: 'ORDER BUMP',
        tagColor: 'text-pink-500',
        title: '[STEP 4] She goes back. Adds to cart.',
        description: 'Right before she pays — one small thing appears.',
        orderBump: {
          title: 'Add Complementary Product',
          subtitle: 'Customers who bought this also love...',
        },
      },
      {
        number: 7,
        tag: 'RETENTION & REPEAT',
        tagColor: 'text-teal-500',
        title: '[STEP 5] She buys. Gets her order. Loves it.',
        description: 'Three days later — a WhatsApp message.',
        images: [
          { src: '/img10.jpg', label: 'WhatsApp Retention Flow', badge: '[SCREENSHOT — WhatsApp retention flow]' },
        ],
        outro: 'She comes back.',
      },
    ],
    growthTimeline: [
      { period: 'HOUR 1', value: '500 clicks', color: 'bg-primary' },
      { period: 'DAY 1', value: '2.5L views', color: 'bg-green-500' },
      { period: 'DAY 1', value: '7 customers', color: 'bg-purple-500' },
    ],
    dashboardImage: '/img11.jpg',
    whyItWorked: {
      title: 'We thought about the customer the entire time.',
      points: [
        'What would make her stop scrolling?',
        'What would make her trust?',
        'What would answer that last question?',
      ],
      conclusion: "That's the whole job.",
      quote: "We're not here to make beautiful campaigns. We're here to make sure she buys — and comes back.",
    },
    cta: {
      title: 'Think this could work for your brand?',
      buttonText: 'Book a Call',
      note: 'Minimum ₹5L marketing budget',
    },
  },
  'case-study-4': {
    brandName: 'App Launch',
    badge: 'CASE STUDY',
    brandBadge: 'APP',
    headline: '₹8L MRR in 90 Days',
    description: "A senior developer spent 8 months building a consumer app. Zero marketing. Zero paying users. We fixed that.",
    brandStory: {
      icon: '📱',
      title: 'This is an App Launch.',
      description: 'A developer with a great product but no marketing experience. We repositioned and launched.',
    },
    metrics: [
      { icon: '📈', value: '₹0→₹8L', label: 'Revenue' },
      { icon: '⏱️', value: '90 Days', label: 'Timeframe' },
      { icon: '🎯', value: 'Positioning', label: 'Fix' },
      { icon: '💰', value: 'MRR', label: 'Model' },
    ],
    funnelIntro: {
      title: "Here's The Sales Funnel We Built That The Customer Experienced",
      story: "Meet Priya. She's scrolling Instagram on a Tuesday night. Tired. Half-paying attention.",
      hook: "Then she sees an ad.",
    },
    steps: [
      {
        number: 1,
        tag: 'PERFORMANCE ADS',
        tagColor: 'text-primary',
        title: 'Ads We Created ✨',
        images: [
          { src: '/img1.jpg', label: 'Reels Ad', badge: 'Reels Ad', duration: '0:22' },
          { src: '/img2.jpg', label: 'Feed Ad', badge: 'Feed Ad', duration: '0:38' },
        ],
        description: "It doesn't feel like an ad. It feels like someone is talking directly to her problem. She stops scrolling.",
      },
      {
        number: 2,
        tag: 'LANDING PAGE',
        tagColor: 'text-purple-500',
        title: 'Landing Page We Created ✨',
        intro: 'She clicks. Lands on a page.',
        images: [
          { src: '/img3.jpg', label: 'Hero Section', badge: 'Above the Fold' },
        ],
        description: 'The page doesn\'t overwhelm her. It answers exactly the one question in her head.',
      },
      {
        number: 3,
        tag: 'WHATSAPP AUTOMATION',
        tagColor: 'text-green-500',
        title: 'Whatsapp Automations ✨',
        intro: "She's interested. But she hasn't buy yet.",
        highlight: '5 mins later, she receives a whatsapp.',
        images: [
          { src: '/img7.jpg', label: 'WhatsApp Video Message', badge: '[SCREENSHOT — WhatsApp video message]' },
        ],
        description: 'We show up on WhatsApp. Not with a discount. With a short video.',
      },
      {
        number: 4,
        tag: 'EMAIL',
        tagColor: 'text-orange-500',
        intro: '45 mins later —',
        description: 'an email. Not a newsletter.',
        images: [
          { src: '/img8.jpg', label: 'Email Campaign', badge: '[SCREENSHOT — email]' },
        ],
      },
      {
        number: 5,
        tag: 'AI SALES CALL',
        tagColor: 'text-blue-500',
        title: "Here's The AI Sales Call Automation We Built —",
        images: [
          { src: '/img9.jpg', label: 'AI Call Recording', badge: '[Play the actual AI call recording here]' },
        ],
        salesScript: [
          { step: 'Open', description: 'Acknowledge her exact hesitation from the ad she clicked' },
          { step: 'Bridge', description: 'Introduce the product as a solution she already considered' },
          { step: 'Social proof', description: 'Someone like her — same concern, now a happy customer' },
          { step: 'Close', description: 'One clear, low-pressure next step' },
        ],
        description: 'Not a spam call. Not a robotic voice.',
      },
      {
        number: 6,
        tag: 'ORDER BUMP',
        tagColor: 'text-pink-500',
        title: '[STEP 4] She goes back. Adds to cart.',
        description: 'Right before she pays — one small thing appears.',
        orderBump: {
          title: 'Add Complementary Product',
          subtitle: 'Customers who bought this also love...',
        },
      },
      {
        number: 7,
        tag: 'RETENTION & REPEAT',
        tagColor: 'text-teal-500',
        title: '[STEP 5] She buys. Gets her order. Loves it.',
        description: 'Three days later — a WhatsApp message.',
        images: [
          { src: '/img10.jpg', label: 'WhatsApp Retention Flow', badge: '[SCREENSHOT — WhatsApp retention flow]' },
        ],
        outro: 'She comes back.',
      },
    ],
    growthTimeline: [
      { period: 'BEFORE', value: '₹0 revenue', color: 'bg-primary' },
      { period: 'DAY 30', value: '₹2L MRR', color: 'bg-green-500' },
      { period: 'DAY 90', value: '₹8L MRR', color: 'bg-purple-500' },
    ],
    dashboardImage: '/img11.jpg',
    whyItWorked: {
      title: 'We thought about the customer the entire time.',
      points: [
        'What would make her stop scrolling?',
        'What would make her trust?',
        'What would answer that last question?',
      ],
      conclusion: "That's the whole job.",
      quote: "We're not here to make beautiful campaigns. We're here to make sure she buys — and comes back.",
    },
    cta: {
      title: 'Think this could work for your brand?',
      buttonText: 'Book a Call',
      note: 'Minimum ₹5L marketing budget',
    },
  },
};

interface CaseStudyStep {
  number: number;
  tag: string;
  tagColor: string;
  title?: string;
  intro?: string;
  highlight?: string;
  images?: Array<{ src: string; label: string; badge?: string; duration?: string }>;
  description?: string;
  outro?: string;
  salesScript?: Array<{ step: string; description: string }>;
  orderBump?: { title: string; subtitle: string };
  transition?: string;
}

interface CaseStudyData {
  brandName: string;
  badge: string;
  brandBadge: string;
  headline: string;
  description: string;
  brandStory: {
    icon: string;
    title: string;
    description: string;
  };
  metrics: Array<{ icon: string; value: string; label: string }>;
  funnelIntro: {
    title: string;
    story: string;
    hook: string;
  };
  steps: CaseStudyStep[];
  growthTimeline: Array<{ period: string; value: string; color: string }>;
  dashboardImage: string;
  whyItWorked: {
    title: string;
    points: string[];
    conclusion: string;
    quote: string;
  };
  cta: {
    title: string;
    buttonText: string;
    note: string;
  };
}

// Scrollable Image Gallery Component
function ImageGallery({ images }: { images: Array<{ src: string; label: string; badge?: string; duration?: string }> }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -containerWidth : containerWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full snap-center px-2"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-pink-400 mx-auto max-w-sm">
              <img
                src={image.src}
                alt={image.label}
                className="w-full h-auto object-contain"
              />
             
              {/* Duration */}
              {image.duration && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {image.duration}
                </div>
              )}
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <span className="text-white text-sm font-medium">{image.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-gray-300" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaseStudyPage() {
  const params = useParams();
  const slug = params.slug as string;

  const caseStudy = caseStudiesData[slug];

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Case Study Not Found</h1>
          <Link href="/#case-studies" className="text-primary hover:underline">
            ← Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/#case-studies"
            className="flex items-center text-primary font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Link>
          <div className="text-center">
            <div className="font-semibold text-foreground">Case Study</div>
            <div className="text-xs text-text-muted">{caseStudy.brandName} · Yuvichaar</div>
          </div>
          <button className="text-text-muted hover:text-foreground">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Tags */}
        <div 
          className="pb-2 -mx-4 px-4 -mt-6 pt-6"
          style={{
            background: 'linear-gradient(to bottom, rgba(253, 244, 255, 0.8) 0%, rgba(236, 254, 255, 0.6) 30%, rgba(255, 255, 255, 0) 100%)'
          }}
        >
          <div className="flex gap-2 mb-3">
          <span className="px-3 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full">
            {caseStudy.badge}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
            {caseStudy.brandBadge}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-4xl font-bold text-foreground  pr-12 ">
          {caseStudy.headline}
        </h1>

        </div>
       
        {/* Description */}
        <p className="text-text-secondary mb-12">
          {caseStudy.description}
        </p>

        {/* Brand Story Box */}
        <div className="bg-white dark:bg-background-secondary rounded-xl border-gray-300 p-6 mb-10">
          <div className="flex items-start gap-3">
            <span className="text-xl">{caseStudy.brandStory.icon}</span>
            <div>
              <h3 className="font-bold text-sm text-foreground">{caseStudy.brandStory.title}</h3>
              <p className="text-[10px] font-semibold text-text-secondary mt-1">
                {caseStudy.brandStory.description}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold text-text-muted tracking-wider">THE RESULT</span>
            {/* <span className="text-xs text-primary flex items-center">
              Scroll to explore <ArrowRight className="w-3 h-3 ml-1" />
            </span> */}
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {caseStudy.metrics.map((metric, index) => (
              <div key={index} className="flex-shrink-0 text-center min-w-[80px]">
                <div className="text-2xl mb-1">{metric.icon}</div>
                <div className="text-lg font-bold text-pink-600">{metric.value}</div>
                <div className="text-xs text-text-muted">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent my-8" />

        {/* Sales Funnel Section */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-primary tracking-wider">THE SALES FUNNEL</span>
        </div>

        <h2 className="text-4xl sm:text-3xl font-extrabold text-foreground pr-10 mb-4">
          {caseStudy.funnelIntro.title}
        </h2>
            <div className='border-4 border-transparent rounded-xl shadow-lg p-3 mb-12'>
               <p className="text-text-secondary  mb-2">
          {caseStudy.funnelIntro.story}
        </p>
        <p className="text-foreground font-semibold mb-8">
          {caseStudy.funnelIntro.hook}
        </p>
            </div>
       

        {/* Steps */}
        {caseStudy.steps.map((step, index) => (
          <div key={index}>
          <div className="mb-2 p-4 border-transparent shadow-sm rounded-xl">
            {/* Step Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                {step.number}
              </div>
              <span className={`text-[10px]  font-semibold border-transparent bg-fuchsia-100 rounded-xl p-1.5 tracking-wider ${step.tagColor}`}>
                {step.tag}
              </span>
            </div>

            {/* Intro */}
            {step.intro && (
              <p className="text-text-secondary text-xs mb-2">{step.intro}</p>
            )}

            {/* Highlight */}
            {step.highlight && (
              <p className="text-foreground text-xs font-semibold mb-4">{step.highlight}</p>
            )}

            {/* Title */}
            {step.title && (
              <h3 className="text-sm font-semibold text-foreground mb-4 pr-2 ">{step.title}</h3>
            )}

            {/* Images */}
            {step.images && step.images.length > 0 && (
              <div className="mb-4">
                <ImageGallery images={step.images} />
              </div>
            )}

            {/* Description */}
            {step.description && (
              <p className="text-text-secondary text-xs mb-2">{step.description}</p>
            )}

            {/* Sales Script Table */}
            {step.salesScript && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mt-4 mb-4">
                <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wider mb-3">
                  SALES SCRIPT (ANNOTATED)
                </h4>
                <div className="space-y-2">
                  {step.salesScript.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <span className="text-primary font-medium text-sm min-w-[80px]">{item.step}</span>
                      <span className="text-text-secondary text-sm">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Bump */}
            {step.orderBump && (
              <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 mt-4 mb-4">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 tracking-wider mb-2">
                  [SCREENSHOT — ORDER BUMP]
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{step.orderBump.title}</h4>
                    <p className="text-sm text-text-muted">{step.orderBump.subtitle}</p>
                  </div>
                  <button className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Outro */}
            {step.outro && (
              <p className="text-foreground font-semibold mt-4">{step.outro}</p>
            )}
          </div>
          
          {/* Transition text between steps */}
          {step.transition && (
            <div className="text-text-muted text-sm italic py-4 pl-1 text-left">
              {step.transition}
            </div>
          )}
        </div>
        ))}

        {/* The Numbers Section */}
        <div className="text-center mb-6">
          <span className="text-sm">📊</span>
          <span className="text-xs font-semibold text-primary tracking-wider ml-2">THE NUMBERS</span>
        </div>

        {/* Growth Timeline */}
        <div className="mb-8">
          <h4 className="text-xs font-semibold text-text-muted tracking-wider mb-4">GROWTH TIMELINE</h4>
          <div className="space-y-3">
            {caseStudy.growthTimeline.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <div>
                  <span className="text-xs text-primary font-semibold">{item.period}</span>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-text-secondary mt-4">Profitable at every single step.</p>
        </div>

        {/* Dashboard Screenshot */}
        <div className="mb-8">
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={caseStudy.dashboardImage}
              alt="Campaign Dashboard"
              className="w-full"
            />
            <div className="bg-black/80 p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-white text-sm font-medium">Campaign Dashboard</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">[SCREENSHOT — campaign dashboard]</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent my-8" />

        {/* Why This Worked Section */}
        <div className="text-center mb-6">
          <span className="text-sm">✨</span>
          <span className="text-xs font-semibold text-primary tracking-wider ml-2">WHY THIS WORKED</span>
        </div>

        <div className="border-l-4 border-primary pl-4 mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">
            {caseStudy.whyItWorked.title}
          </h3>
          <ul className="space-y-2 mb-4">
            {caseStudy.whyItWorked.points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-text-secondary">{point}</span>
              </li>
            ))}
          </ul>
          <p className="font-semibold text-foreground mb-4">{caseStudy.whyItWorked.conclusion}</p>
          <div className="bg-gray-50 dark:bg-background-secondary rounded-lg p-4">
            <p className="text-text-secondary italic">{caseStudy.whyItWorked.quote}</p>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(180deg, #E91E8C 0%, #9C27B0 100%)',
          }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            {caseStudy.cta.title}
          </h3>
          <button className="bg-white text-primary font-semibold px-8 py-3 rounded-full flex items-center justify-center mx-auto hover:bg-gray-50 transition-colors">
            {caseStudy.cta.buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <p className="text-white/70 text-sm mt-4">{caseStudy.cta.note}</p>
        </div>
      </main>

      {/* Footer Spacing */}
      <div className="h-16" />
    </div>
  );
}
