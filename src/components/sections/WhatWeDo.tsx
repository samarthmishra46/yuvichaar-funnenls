import { Check, ArrowRight, Play } from 'lucide-react';
import { ReactElement } from 'react';
import { CTAWithIdealFor } from '../CTAButton';
interface ServiceFeature {
  text: string;
  highlight?: string;
  badge?: string;
  avatars?: boolean;
}

interface ServiceVideo {
  thumbnail: string;
  label: string;
  category: string;
}

interface Service {
  number: string;
  category: string;
  title: string;
  features: ServiceFeature[];
  videos: ServiceVideo[];
  portfolioLink?: string;
  link ?: any;
}

const services: Service[] = [
  {
    number: '01',
    category: 'Creative Production',
    title: 'We Make World Class Content For Ads',
    features: [
      { text: '30 Person', highlight: 'Creative Team' },
      { text: 'World Class', highlight: 'Models & Influencers', avatars: true },
      { text: 'Shot On', highlight: 'Netflix Approved Cameras', badge: 'NETFLIX' },
      { text: '2500+ Ads Produced,', highlight: '150Cr+ Revenue Generated 💰' },
    ],
    videos: [
      { thumbnail: 'https://res.cloudinary.com/dvxqb1wge/image/upload/v1755359134/go_wheelo_quqgxp.gif', label: 'Family Legacy Hook', category: 'Awareness' },
      { thumbnail: 'https://res.cloudinary.com/dvxqb1wge/image/upload/v1755506027/fictales_rim5pq.gif', label: 'Product Demo Reel', category: 'Consideration' },
    ],
    portfolioLink: '/portfolio',
    link: (
  <>
    View Entire Portfolio
    <ArrowRight className="w-4 h-4 ml-1 inline" />
  </>
),
  },
  {
    number: '02',
    category: 'Performance Marketing',
    title: 'We Put Ads In Front Of Right Eyeballs',
    features: [
      { text: '₹60Cr+', highlight: 'Ad Spend Managed' },
      { text: 'Meta &', highlight: 'Google Certified Team' },
      { text: 'Real-time', highlight: 'Campaign Optimization' },
      { text: 'Data-driven', highlight: 'Audience Targeting 🎯' },
    ],
    videos: [
      { thumbnail: 'https://res.cloudinary.com/dvxqb1wge/image/upload/v1773401598/Rectangle_34626407_sxfu9c.png', label: 'Campaign Dashboard', category: 'Analytics' },
    ],
    portfolioLink: '#case-studies',
   
  },
  {
    number: '03',
    category: 'Tech & Smart Websties ',
    title: 'Landing Pages That Convert Like Crazy',
    features: [
      { text: 'High-Converting', highlight: 'Landing Pages' },
      { text: 'One-Click', highlight: 'Upsells & Bumps' },
      { text: '25%+', highlight: 'Higher AOV' },
      { text: 'Mobile-First', highlight: 'Checkout Experience 📱' },
    ],
    videos: [
      { thumbnail: 'https://res.cloudinary.com/dvxqb1wge/image/upload/v1773400862/image_3006_1_noyubh.png', label: 'Landing Page Demo', category: 'Design' },
    ],
    portfolioLink: '/portfolio',
    
  },
  {
    number: '04',
    category: 'AI Follow Ups & CRM',
    title: "They Didn't Buy? We Don't Give Up.",
    features: [
      { text: 'Automated', highlight: 'WhatsApp Sequences' },
      { text: 'AI-Powered', highlight: 'Sales Calls' },
      { text: 'Smart', highlight: 'Email Follow-ups' },
      { text: '15%', highlight: 'More Revenue Recovered 🤖' },
    ],
    videos: [
      { thumbnail: 'https://res.cloudinary.com/dvxqb1wge/image/upload/v1773401418/Screenshot_from_2026-03-13_16-54-46_vtrq7d.png', label: 'AI Assistant Demo', category: 'Automation' },
    ],
    portfolioLink: '#case-studies',
    link: (
      <>
        Listen AI Sales Call Recording
        <ArrowRight className="w-4 h-4 ml-1 inline" />
      </>
    ),
  },
];


export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-6">
              OUR SERVICES
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-foreground">
              What Exactly We Do?
            </h2>
          </div>
          <div className="lg:text-right lg:self-end">
            <p className="text-text-secondary  max-w-md lg:ml-auto">
             We Build End To <span className='font-bold'> End Sales Funnels & <br /> Customer Journeys </span>To Turn People Scrolling On <br />Instagram & Facebook Into Paying <br /> Customers <span className='font-bold'> Repeatedly & Predictably </span>
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="relative bg-card-bg rounded-2xl border border-border p-6 pt-10 card-shadow hover:card-shadow-hover transition-shadow duration-300"
            >
              {/* Service Badge - Positioned in center of top border */}
              <div className="absolute -top-4 left-1/2 flex w-[260px] -translate-x-1/2 items-center justify-between whitespace-nowrap rounded-full border border-purple-200 bg-badge-purple-bg dark:border-purple-800">
                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 sm:text-[10px]">
                  Service {service.number}
                </span>
                <span className="rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white sm:px-4 sm:text-[10px]">
                  {service.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-4 mt-2">{service.title}</h3>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-text-secondary">
                      {feature.text}{' '}
                      <span className="font-semibold text-foreground">{feature.highlight}</span>
                    </span>
                    {feature.avatars && (
                      <div className="ml-2 flex -space-x-2">
                        <div className="h-6 w-6 overflow-hidden rounded-full border-2 border-card-bg">
                          <img
                            src="https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png"
                            alt="Team member"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="h-6 w-6 overflow-hidden rounded-full border-2 border-card-bg">
                          <img
                            src="https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png"
                            alt="Team member"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="h-6 w-6 overflow-hidden rounded-full border-2 border-card-bg">
                          <img
                            src="https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png"
                            alt="Team member"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {feature.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                        {feature.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Phone Mockups */}
              <div
                className="mb-4 grid gap-4"
                style={{ gridTemplateColumns: `repeat(${service.videos.length}, minmax(0, 1fr))` }}
              >
                {service.videos.map((video, idx) => (
                  <div key={idx} className="min-w-0">
                    <div className="relative rounded-2xl overflow-hidden  ">
                      <img
                        src={video.thumbnail}
                        alt={video.label}
                        className="w-full h-full object-contain "
                      />
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                        </button>
                      </div>
                      {/* Label */}
                      <div className="absolute bottom-2 left-2 right-2">
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Portfolio Link */}
              {service.portfolioLink && (
                <a
                  href={service.portfolioLink}
                  className="flex items-center justify-center text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  {service.link}
                  
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <CTAWithIdealFor className='pt-10 p-4'/>
    </section>
  );
}
