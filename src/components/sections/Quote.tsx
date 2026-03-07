export default function Quote() {
  return (
    <section className="py-16 lg:py-24 bg-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card-bg rounded-2xl border border-border p-8 lg:p-12 card-shadow">
          <div className="flex items-start space-x-6">
            {/* Quote Icon */}
            <div className="flex-shrink-0">
              <div className="flex space-x-1">
                <svg className="w-8 h-12 text-text-muted" viewBox="0 0 24 36" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12v24h12V12H6c0-3.3 2.7-6 6-6V0z"/>
                </svg>
                <svg className="w-8 h-12 text-text-muted" viewBox="0 0 24 36" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12v24h12V12H6c0-3.3 2.7-6 6-6V0z"/>
                </svg>
              </div>
            </div>

            {/* Quote Content */}
            <div className="space-y-4">
              <p className="text-xl lg:text-2xl text-foreground font-medium leading-relaxed italic">
                Because the purpose of business is to create a customer, the business enterprise has
                two — and only two — basic functions: marketing and innovation.
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-0.5 bg-primary"></div>
                <span className="text-primary font-semibold">— Peter Drucker</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
