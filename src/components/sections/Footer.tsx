import { Mail, Instagram, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold">
                <span className="text-foreground">Yuvi</span>
                <span className="text-primary">chaar</span>
                <span className="text-text-muted ml-1 text-sm font-normal">FUNNELS</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm mb-6">
              AI-enabled marketing & growth partners engineering your path to ₹100Cr.
            </p>
            <div className="flex space-x-3">
              <a
                href="mailto:marketing@yuvichaarfunnels.com"
                className="w-10 h-10 rounded-full bg-card-bg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/yuvichaarfunnels"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card-bg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-primary uppercase mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:marketing@yuvichaarfunnels.com"
                className="block text-text-secondary hover:text-foreground transition-colors text-sm"
              >
                marketing@yuvichaarfunnels.com
              </a>
              <a
                href="https://instagram.com/yuvichaarfunnels"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-text-secondary hover:text-foreground transition-colors text-sm"
              >
                @yuvichaarfunnels
              </a>
            </div>
          </div>

          {/* Jaipur Office */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-primary uppercase mb-4 flex items-center">
              <span className="mr-2">🇮🇳</span> Jaipur, India
            </h4>
            <div className="flex items-start space-x-2 text-text-secondary text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                35-A 1st Floor, Vikash Nagar B, Heerapura
                <br />
                Jaipur (Rajasthan) 302021
              </span>
            </div>
          </div>

          {/* Birmingham Office */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-primary uppercase mb-4 flex items-center">
              <span className="mr-2">🇬🇧</span> Birmingham, UK
            </h4>
            <div className="flex items-start space-x-2 text-text-secondary text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                218 Broad Street, Moda
                <br />
                The Mercian, B15 1FF,
                <br />
                Birmingham United Kingdom
              </span>
            </div>
          </div>
        </div>

        {/* London Coming Soon */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center gap-4">
            <h4 className="text-xs font-semibold tracking-wider text-primary uppercase flex items-center">
              <span className="mr-2">🇬🇧</span> London, UK
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                SOON
              </span>
            </h4>
            <div className="flex items-center space-x-2 text-text-muted text-sm">
              <MapPin className="w-4 h-4" />
              <span>Coming soon</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © 2026 Yuvichaar Funnels. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <span className="text-text-muted">GSTIN: (To be added)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
