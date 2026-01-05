import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/refittr-app-icon-512.png"
              alt="Refittr Logo"
              width={120}
              height={120}
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* Company Name */}
          <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] tracking-tight">
            Refittr
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-[#087F8C] font-medium">
            Precision-fit marketplace for second-hand home fixtures
          </p>

          {/* Elevator Pitch */}
          <p className="text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
            Buy and sell fixtures with confidence using our intelligent matching algorithm 
            that compares item dimensions to verified UK house schemas. Reduce waste. 
            Save money. Perfect fit guaranteed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3 border border-[#087F8C] rounded-md shadow-sm text-sm font-medium text-[#087F8C] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
            >
              Learn More About Refittr
            </Link>
          </div>

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 max-w-2xl mx-auto">
            <ValueProp
              icon="🎯"
              title="Intelligent Matching"
              description="Our algorithm matches items to house dimensions automatically. No more manual measurements or uncertainty about whether something will fit."
            />
            <ValueProp
              icon="✓"
              title="Verified Schemas"
              description="Comprehensive database of UK house builder floor plans. We know the exact specifications of thousands of UK homes"
            />
            <ValueProp
              icon="♻️"
              title="Waste Reduction"
              description="Keep quality fixtures out of landfills. Give perfectly good items a second life instead of contributing to waste."
            />
            <ValueProp
              icon="💰"
              title="Cost Savings"
              description="Purchase quality second-hand fixtures at a fraction of retail prices. Save hundreds or thousands."
            />
            <ValueProp
              icon="📏"
              title="Perfect Fit"
              description="No more measuring mistakes or items that don't fit through doorways. Buy with confidence knowing it will work in your space."
            />
            <ValueProp
              icon="🚀"
              title="Launching July 2026"
              description="Built specifically for UK homes and UK standards. Starting in Merseyside with plans for nationwide expansion."
            />
          </div>
        </div>
      </main>

      {/* Footer with Admin Link */}
      <footer className="py-6 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#087F8C] hover:bg-[#087F8C]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#087F8C] transition-colors"
          >
            Admin Login
          </Link>
          <p className="text-sm text-[#6B7280]">© 2025 Refittr.</p>
        </div>
      </footer>
    </div>
  )
}

function ValueProp({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280]">{description}</p>
    </div>
  )
}
