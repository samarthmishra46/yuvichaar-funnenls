import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section id="cta" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gradient-bg rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/80">
                Ready to Scale?
              </div>
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
                Let's Build Your ₹100Cr Brand Together.
              </h2>
              <p className="text-white/80 text-lg">
                Book a free 30-minute strategy call. No fluff. Just growth.
              </p>
            </div>

            {/* Right - CTA Button */}
            <div className="lg:text-right">
              <a
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-primary font-bold text-lg hover:bg-white/90 transition-colors duration-200 shadow-xl group"
              >
                BOOK A FREE CALL
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
