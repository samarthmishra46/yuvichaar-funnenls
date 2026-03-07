import { Search, Video, BarChart3, Layout, Bot, Heart, Play } from 'lucide-react';

interface Service {
  number: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  video?: string;
  videoLabel?: string;
  stat?: { value: string; subtext: string; label: string };
}

const services: Service[] = [
  {
    number: '01',
    icon: <Search className="w-5 h-5" />,
    category: 'Research and strategy',
    title: 'We Study Your Market Before We Touch A Camera',
    description:
      'Before we create a single ad, our team goes deep. We reverse-engineer your top competitors — their ads, their angles, their user journey, everything.',
    video: '/service-video-1.mp4',
    videoLabel: 'WhatsApp Video Message',
    stat: { value: '100% data-', subtext: 'driven', label: "GTM strategy built on what's actually working in your category right now — not gut feeling." },
  },
  {
    number: '02',
    icon: <Video className="w-5 h-5" />,
    category: 'Creative Production',
    title: 'We Make Ads That Actually Stop The Scroll',
    description:
      'Our 30-person in-house creative team — writers, DOPs, directors, and world-class models — produces premium, research-backed video ads. Shot on Netflix-approved cameras.',
    video: '/service-video-2.mp4',
    videoLabel: 'Ad Creative Preview',
    stat: { value: '2,500+', subtext: 'Ads Created', label: 'We know what hooks, what converts, and what dies in 2 seconds.' },
  },
  {
    number: '03',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'Performance Marketing',
    title: 'We Put Those Ads In Front Of The Right Eyeballs',
    description:
      'Our seasoned performance marketing team publishes your content on Meta (Facebook + Instagram) and Google — targeting your exact audience.',
    video: '/service-video-3.mp4',
    videoLabel: 'Campaign Dashboard',
    stat: { value: '₹60Cr+', subtext: 'Ad Spend', label: 'Day one, real traffic. Real clicks. Real intent.' },
  },
  {
    number: '04',
    icon: <Layout className="w-5 h-5" />,
    category: 'Tech & Funnel',
    title: 'They Click. Your Landing Page Closes Them.',
    description:
      "The page they land on doesn't just look good — it works like a digital salesperson on commission. One-click upsells that bump average order values by 25%+.",
    video: '/service-video-4.mp4',
    videoLabel: 'Landing Page Demo',
  },
  {
    number: '05',
    icon: <Bot className="w-5 h-5" />,
    category: 'AI Follow-Up Systems',
    title: "They Didn't Buy Yet? We Don't Give Up.",
    description:
      'Automated WhatsApp video sequences, email follow-ups, and AI-powered sales calls that go out without you lifting a finger.',
    video: '/service-video-5.mp4',
    videoLabel: 'AI Assistant Demo',
    stat: { value: '15%', subtext: 'Revenue', label: 'On average, our clients recover 15% more revenue.' },
  },
  {
    number: '06',
    icon: <Heart className="w-5 h-5" />,
    category: 'Retention & Repeat',
    title: 'First Purchase Is Just The Beginning.',
    description:
      'Every customer who buys gets pulled into a WhatsApp community with exclusive offers, brand stories, and loyalty touchpoints.',
    video: '/service-video-6.mp4',
    videoLabel: 'Community Preview',
    stat: { value: '↑LTV', subtext: 'Repeat', label: "A brand that sells once isn't a brand." },
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card-bg rounded-2xl border border-border p-6 card-shadow hover:card-shadow-hover transition-shadow duration-300"
            >
              {/* Service Badge & Category Tag */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-background-secondary border border-border rounded-lg text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Service {service.number}
                </span>
                <span className="px-3 py-1.5 bg-background-secondary border border-border rounded-full text-xs text-text-secondary">
                  {service.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-3">{service.title}</h3>

              {/* Description */}
              <p className="text-sm text-text-secondary mb-5">{service.description}</p>

              {/* Video Player Section */}
              {service.video && (
                <div className="mb-4">
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10">
                    <div className="flex items-center">
                      {/* Video Preview */}
                      <div className="flex-1 p-4">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
                          <img
                            src={`/service-thumbnail-${service.number}.jpg`}
                            alt={service.videoLabel}
                            className="w-full h-full object-cover"
                          />
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 text-foreground ml-1" fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                    
                  </div>
                </div>
              )}

              {/* Stat Section */}
              {service.stat && (
                <div className="pt-4 border-t border-border">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-xl font-bold text-primary leading-tight">{service.stat.value}</div>
                      <div className="text-xl font-bold text-primary leading-tight">{service.stat.subtext}</div>
                      <div className="text-[10px] text-text-muted mt-1">No guesswork</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-secondary">{service.stat.label}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
