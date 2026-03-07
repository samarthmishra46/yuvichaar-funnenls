import { TrendingUp, Clock, Users, Instagram, Linkedin } from 'lucide-react';

const stats = [
  { icon: TrendingUp, value: '₹60Cr+', label: 'Ad Spend Managed' },
  { icon: Clock, value: '6+', label: 'Years Experience' },
  { icon: Users, value: '50+', label: 'Brands Scaled' },
  { icon: Instagram, value: '₹150Cr+', label: 'Revenue Generated' },
];

const highlights = [
  'Performance Marketer turned Founder',
  'Managed ₹60Cr+ across Meta & Google',
  'Built & scaled 50+ D2C brands in India',
];

export default function MeetTheFounder() {
  return (
    <section id="founder" className="py-16 lg:py-24 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
            Led By
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">Meet the Founder</h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Photo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl overflow-hidden aspect-[3/4] relative">
              {/* Placeholder for founder image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                    <Users className="w-16 h-16 text-white/50" />
                  </div>
                  <p className="text-text-muted text-sm">Founder Image</p>
                  <p className="text-text-muted text-xs">(400 x 533px)</p>
                </div>
              </div>
              
              {/* LinkedIn Badge */}
              <a
                href="#"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            
            {/* Name & Title */}
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-foreground">Yuvraj Singh Rajawat</h3>
              <p className="text-text-muted">Founder & Managing Partner</p>
              
              {/* Education Badge */}
              <div className="mt-4 inline-flex items-center space-x-2 bg-card-bg rounded-full px-4 py-2 border border-border">
                <div className="w-8 h-8 rounded-full bg-[#0D47A1] flex items-center justify-center text-white text-xs font-bold">
                  UoB
                </div>
                <span className="text-sm text-text-secondary">
                  MSc International Business — University of Birmingham, UK
                </span>
              </div>
            </div>
          </div>

          {/* Right - Stats & Quote */}
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card-bg rounded-xl border border-border p-4 card-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-badge-purple-bg flex items-center justify-center text-secondary mb-3">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="bg-badge-pink-bg rounded-xl border border-primary/20 p-6">
              <p className="text-foreground italic mb-4">
                "I've sat on both sides of this table — as a performance marketer and as someone
                who's built brands from scratch. I built Yuvichaar Funnels because every ambitious
                founder deserves a marketing team that thinks like a co-founder — not a vendor who
                disappears after the invoice."
              </p>
              <p className="text-primary font-semibold">— Yuvraj Singh Rajawat</p>
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-text-secondary">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
