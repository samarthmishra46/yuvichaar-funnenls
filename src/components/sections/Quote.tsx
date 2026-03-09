export default function Quote() {
  return (
    <section className="py-8 sm:py-12 lg:py-24 bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden card-shadow">
          <div className="flex flex-row">
            {/* Left Side - Gradient Text Content */}
            <div 
              className="w-1/2 p-4 sm:p-6 lg:p-12 flex flex-col justify-center"
              style={{
                background: 'linear-gradient(180deg, #E91E8C 0%, #9C27B0 100%)'
              }}
            >
              <div className="space-y-2 sm:space-y-4 lg:space-y-6">
                <h3 className="text-white text-xs sm:text-base lg:text-2xl font-medium">
                  <span className="border-b border-white sm:border-b-2 pb-0.5 sm:pb-1">Watch How</span>
                </h3>
                <p className="text-white text-sm sm:text-lg lg:text-4xl leading-snug sm:leading-relaxed">
                  We <span className="font-bold">Turn</span> People{' '}
                  <span className="font-bold">Scrolling</span> On Social Media Into Your Paying{' '}
                  <span className="font-bold">Customers</span>
                </p>
              </div>
            </div>

            {/* Right Side - Video Placeholder */}
            <div className="w-1/2 relative bg-gray-100 min-h-[150px] sm:min-h-[250px] lg:min-h-[400px]">
              {/* Video/GIF will be added here */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Play button overlay */}
                <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                  <svg 
                    className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600 ml-0.5 sm:ml-1" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {/* Placeholder image - replace src with your video/gif */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                <span className="text-xs sm:text-sm">Video/GIF Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
