import { Check, X } from 'lucide-react';
import {  CTAWithIdealFor } from '@/components/CTAButton';

const forYou = [
  {
    title: `You’re a manufacturer with a proven offline business`,
    description:
      ' And want to build a ₹100Cr D2C brand online.',
  },
  {
    title: `You’re a tech founder built something genuinely valuable`,
    description:
      "(Saas/ app/ platform) product ready for market, but no clear go-to-market strategy yet; strong tech, weak distribution.",
  },
  {
    title: 'You’re A D2C Founder With Ambition',
    description:
      "You've got the product, ₹5–10L set aside for marketing, and a genuine ambition to build the next unicorn.",
  },
];

const notForYou = [
  {
    title: 'Pre-Product Founders',
    description:
      "Your product isn't ready yet — you're a little early for a full-stack marketing and growth team.",
  },
  {
    title: 'Low Budget Operators',
    description:
      'Your current marketing budget is below ₹5 Lakhs. We build complete growth systems that require meaningful investment.',
  },
];

export default function WhoIsThisFor() {
  return (
    <section className="py-16 lg:py-24 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-2">
          <div className="text-xs font-semibold tracking-wider text-primary uppercase ">
            Who Is This For
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For You Column */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-success text-3xl font-bold">This is for you if</span>
            </div>
            <div className="space-y-4">
              {forYou.map((item, index) => (
                <div
                  key={index}
                  className="bg-card-bg rounded-xl border border-border p-5 card-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-light flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Not For You Column */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              <span className="text-error text-3xl font-bold">This isn't for you if</span>
            </div>
            <div className="space-y-4">
              {notForYou.map((item, index) => (
                <div
                  key={index}
                  className="bg-card-bg rounded-xl border border-border p-5 card-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-error-light flex items-center justify-center mt-0.5">
                      <X className="w-3 h-3 text-error" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                      <p className="text-xs text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
                  <CTAWithIdealFor className="mt-8 pt-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
