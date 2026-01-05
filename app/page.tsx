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

          {/* Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 max-w-2xl mx-auto">
            <ValueProp
              icon="🎯"
              title="Intelligent Matching"
              description="Algorithm matches items to house dimensions"
            />
            <ValueProp
              icon="✓"
              title="Verified Schemas"
              description="Database of UK house builder floor plans"
            />
            <ValueProp
              icon="♻️"
              title="Waste Reduction"
              description="Keep fixtures out of landfills"
            />
            <ValueProp
              icon="💰"
              title="Cost Savings"
              description="Second-hand at fraction of new prices"
            />
            <ValueProp
              icon="📏"
              title="Perfect Fit"
              description="No more measuring mistakes"
            />
          </div>
        </div>
      </main>

      {/* Footer with Admin Link */}
      <footer className="py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            href="/dashboard"
            className="text-sm text-[#6B7280] hover:text-[#087F8C] transition-colors"
          >
            Admin
          </Link>
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
