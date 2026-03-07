import { Search, Video, BarChart3, Layout, Bot, Heart } from 'lucide-react';

interface Service {
  number: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  stat?: { value: string; label: string };
}

const services: Service[] = [
  {
    number: '01',
    icon: <Search className="w-5 h-5" />,
    category: 'Research & Strategy',
    title: 'We Study Your Market Before We Touch A Camera',
    description:
      'Before we create a single ad, our team goes deep. We reverse-engineer your top competitors — their ads, their angles, their user journey, everything.',
    stat: { value: '100%', label: 'Data-driven GTM strategy built on what\'s actually working in your category right now.' },
  },
  {
    number: '02',
    icon: <Video className="w-5 h-5" />,
    category: 'Creative Production',
    title: 'We Make Ads That Actually Stop The Scroll',
    description:
      'Our 30-person in-house creative team — writers, DOPs, directors, and world-class models — produces premium, research-backed video ads. Shot on Netflix-approved cameras.',
    stat: { value: '2,500+', label: 'We know what hooks, what converts, and what dies in 2 seconds.' },
  },
  {
    number: '03',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'Performance Marketing',
    title: 'We Put Those Ads In Front Of The Right Eyeballs',
    description:
      'Our seasoned performance marketing team publishes your content on Meta (Facebook + Instagram) and Google — targeting your exact audience.',
    stat: { value: '₹60Cr+', label: 'Ad Spend Managed. Day one, real traffic. Real clicks. Real intent.' },
  },
  {
    number: '04',
    icon: <Layout className="w-5 h-5" />,
    category: 'Tech & Funnel',
    title: 'They Click. Your Landing Page Closes Them.',
    description:
      "The page they land on doesn't just look good — it works like a digital salesperson on commission. One-click upsells that bump average order values by 25%+.",
  },
  {
    number: '05',
    icon: <Bot className="w-5 h-5" />,
    category: 'AI Follow-Up Systems',
    title: "They Didn't Buy Yet? We Don't Give Up.",
    description:
      'Automated WhatsApp video sequences, email follow-ups, and AI-powered sales calls that go out without you lifting a finger.',
    stat: { value: '15%', label: 'Revenue Recovered. On average, our clients recover 15% more revenue.' },
  },
  {
    number: '06',
    icon: <Heart className="w-5 h-5" />,
    category: 'Retention & Repeat',
    title: 'First Purchase Is Just The Beginning.',
    description:
      'Every customer who buys gets pulled into a WhatsApp community with exclusive offers, brand stories, and loyalty touchpoints.',
    stat: { value: '↑LTV', label: "Repeat Customers. A brand that sells once isn't a brand." },
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
              {/* Icon & Number */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-badge-purple-bg flex items-center justify-center text-secondary">
                  {service.icon}
                </div>
                <span className="text-4xl font-bold text-background-tertiary">{service.number}</span>
              </div>

              {/* Category */}
              <div className="text-xs font-semibold tracking-wider text-text-muted uppercase mb-2">
                {service.category}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-3">{service.title}</h3>

              {/* Description */}
              <p className="text-sm text-text-secondary mb-4">{service.description}</p>

              {/* Stat */}
              {service.stat && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-primary">{service.stat.value}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">{service.stat.label}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
