'use client';

import { TrendingUp, Users, DollarSign } from 'lucide-react';

const stats = [
  { icon: TrendingUp, value: '₹60Cr+', label: 'Ad Spend Managed' },
  { icon: Users, value: '50+', label: 'Brands Scaled' },
  { icon: DollarSign, value: '₹150Cr+', label: 'Revenue Generated' },
];

const brands = [
  'SharkTank Co.',
  'VC Backed Brand',
  'D2C Unicorn',
  'Bootstrapped ✓',
  'Series A',
  'PhysicsWallah',
];

const founders = [
  { color: 'bg-purple-500' },
  { color: 'bg-violet-400' },
  { color: 'bg-fuchsia-400' },
  { color: 'bg-pink-300' },
];

export default function Hero() {
  return (
    <section className="pt-24 pb-16 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-badge-pink-bg border border-primary/20">
              <span className="w-2 h-2 rounded-sm bg-primary mr-2"></span>
              <span className="text-xs font-semibold tracking-wide text-badge-pink-text uppercase">
                AI-Enabled Growth Partners for D2C Founders
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Go From Zero to 1,000 Paying Customers in 60 Days.
            </h1>

            {/* Description */}
            <p className="text-lg text-text-secondary max-w-lg">
              AI-enabled Marketing & Growth Partners For Ambitious Founders Building{' '}
              <span className="font-semibold text-foreground">₹100Cr D2C Brands.</span> We turn
              Instagram and Facebook scrollers into paying customers — and keep them coming back.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#cta"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm uppercase tracking-wide hover:bg-primary-hover transition-colors duration-200 shadow-lg shadow-primary/25"
              >
                Book a Free Strategy Call
              </a>
              <a
                href="#case-studies"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-card-bg border border-border text-foreground font-semibold text-sm hover:bg-background-secondary transition-colors duration-200"
              >
                See Case Studies
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-badge-pink-bg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Trust & Stats Card */}
          <div className="lg:pl-8">
            <div className="bg-card-bg rounded-2xl border border-border p-6 space-y-6 card-shadow">
              {/* Founders Trust */}
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {founders.map((founder, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full ${founder.color} border-2 border-card-bg`}
                    ></div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">50+ Founders trust us</div>
                  <div className="text-xs text-text-muted">across India & UK</div>
                </div>
              </div>

              {/* Brands Worked With */}
              <div>
                <div className="text-xs font-semibold tracking-wider text-text-muted uppercase mb-3">
                  Brands We've Worked With
                </div>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-background-secondary border border-border text-xs font-medium text-text-secondary"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hero Image - Desktop Only (above stats) */}
              <div className="hidden lg:block relative rounded-xl overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dix4pzu0k/image/upload/v1772895980/Frame_11_yzhy6m.png"
                  alt="Behind the scenes"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card-bg/80 to-transparent"></div>
              </div>

              {/* Revenue Stats - Desktop Only */}
              <div className="hidden lg:block space-y-4 pt-2">
                <div className="bg-badge-pink-bg rounded-xl p-4 border-l-4 border-primary">
                  <div className="text-3xl font-bold text-primary">₹45L</div>
                  <div className="text-xs text-text-muted">Single-month revenue (1 client)</div>
                </div>
                <div className="bg-badge-pink-bg rounded-xl p-4 border-l-4 border-primary">
                  <div className="text-3xl font-bold text-primary">2.5L</div>
                  <div className="text-xs text-text-muted">Views on day 1 launch</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Hero Image Section */}
        <div className="lg:hidden relative mt-12">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://res.cloudinary.com/dix4pzu0k/image/upload/v1772895980/Frame_11_yzhy6m.png"
              alt="Behind the scenes"
              className="w-full h-full object-cover"
              style={{ opacity: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/20 to-background"></div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
