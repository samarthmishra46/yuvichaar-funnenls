'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import VideoHoverGrid, { VideoHoverItem } from '@/components/VideoHoverGrid';

// Portfolio item type
// Brand logos for marquee (placeholder emojis/text - replace with actual logos)
const brandLogos = [
  { name: 'Next.js', src: 'https://kingkoil.in/images/logo.png' },
  { name: 'Vercel', src: 'https://skillnation.ai/wp-content/uploads/2023/08/SN_logo-17-1024x415.png' },
  { name: 'Globe', src: 'https://mintree.in/cdn/shop/files/Mintree_Logo_3c7e9336-d594-41ef-abbd-610791bfb90b.png?v=1706126721&width=160' },
  { name: 'Window', src: 'https://akam.cdn.jdmagicbox.com/images/icontent/jdrwd/jdlogosvg.svg' },
  { name: 'File', src: 'https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/f10eb934-422b-448f-aa2c-157078acb032.webp' },
  { name: 'Next.js', src: 'https://spinemat.com/cdn/shop/files/50976577-0829-44c9-8f61-66aa4d5482f7_72fb27ce-9be2-4e54-ae2f-8a863a773ef1.png?v=1772009162&width=550' },
  { name: 'Vercel', src: 'https://tiimg.tistatic.com/images/l/1/logo_163430.jpg' },
  { name: 'Globe', src: 'https://static.pw.live/production-curiousjr-fundoo/static/images/landing-page/cjr-black-logo.webp' },
  { name: 'Next.js', src: 'https://kingkoil.in/images/logo.png' },
  { name: 'Vercel', src: 'https://skillnation.ai/wp-content/uploads/2023/08/SN_logo-17-1024x415.png' },
  { name: 'Globe', src: 'https://mintree.in/cdn/shop/files/Mintree_Logo_3c7e9336-d594-41ef-abbd-610791bfb90b.png?v=1706126721&width=160' },
  { name: 'Window', src: 'https://akam.cdn.jdmagicbox.com/images/icontent/jdrwd/jdlogosvg.svg' },
  { name: 'File', src: 'https://static.pw.live/5eb393ee95fab7468a79d189/GLOBAL_CMS/f10eb934-422b-448f-aa2c-157078acb032.webp' },
  { name: 'Next.js', src: 'https://spinemat.com/cdn/shop/files/50976577-0829-44c9-8f61-66aa4d5482f7_72fb27ce-9be2-4e54-ae2f-8a863a773ef1.png?v=1772009162&width=550' },
  { name: 'Vercel', src: 'https://tiimg.tistatic.com/images/l/1/logo_163430.jpg' },
  { name: 'Globe', src: 'https://static.pw.live/production-curiousjr-fundoo/static/images/landing-page/cjr-black-logo.webp' },
];

