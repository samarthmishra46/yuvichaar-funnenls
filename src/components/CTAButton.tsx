'use client';

import { useEffect, useState } from 'react';
import { Factory, User } from 'lucide-react';

const idealFor = [
  { icon: Factory, label: 'Established Manufacturers' },
  { icon: User, label: 'Tech Founders (GTM Ready)' },
];

interface CTAButtonProps {
  href?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CTAButton({
  href = 'https://rzp.io/rzp/SiDWLsca',
  title = 'Book A Call',
  subtitle = '',
  className = '',
}: CTAButtonProps) {
  return (
    <a
      href={href}
      className={`block w-full px-2 py-1 rounded-2xl bg-gradient-to-b from-pink-500 via-fuchsia-500 to-purple-600 text-center hover:opacity-90 transition-opacity duration-200 ${className}`}
    >
      <span className="block text-white font-bold text-md uppercase tracking-wide">
        {title}
      </span>
      <span className="block text-white/80 text-xs mt-1">
        {subtitle}
      </span>
    </a>
  );
}

interface IdealForSectionProps {
  className?: string;
}

export function IdealForSection({ className = '' }: IdealForSectionProps) {
  return (
    <div className={`text-center ${className}`}>
         <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border"></div>
      <p className="text-[14px] font-semibold tracking-wider text-primary uppercase ">
        Ideal For
      </p>
      <div className="flex-1 h-px bg-border"></div>
      </div>
      <div className="flex justify-center gap-8">
        {idealFor.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-[10px] text-text-secondary">
            <item.icon color="#F72585" className="w-4 h-4 "  />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CTAWithIdealForProps {
  ctaHref?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  className?: string;
}

export function StickyCTA({
  href = 'https://rzp.io/rzp/SiDWLsca',
  title = 'Book A Call',
  subtitle = '',
}: {
  href?: string;
  title?: string;
  subtitle?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-[20px] left-0 right-0 z-70 px-4 pb-4 mb-12 bg-transparent transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div className="max-w-sm mx-auto">
        <a
      href={href}
      className={`block w-full px-2 py-1 rounded-2xl bg-gradient-to-b from-pink-500 via-fuchsia-500 to-purple-600 text-center hover:opacity-90 transition-opacity duration-200 `}
    >
      <span className="block text-white font-bold text-md uppercase tracking-wide">
        {title}
      </span>
      <span className="block text-white/80 text-xs mt-1">
        {subtitle}
      </span>
    </a>
      </div>
    </div>
  );
}

export function CTAWithIdealFor({
  ctaHref = 'https://rzp.io/rzp/SiDWLsca',
  ctaTitle = 'Book A Call',
  ctaSubtitle = '     ',
  className = '',
}: CTAWithIdealForProps) {
  return (
    <div className={className}>
      <CTAButton href={ctaHref} title={ctaTitle} subtitle={ctaSubtitle} />
      <IdealForSection className="mt-2" />
    </div>
  );
}
