'use client';

import Image from 'next/image';
import Marquee from 'react-fast-marquee';

import { CTAButton, IdealForSection } from '../CTAButton';

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

export default function Hero() {
  return (
    <section className="pt-20 pb-16 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto lg:mx-0">
          {/* Heading */}
          <h1 className=" pt-6 text-5xl sm:text-4xl lg:text-6xl font-black ">
            Go From<br />
            <span className="text-primary">Zero To 1000</span> Paying<br />
            Customers In<br />
            Less Than 60<br />
            Days
          </h1>

          {/* Description */}
          <p className="text-sm text-text-secondary font-medium mt-6 max-w-md">
            Hire the Growth & Marketing <span className="font-semibold text-foreground">Team Behind <br />India&apos;s Largest D2C Brands</span> As Your End-to-End <br />Marketing  Department
          </p>

          {/* Trust Badge */}
          <p className="text-sm text-text-secondary text-center mt-8">
            Trusted by 75+ <span className="text-primary font-semibold">D2C brands</span> across India
          </p>
<br />
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

          {/* CTA Box */}
          <CTAButton className="mt-8" />

          {/* Ideal For Section */}
          <IdealForSection className="mt-4" />
        </div>
      </div>
    </section>
  );
}
