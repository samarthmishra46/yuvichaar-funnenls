import { TrendingUp, ShoppingCart, Eye, RefreshCw } from 'lucide-react';

interface CaseStudy {
  badge: string;
  badgeColor: 'pink' | 'purple' | 'green' | 'blue';
  icon: React.ReactNode;
  headline: string;
  subheadline: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  tags: string[];
}

const caseStudies: CaseStudy[] = [
  {
    badge: 'MANUFACTURER → D2C',
    badgeColor: 'pink',
    icon: <TrendingUp className="w-5 h-5" />,
    headline: '₹45 Lakhs',
    subheadline: 'in a Single Month',
    description:
      "A manufacturer's son took his family's offline product online. Shipped us the product.",
    metrics: [
      { label: 'Week 1', value: '300+ units' },
      { label: 'Month 1', value: '₹13 Lakhs' },
      { label: 'Month 7', value: '₹45 Lakhs' },
    ],
    tags: ['Ads', 'Landing Page', 'AI Automations'],
  },
  {
    badge: 'FIRST-TIME FOUNDER',
    badgeColor: 'purple',
    icon: <ShoppingCart className="w-5 h-5" />,
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
    badge: 'BRAND NEW LAUNCH',
    badgeColor: 'green',
    icon: <Eye className="w-5 h-5" />,
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
    badge: 'TECH FOUNDER',
    badgeColor: 'blue',
    icon: <RefreshCw className="w-5 h-5" />,
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
  pink: 'bg-badge-pink-bg text-badge-pink-text border-primary/20',
  purple: 'bg-badge-purple-bg text-badge-purple-text border-secondary/20',
  green: 'bg-success-light text-success border-success/20',
  blue: 'bg-badge-purple-bg text-badge-purple-text border-secondary/20',
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
              className="bg-card-bg rounded-2xl border border-border p-6 card-shadow hover:card-shadow-hover transition-shadow duration-300"
            >
              {/* Badge & Icon */}
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColors[study.badgeColor]}`}
                >
                  {study.badge}
                </span>
                <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center text-text-muted">
                  {study.icon}
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                {study.headline}
              </h3>
              <p className="text-text-muted text-sm mb-4">{study.subheadline}</p>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-6">{study.description}</p>

              {/* Metrics */}
              <div className="flex flex-wrap gap-3 mb-4">
                {study.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="flex-1 min-w-[100px] bg-background-secondary rounded-xl p-3 text-center"
                  >
                    <div className="text-xs text-text-muted mb-1">{metric.label}</div>
                    <div className="text-sm font-semibold text-foreground">{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {study.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-background-secondary border border-border text-xs text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
