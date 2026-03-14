export default function Quote() {
  return (
    <section className="py-8 sm:py-12 lg:py-24 bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden card-shadow">
          <div className="flex flex-row">
            {/* Left Side - Gradient Text Content */}
            <div
              className="w-1/2 p-5 sm:p-7 lg:p-10 flex flex-col justify-center"
              style={{
                background: 'linear-gradient(180deg, #E91E8C 0%, #9C27B0 100%)'
              }}
            >
              <div className="max-w-[13rem] sm:max-w-[16rem] lg:max-w-[20rem] space-y-3 sm:space-y-5">
                <p className="text-white text-lg sm:text-lg lg:text-2xl font-bold tracking-tight">
                  <span className="border-b border-white pb-0.5">Watch How</span>
                </p>
                <p className="text-white text-lg sm:text-2xl lg:text-[2.15rem] font-medium leading-[0.95] tracking-tight">
                  We <strong className="font-extrabold">Turn</strong><br />
                  People<br />
                  Scrolling On<br />
                  Social Media<br />
                  Into Your<br />
                  Paying <strong className="font-extrabold">Customers</strong>
                </p>
              </div>
            </div>

            {/* Right Side - Video Placeholder */}
            <div className="w-1/2 relative bg-gray-100 min-h-[150px] sm:min-h-[250px] lg:min-h-[400px]">
              {/* Video/GIF will be added here */}
              <div className="absolute inset-0 flex items-center justify-center">
                
              </div>
              {/* Placeholder image - replace src with your video/gif */}
              <div className="w-full h-full rounded-2xl flex items-center justify-center text-gray-400 bg-[#F72585]">
              <img src="https://res.cloudinary.com/dvxqb1wge/image/upload/v1755443771/YHL_thsupk.gif" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
