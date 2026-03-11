'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';

// Portfolio item type
interface PortfolioItem {
  id: number;
  brand: string;
  category: string;
  thumbnail: string;
  videoUrl?: string;
}

// Portfolio data organized by tab
const ugcAds: PortfolioItem[] = [
  { id: 1, brand: 'Spinemat', category: 'HEALTH & WELLNESS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 2, brand: 'SleepWell Pro', category: 'HEALTH & WELLNESS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 3, brand: 'GlowSkin', category: 'PERSONAL CARE', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 4, brand: 'FreshBite', category: 'FOOD & DRINK', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 5, brand: 'TechGadget', category: 'TECH & PRODUCTS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 6, brand: 'StyleHub', category: 'FASHION & LIFESTYLE', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 7, brand: 'HomeGlow', category: 'HOME IMPROVEMENT', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 8, brand: 'PetCare Plus', category: 'KIDS & PETS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 9, brand: 'QuickApp', category: 'APPS & SERVICES', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 10, brand: 'NatureTea', category: 'FOOD & DRINK', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 11, brand: 'FitLife', category: 'HEALTH & WELLNESS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 12, brand: 'CleanHome', category: 'HOME IMPROVEMENT', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
];

const highProductionAds: PortfolioItem[] = [
  { id: 101, brand: 'LuxuryBrand', category: 'FASHION & LIFESTYLE', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 102, brand: 'PremiumTech', category: 'TECH & PRODUCTS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 103, brand: 'EliteWellness', category: 'HEALTH & WELLNESS', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 104, brand: 'GourmetChef', category: 'FOOD & DRINK', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 105, brand: 'DesignerHome', category: 'HOME IMPROVEMENT', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
  { id: 106, brand: 'BeautyLux', category: 'PERSONAL CARE', thumbnail: 'https://res.cloudinary.com/dq5vdlfhw/image/upload/v1741456155/Screenshot_2025-03-08_233541_rplzjs.png' },
];

const categories = [
  'Apps & Services',
  'Fashion & Lifestyle',
  'Food & Drink',
  'Health & Wellness',
  'Home Improvement',
  'Kids & Pets',
  'Personal Care',
  'Tech & Products',
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<'ugc' | 'highProduction'>('ugc');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const currentItems = activeTab === 'ugc' ? ugcAds : highProductionAds;
  
  const filteredItems = activeCategory
    ? currentItems.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase().replace('&', '&'))
    : currentItems;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
            Our Portfolio
          </h1>
          
          {/* Tabs */}
          <div className="inline-flex bg-[#1a1a1a] rounded-full p-1 mb-8">
            <button
              onClick={() => setActiveTab('ugc')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === 'ugc'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ads - UGC
            </button>
            <button
              onClick={() => setActiveTab('highProduction')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeTab === 'highProduction'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ads - High Production
            </button>
          </div>
        </div>
      </header>

      {/* Category Filters */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === null
                  ? 'bg-white text-black border-white'
                  : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category.toUpperCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeCategory === category.toUpperCase()
                    ? 'bg-white text-black border-white'
                    : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden bg-[#1a1a1a] aspect-[9/16] cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Phone Frame */}
              <div className="absolute inset-0 border-4 border-gray-800 rounded-2xl pointer-events-none z-10" />
              
              {/* Video Thumbnail */}
              <img
                src={item.thumbnail}
                alt={item.brand}
                className="w-full h-full object-cover"
              />
              
              {/* Category Badge */}
              <div className="absolute top-4 left-3 right-3 z-20">
                <span className="text-[10px] font-semibold text-gray-400 tracking-wider">
                  {item.category}
                </span>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Brand Name */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                <h4 className="text-white font-semibold text-sm">
                  {item.brand}
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Let's Scale your Brand with Video Ads
            </h2>
            <Link
              href="/#cta"
              className="inline-flex items-center bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Book a call
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Yuvichaar</h3>
              <p className="text-gray-500 text-sm">Creative Production Agency</p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                HOME
              </Link>
              <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                PROJECTS
              </Link>
              <Link href="/#meet-the-founder" className="text-gray-400 hover:text-white transition-colors">
                ABOUT
              </Link>
              <Link href="/#cta" className="text-gray-400 hover:text-white transition-colors">
                CONTACT
              </Link>
            </div>

            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                LINKEDIN
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                INSTAGRAM
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
