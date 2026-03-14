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
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      
    ],
  },
  {
    title: 'Core Operations',
    members: [
       { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      
    ],
  },
  {
    title: 'Tech & AI',
    members: [
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      
    ],
   
  },
];

const otherCrew = [
  {
    title: 'The Models / Influencers',
    members: [
       { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      
    ],
  },
  {
    title: 'Camera Crew',
    members: [
     { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      
    ],
  },
  {
    title: 'Video Editing',
    members: [
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      { image: 'https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218906/image_3006_qhiilf.png' },
      
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
          <h2 className="text-3xl lg:text-4xl font-black text-foreground">People At <br />Yuvichaar Funnels</h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Photo */}
          <div className="relative ">
            <div className="border-transparent shadow-md rounded-2xl overflow-hidden relative ">
              {/* Placeholder for founder image */}
             
                  <img className="w-full h-full object-cover" src="https://res.cloudinary.com/dix4pzu0k/image/upload/v1773218007/Image_Yuvraj_Singh_Rajawat_vjuvxq.png" alt="Yuvraj Singh Rajawat" />
                
              
              
              {/* LinkedIn Badge */}
              
              <a
                href="#"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
              >
                <Linkedin className="w-5 h-5" />
              </a>

              {/* Name & Title - Inside image at bottom left */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="">
                  <h3 className="text-lg font-bold text-white">Yuvraj Singh Rajawat</h3>
                  <p className="text-white/80 text-xs">Founder & Managing Partner</p>
                </div>
              </div>
            </div>
            <br />
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
            <div className="mt-4 inline-flex items-center space-x-2 bg-card-bg rounded-full px-4 py-2 border object-contain w-full h-[25px] border-border">
              <img
                src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1773402272/download_kgusuc.jpg"
                alt="University logo"
                className="h-10 w-10 shrink-0 object-contain"
              />
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