// Portfolio data organized by tab
const ugcAds: VideoHoverItem[] = [
  {
    id: 1,
    title: 'AMACOM',
    category: 'PERSONAL CARE',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/ed565711-f757-473e-ae6e-0bbe847e8394/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/ed565711-f757-473e-ae6e-0bbe847e8394/playlist.m3u8',
  },
  {
    id: 2,
    title: 'Binni',
    category: 'FASHION & LIFESTYLE',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/787e93fe-a2c7-4810-84dc-e340ccece50b/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/787e93fe-a2c7-4810-84dc-e340ccece50b/playlist.m3u8',
  },
  {
    id: 3,
    title: 'Atmos',
    category: 'FASHION & LIFESTYLE',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/349c5b19-2212-446a-8e7b-fb2e8fde56cf/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/349c5b19-2212-446a-8e7b-fb2e8fde56cf/playlist.m3u8',
  },
  {
    id: 4,
    title: 'Asli Gems',
    category: 'FASHION & LIFESTYLE',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/304f4db6-7aed-4355-b1f0-58b26303c444/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/304f4db6-7aed-4355-b1f0-58b26303c444/playlist.m3u8',
  },
  {
    id: 5,
    title: 'Arlak BioTech',
    category: 'HEALTH & WELLNESS',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/fb61c54f-eb65-481e-9e72-618f3b4c136b/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/fb61c54f-eb65-481e-9e72-618f3b4c136b/playlist.m3u8',
  },
  {
    id: 6,
    title: '',
    category: '',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/1333707d-7c6b-431f-84fb-e67f5eb312b5/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/1333707d-7c6b-431f-84fb-e67f5eb312b5/playlist.m3u8',
  },
  {
    id: 7,
    title: 'DNA ',
    category: 'APPS & SERVICES',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/8474f82e-66bb-41e6-bc9e-39b45dad4b6e/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/8474f82e-66bb-41e6-bc9e-39b45dad4b6e/playlist.m3u8',
  },
  {
    id: 8,
    title: 'Arabian Aroma',
    category: 'FASHION & LIFESTYLE',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/3aa036c1-91b7-401e-a2b2-041126f70a2a/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/3aa036c1-91b7-401e-a2b2-041126f70a2a/playlist.m3u8',
  },
  {
    id: 9,
    title: 'Add-Ed`s',
    category: 'Kids & Pets',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/ca84b655-d76d-4745-ad60-16d6ae8759ac/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/ca84b655-d76d-4745-ad60-16d6ae8759ac/playlist.m3u8',
  },
  {
    id: 10,
    title: 'Physics Wallah',
    category: 'APPS & SERVICES',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/379ff2f0-e94b-4725-94e5-5d7026c9b429/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/379ff2f0-e94b-4725-94e5-5d7026c9b429/playlist.m3u8',
  },
  {
    id: 11,
    title: 'Purpose Healthcare',
    category: 'HEALTH & WELLNESS',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/26d9ee50-93b1-453b-b14e-ca90d2f5e51d/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/26d9ee50-93b1-453b-b14e-ca90d2f5e51d/playlist.m3u8',
  },
  {
    id: 12,
    title: 'Spinemat',
    category: 'HEALTH & WELLNESS',
    poster: 'https://vz-5ad9b308-4a4.b-cdn.net/32d21443-4200-4d17-99a2-68005e38fd33/thumbnail.jpg',
    hlsUrl: 'https://vz-5ad9b308-4a4.b-cdn.net/32d21443-4200-4d17-99a2-68005e38fd33/playlist.m3u8',
  },
];

const highProductionAds: VideoHoverItem[] = [
  {
    id: 101,
    title: '',
    category: '',
    poster: '',
    hlsUrl: '',
  },
  {
    id: 102,
    title: '',
    category: '',
    poster: '',
    hlsUrl: '',
  },
  {
    id: 103,
    title: '',
    category: '',
    poster: '',
    hlsUrl: '',
  },
  {
    id: 104,
    title: '',
    category: '',
    poster: '',
    hlsUrl: '',
  },
  {
    id: 105,
    title: '',
    category: '',
    poster: '',
    hlsUrl: '',
  },
  {
    id: 106,
    title: '',
    category: '',
    poster: '',
    hlsUrl: '',
  },
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
    ? currentItems.filter((item) =>
        item.category.toLowerCase() === activeCategory.toLowerCase().replace('&', '&')
      )
    : currentItems;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation with Logo */}
      <nav className="py-4 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex font-bold items-center gap-">
            
          <span className="text-white">Yuvi</span>
              <span className="text-primary">chaar</span>
               <span className="text-text-muted ml-1 text-sm font-normal">FUNNELS</span>

          </Link>
          <a
            href="https://rzp.io/rzp/SiDWLsca"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Book a Call
          </a>
        </div>
      </nav>

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

      {/* Brand Pills - Marquee */}
      <div className="mt-4 overflow-hidden relative">
        <Marquee speed={50} gradient={false} pauseOnHover>
          <div className="flex gap-2 pr-2 pt-2">
            {brandLogos.map((brand, index) => (
              <div
                key={`logo-${index}`}
                className="w-28 h-20 rounded-xl border border-border bg-card-bg flex items-center justify-center p-4 shrink-0"
              >
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={28}
                  height={22}
                  className="w-14 h-11 object-contain"
                  unoptimized
                  loader={({ src }) => src}
                />
              </div>
            ))}
          </div>
        </Marquee>
      </div>

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
        <VideoHoverGrid items={filteredItems} />

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
            <a
              href="https://rzp.io/rzp/SiDWLsca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-lg"
            >
              Book a call
            </a>
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
