import { ArrowRight } from 'lucide-react';

interface CaseStudy {
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
    badge: 'Case Study',
    badgeColor: 'pink',
    image: '/case-study-1.jpg',
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
    badge: 'Case Study',
    badgeColor: 'purple',
    image: '/case-study-2.jpg',
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
  return (
    <section id="case-studies" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
              Case Studies
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              Real Brands. Real Results.
            </h2>
          </div>
          <div className="lg:text-right lg:self-end">
            <p className="text-text-secondary max-w-md lg:ml-auto">
              From first product launch to ₹45L months — we've done it across categories.
            </p>
          </div>
        </div>

        {/* Case Study Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="bg-card-bg rounded-2xl border border-border overflow-hidden card-shadow hover:card-shadow-hover transition-shadow duration-300"
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
                
                {/* Case Study Badge (top left) */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${badgeColors[study.badgeColor]}`}>
                    {study.badge}
                  </span>
                  <span className="ml-2 px-2 py-1.5 rounded-lg bg-primary text-white text-xs font-bold">
                    D2C
                  </span>
                </div>

                {/* Stats Badges (scattered on image) */}
                <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end max-w-[60%]">
                  {study.imageBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${badge.color} shadow-md`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {study.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-background-secondary border border-border text-xs text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Headline */}
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {study.headline}{' '}
                  <span className="text-lg lg:text-xl font-normal text-text-muted">
                    {study.subheadline}
                  </span>
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm mt-2 mb-4">{study.description}</p>

                {/* Metrics Row */}
                <div className="flex gap-3 mb-4">
                  {study.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-background-secondary rounded-xl p-3 text-center"
                    >
                      {metric.label && (
                        <div className="text-[10px] text-text-muted mb-0.5">{metric.label}</div>
                      )}
                      <div className="text-xs font-semibold text-foreground">{metric.value}</div>
                    </div>
                  ))}
                </div>

                {/* View Case Study Link */}
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  View Case Study
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
