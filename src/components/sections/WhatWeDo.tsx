import { Check, ArrowRight, Play } from 'lucide-react';
import { ReactElement } from 'react';

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
      { thumbnail: '/service-video-1.jpg', label: 'Family Legacy Hook', category: 'Awareness' },
      { thumbnail: '/service-video-2.jpg', label: 'Product Demo Reel', category: 'Consideration' },
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
      { thumbnail: '/service-video-3.jpg', label: 'Campaign Dashboard', category: 'Analytics' },
      { thumbnail: '/service-video-4.jpg', label: 'Performance Report', category: 'Results' },
    ],
    portfolioLink: '#case-studies',
    link: (
      <>
        View Case Studies
        <ArrowRight className="w-4 h-4 ml-1 inline" />
      </>
    ),
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
      { thumbnail: '/service-video-5.jpg', label: 'Landing Page Demo', category: 'Design' },
    ],
    portfolioLink: '/portfolio',
    link: (
      <>
        View Portfolio
        <ArrowRight className="w-4 h-4 ml-1 inline" />
      </>
    ),
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
      { thumbnail: '/service-video-7.jpg', label: 'AI Assistant Demo', category: 'Automation' },
      { thumbnail: '/service-video-8.jpg', label: 'WhatsApp Flow', category: 'Follow-up' },
    ],
    portfolioLink: '#case-studies',
    link: (
      <>
        View Case Studies
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
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
              What Exactly Do We Do
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              We Turn Scrollers Into Paying Customers.
            </h2>
          </div>
          <div className="lg:text-right lg:self-end">
            <p className="text-text-secondary max-w-md lg:ml-auto">
              A complete, end-to-end growth system — from research and creative to media buying,
              funnel tech, and retention.
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
              <div className="absolute -top-4 left-1/3 -translate-x-1/4 flex items-center bg-badge-purple-bg rounded-full  border border-purple-200 dark:border-purple-800">
                <span className="px-2 py-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Service {service.number}
                </span>
                <span className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-[10px] font-semibold">
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
                      <div className="flex -space-x-2 ml-2">
                        <div className="w-6 h-6 rounded-full bg-purple-400 border-2 border-card-bg"></div>
                        <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-card-bg"></div>
                        <div className="w-6 h-6 rounded-full bg-fuchsia-400 border-2 border-card-bg"></div>
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
              <div className={`flex gap-4 mb-4 ${service.videos.length === 1 ? 'justify-center' : ''}`}>
                {service.videos.map((video, idx) => (
                  <div key={idx} className={service.videos.length === 1 ? 'w-1/2' : 'flex-1'}>
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-purple-600 via-fuchsia-500 to-pink-500 aspect-[9/16] max-h-48">
                      <img
                        src={video.thumbnail}
                        alt={video.label}
                        className="w-full h-full object-cover opacity-60"
                      />
                      {/* Category Badge */}
                      <span className="absolute bottom-12 left-2 px-2 py-1 bg-primary text-white text-[8px] font-semibold rounded">
                        {video.category}
                      </span>
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                        </button>
                      </div>
                      {/* Label */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium truncate">{video.label}</p>
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
    </section>
  );
}
