import { Play, Camera, Film, Monitor, Users } from 'lucide-react';

const stats = [
  { icon: Camera, value: '200+/yr', label: 'Ad Shoots' },
  { icon: Film, value: '2,500+', label: 'Videos Produced' },
  { icon: Monitor, value: '80+', label: 'Funnels Built' },
  { icon: Users, value: '30+', label: 'Team Size' },
];

export default function BehindTheScenes() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">
              Behind The Scenes
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
              This is what a real marketing operation looks like.
            </h2>
          </div>
          <div className="lg:text-right lg:self-end">
            <p className="text-text-secondary max-w-md lg:ml-auto">
              A 30-person in-house team, Netflix-approved cameras, and systems that scale.
            </p>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Main Video */}
          <div className="bg-background-tertiary rounded-2xl overflow-hidden aspect-video relative group cursor-pointer">
            {/* Placeholder for video thumbnail */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-white/80">Production Reel — 2025</p>
              </div>
            </div>
            
            {/* Label */}
            <div className="absolute bottom-4 left-4">
              <span className="bg-card-bg/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-foreground">
                Production Reel — 2025
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Team Image */}
            <div className="bg-background-tertiary rounded-2xl overflow-hidden aspect-[16/9] relative">
              {/* Placeholder for team image */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-2 text-white/50" />
                  <p className="text-white/80 text-sm">30-Person Creative Team</p>
                  <p className="text-white/60 text-xs">(600 x 340px)</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm text-white">
                  30-Person Creative Team
                </span>
              </div>
            </div>

            {/* Premium Production Card */}
            <div className="gradient-bg rounded-2xl p-6 text-white">
              <div className="text-xs font-semibold tracking-wider uppercase mb-2 text-white/80">
                Netflix-Approved Cameras
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium Production</h3>
              <p className="text-white/80 text-sm">
                We don't just make content. We make ads that stop the scroll.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card-bg rounded-xl border border-border p-4 card-shadow flex items-center space-x-4"
            >
              <div className="w-10 h-10 rounded-lg bg-badge-purple-bg flex items-center justify-center text-secondary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
