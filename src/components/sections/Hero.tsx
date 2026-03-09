'use client';

import { CTAButton, IdealForSection } from '../CTAButton';

const brands = [
  'VC Backed',
  'D2C Brand',
  'Bootstrapped',
  'Series A',
  'VC Backed',
  'D2C Brand',
  'Bootstrapped',
  'Series A',
];

export default function Hero() {
  return (
    <section className="pt-20 pb-16 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto lg:mx-0">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight ">
            Go From<br />
            <span className="text-primary">Zero To 1000</span> Paying<br />
            Customers In<br />
            Less Than 60<br />
            Days
          </h1>

          {/* Description */}
          <p className="text-sm text-text-secondary mt-6 max-w-md">
            Hire the Growth & Marketing <span className="font-semibold text-foreground">Team Behind India&apos;s Largest D2C Brands</span> As Your End-to-End Marketing Department
          </p>

          {/* Trust Badge */}
          <p className="text-sm text-text-secondary text-center mt-8">
            Trusted by 75+ <span className="text-primary font-semibold">D2C brands</span> across India
          </p>

          {/* Brand Pills - Marquee */}
          <div className="mt-4 overflow-hidden relative">
            <div className="flex gap-3 animate-marquee whitespace-nowrap">
              {brands.map((brand, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full border border-border text-sm text-text-secondary bg-card-bg flex-shrink-0"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <CTAButton className="mt-8" />

          {/* Ideal For Section */}
          <IdealForSection className="mt-8" />
        </div>
      </div>
    </section>
  );
}
