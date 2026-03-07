interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  badge?: string;
  side: 'left' | 'right';
  isHighlight?: boolean;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: 'Sep 2024',
    title: 'The Beginning',
    description:
      'Started with a 3-member crew, one phone, and a clear vision — build systems that turn attention into customers.',
    side: 'left',
  },
  {
    date: 'Sep 2024',
    title: 'First Client — Skill Nation',
    description:
      'Landed Skill Nation as our first client — delivering UGC that proved performance-driven content works.',
    side: 'right',
  },
  {
    date: 'Feb 2025',
    title: 'Professional Infrastructure',
    description:
      'Reinvested into professional content infrastructure — upgrading from hustle to high-performance production.',
    side: 'left',
  },
  {
    date: 'Mar 2025',
    title: '₹10 Crore Ad Spend Crossed',
    description:
      'Crossed ₹10 Crore in ad spend managed — validating our ability to scale customer acquisition predictably.',
    badge: '₹10Cr',
    side: 'right',
    isHighlight: true,
  },
  {
    date: 'May 2025',
    title: 'First Shark Tank Brand',
    description: 'Onboarded Nooky — our first official Shark Tank India brand.',
    badge: '🦈 Shark Tank',
    side: 'left',
  },
  {
    date: 'Sep 2025',
    title: 'PhysicsWallah Partnership',
    description:
      "Partnered with India's largest D2C brands and VC-backed companies, including PhysicsWallah (PW).",
    badge: 'PW',
    side: 'right',
  },
  {
    date: 'Sep 2025',
    title: 'LIPI AI System Launch',
    description:
      'Launched LIPI — our proprietary AI creative automation system to scale performance content intelligently.',
    side: 'left',
  },
  {
    date: 'Dec 2025',
    title: '₹150Cr+ Revenue Generated',
    description: 'Delivered 2500+ video ads generating ₹150+ Crore in revenue for partner brands.',
    badge: '₹150Cr+',
    side: 'right',
    isHighlight: true,
  },
  {
    date: 'Jan 2026',
    title: 'Expanding to the UK',
    description:
      'Expanded to the United Kingdom — with a larger global vision for engineered growth.',
    side: 'left',
  },
];

export default function Timeline() {
  return (
    <section id="timeline" className="py-16 lg:py-24 bg-background-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
              Our Story
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              From 3-Member Crew to Powering India's Top Brands.
            </h2>
          </div>
          <div className="lg:text-right lg:self-end">
            <p className="text-text-secondary max-w-md lg:ml-auto">
              Growth should not be accidental. It should be engineered.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line - Desktop */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-border via-primary/50 to-border"></div>

          {/* Left Line - Mobile */}
          <div className="lg:hidden absolute left-4 w-0.5 h-full bg-gradient-to-b from-border via-primary/30 to-border"></div>

          {/* Events */}
          <div className="space-y-8 lg:space-y-12">
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`relative flex items-start lg:items-center ${
                  event.side === 'left' ? 'lg:justify-start' : 'lg:justify-end'
                }`}
              >
                {/* Center Dot - Desktop */}
                <div
                  className={`hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${
                    event.isHighlight
                      ? 'bg-primary shadow-lg shadow-primary/50'
                      : 'bg-border border-4 border-background-secondary'
                  }`}
                ></div>

                {/* Left Dot - Mobile */}
                <div
                  className={`lg:hidden absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full ${
                    event.isHighlight
                      ? 'bg-primary shadow-lg shadow-primary/50'
                      : 'bg-background-secondary border-2 border-border'
                  }`}
                ></div>

                {/* Card - Mobile (always right) */}
                <div className="lg:hidden pl-10 w-full">
                  {/* Date */}
                  <div className="text-xs font-semibold text-primary mb-1">{event.date}</div>

                  {/* Title with Badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-bold text-foreground">
                      {event.title}
                    </h3>
                    {event.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-white text-[10px] font-semibold">
                        {event.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary">{event.description}</p>
                </div>

                {/* Card - Desktop (alternating sides) */}
                <div
                  className={`hidden lg:block w-5/12 ${
                    event.side === 'left' ? 'pr-8 text-right' : 'pl-8 text-left'
                  }`}
                >
                  <div
                    className={`bg-card-bg rounded-xl border p-5 card-shadow ${
                      event.isHighlight
                        ? 'border-primary/30 bg-badge-pink-bg'
                        : 'border-border'
                    }`}
                  >
                    {/* Date */}
                    <div className="text-xs font-semibold text-primary mb-1">{event.date}</div>

                    {/* Title with Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3
                        className={`text-lg font-bold text-foreground ${
                          event.side === 'left' ? 'ml-auto' : ''
                        }`}
                      >
                        {event.title}
                      </h3>
                      {event.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-white text-xs font-semibold">
                          {event.badge}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-secondary">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
