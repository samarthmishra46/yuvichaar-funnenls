import { TrendingUp, Clock, Users, Linkedin } from 'lucide-react';
import {  CTAWithIdealFor } from '@/components/CTAButton';

const stats = [
  { icon: TrendingUp, value: '₹60Cr+', label: 'Ad Spend Managed' },
  { icon: Clock, value: '6+', label: 'Years Experience' },
  { icon: Users, value: '50+', label: 'Brands Scaled' },
];
const coreCrew = [
  {
    title: 'Creative Heads',
    members: [
      { image: '/team/creative-1.jpg' },
      { image: '/team/creative-2.jpg' },
      { image: '/team/creative-3.jpg' },
      { image: '/team/creative-4.jpg' },
    ],
  },
  {
    title: 'Core Operations',
    members: [
      { image: '/team/ops-1.jpg' },
      { image: '/team/ops-2.jpg' },
      { image: '/team/ops-3.jpg' },
      { image: '/team/ops-4.jpg' },
    ],
  },
  {
    title: 'Tech & AI',
    members: [
      { image: '/team/tech-1.jpg' },
      { image: '/team/tech-2.jpg' },
      { image: '/team/tech-3.jpg' },
      { image: '/team/tech-4.jpg' },
    ],
   
  },
];

const otherCrew = [
  {
    title: 'The Models / Influencers',
    members: [
      { image: '/team/model-1.jpg' },
      { image: '/team/model-2.jpg' },
      { image: '/team/model-3.jpg' },
      { image: '/team/model-4.jpg' },
    ],
  },
  {
    title: 'Camera Crew',
    members: [
      { image: '/team/camera-1.jpg' },
      { image: '/team/camera-2.jpg' },
      { image: '/team/camera-3.jpg' },
      { image: '/team/camera-4.jpg' },
    ],
  },
  {
    title: 'Video Editing',
    members: [
      { image: '/team/editor-1.jpg' },
      { image: '/team/editor-2.jpg' },
      { image: '/team/editor-3.jpg' },
      { image: '/team/editor-4.jpg' },
    ],
  },
];


export default function MeetTheFounder() {
  return (
    <section id="founder" className="py-16 lg:py-24 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
            Meet The Team
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">People At <br />Yuvichaar Funnels</h2>
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

              {/* Name & Title - Inside image at bottom left */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-xl font-bold text-white">Yuvraj Singh Rajawat</h3>
                  <p className="text-white/80 text-sm">Founder & Managing Partner</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card-bg rounded-xl border border-border p-4 card-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-badge-purple-bg flex items-center justify-center text-secondary mb-2">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="text-md font-bold text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
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

          {/* Right - Stats & Quote */}
          <div className="space-y-6">
            {/* Stats Grid */}
            

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

            {/* The Core Crew */}
            <div className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">The Core Crew</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="space-y-6">
                {coreCrew.map((group, index) => (
                  <div key={index}>
                    <h4 className="text-sm font-bold text-foreground mb-3">{group.title}</h4>
                    <div className="flex gap-2">
                      {group.members.map((member, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img src={member.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Other Crew */}
            <div className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">The Other Crew</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="space-y-6">
                {otherCrew.map((group, index) => (
                  <div key={index}>
                    <h4 className="text-sm font-bold text-foreground mb-3">{group.title}</h4>
                    <div className="flex gap-2">
                      {group.members.map((member, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img src={member.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <CTAWithIdealFor className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
