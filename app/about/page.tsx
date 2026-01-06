'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Smartphone, BadgeCheck, Coins } from 'lucide-react'

export default function AboutPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setMessage({ type: 'success', text: 'Thanks! You\'re on the list. We\'ll notify you when we launch.' })
      setEmail('')
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to subscribe. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/refittr-app-icon-512.png"
              alt="Refittr Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-[#0F172A]">Refittr</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#6B7280] hover:text-[#087F8C] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
              About Refittr
            </h1>
            <p className="text-xl text-[#087F8C]">
              Revolutionising the second-hand home fixtures market
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Our Mission */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Our Mission</h2>
              <div className="text-[#6B7280] leading-relaxed space-y-4">
                <p>
                  Every year, thousands of perfectly good home fixtures end up in landfills simply because homeowners don't know if they'll fit in their new space. Meanwhile, others spend hundreds or thousands of pounds on new fixtures when quality second-hand options exist just down the road.
                </p>
                <p>
                  Refittr solves this with a simple insight: <strong>if you have the same house type as someone else, everything from their home automatically fits yours</strong>. Got a 3-bed Barratt Kingsville? So does someone selling blinds, carpets, and kitchen units. No measuring, no guessing - just perfect fits.
                </p>
                <p>
                  We've built the UK's first house-to-house matching platform for home fixtures. Tell us your house type, and we'll show you items that are <i>guaranteed</i> to fit - complete with green "verified match" badges for exact house matches and amber highlights for close matches with small tolerances.
                </p>
                <p className="font-semibold text-[#087F8C]">
                  Same house = perfect fit. Reduce waste. Save money. No tape measure required.
                </p>
              </div>
            </section>

            {/* How It Works */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6">How Refittr Works</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#087F8C] text-white font-bold mr-3">1</span>
                    <h3 className="text-lg font-semibold text-[#0F172A]">Tell Us Your House Type</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed ml-11">
                    When you sign up, just tell us your house builder, development name, and house type (e.g., "3-bed Barratt Kingsville"). That's it. We already know the exact dimensions of every room, doorway, and space in your home from our comprehensive database of UK house builder floor plans.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#087F8C] text-white font-bold mr-3">2</span>
                    <h3 className="text-lg font-semibold text-[#0F172A]">Automatic House-to-House Matching</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed ml-11">
                    Browse items from sellers with the <i>same house type</i> as you. See a green "verified match" badge? That item came from an identical house - it's <strong>guaranteed to fit perfectly</strong>. Blinds, carpets, flooring, even complete kitchens and bathrooms. No measuring needed. Amber highlights show "close matches" where there's a small difference (like a carpet 10cm too big) that you can still use with minor adjustments.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#087F8C] text-white font-bold mr-3">3</span>
                    <h3 className="text-lg font-semibold text-[#0F172A]">Buy or Sell - No Tape Measure Required</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed ml-11">
                    <strong>Selling?</strong> Just tell us your house type and we automatically know all the dimensions. List your items in seconds without measuring anything. <strong>Buying?</strong> Search knowing exactly what fits. Our platform shows you only items that work for your house, with delivery options from local van couriers, standard mail, van hire, or self-pickup. Set your distance preference for pickup options.
                  </p>
                </div>
              </div>
            </section>

            {/* Who We Serve */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Who We Serve</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                Refittr is designed for everyone. Our platform is particularly valuable for:
              </p>
              <div className="space-y-3 text-[#6B7280]">
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">▸</span>
                  <span>New homeowners furnishing their first property on a budget</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">▸</span>
                  <span>Downsizers who have quality fixtures they no longer need</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">▸</span>
                  <span>Renovators looking for cost-effective solutions</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">▸</span>
                  <span>Environmentally conscious buyers who want to reduce waste</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">▸</span>
                  <span>Anyone frustrated with generic marketplaces that don't guarantee fit</span>
                </p>
              </div>
            </section>

            {/* What Makes Us Different */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">What Makes Us Different</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                Unlike generic marketplaces like Facebook Marketplace or Gumtree, Refittr provides:
              </p>
              <div className="space-y-3 text-[#6B7280]">
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Perfect fit guarantee</strong> - Same house type = guaranteed fit. No measuring, no guessing</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Verified match badges</strong> - Green badges for exact house matches, amber for close matches with small tolerances</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>No measuring needed</strong> - Sellers just tell us their house type, we know all the dimensions automatically</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Free to use</strong> - Sign up free, list items free. We only take a small commission when items sell</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Delivery made easy</strong> - Partnering with local van couriers for delivery suggestions, plus standard mail, van hire, or self-pickup options with distance filters</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>House-specific search</strong> - Filter by your exact house builder, development, and room type</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Specialised platform</strong> - Built exclusively for home fixtures, not general items</span>
                </p>
              </div>
            </section>

            {/* Platform Availability */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Available on iOS & Android</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                Refittr will be available as a free mobile app on both iOS and Android when we launch in July 2026. Download it free, browse free, buy and sell free - we only charge a small commission when items successfully sell.
              </p>
              <div className="space-y-3 text-[#6B7280]">
                <p className="flex items-start">
                  <Smartphone className="w-5 h-5 text-[#087F8C] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>iOS App Store</strong> - Available for iPhone and iPad</span>
                </p>
                <p className="flex items-start">
                  <Smartphone className="w-5 h-5 text-[#087F8C] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Google Play Store</strong> - Available for Android devices</span>
                </p>
                <p className="flex items-start">
                  <BadgeCheck className="w-5 h-5 text-[#087F8C] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>100% Free to Download</strong> - No subscription fees, no listing fees</span>
                </p>
                <p className="flex items-start">
                  <Coins className="w-5 h-5 text-[#087F8C] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Commission-Based Only</strong> - We only earn when you successfully sell an item</span>
                </p>
              </div>
            </section>

            {/* The Team */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">The Team</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Refittr is a bootstrapped startup founded by a dumpster diver passionate about reducing waste and making home furnishing more accessible and affordable. We're combining technical expertise in software engineering, algorithm development, and marketplace design to solve a real problem that affects thousands of UK homeowners and tenants.
              </p>
              <p className="text-[#6B7280] leading-relaxed mt-4">
                Based in the UK and starting with Merseyside, we're committed to building a platform that genuinely helps people while contributing to a more sustainable future.
              </p>
            </section>

            {/* The Technology */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">The Technology</h2>
              <p className="text-[#6B7280] leading-relaxed mb-6">
                Behind Refittr is sophisticated technology that makes house-to-house matching seamless:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Comprehensive House Schema Database</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    We've compiled detailed floor plans and specifications from major UK house builders including Persimmon, Taylor Wimpey, Barratt Homes, and more. Every room dimension, doorway, window, ceiling height, and access route is stored for thousands of UK house types. When you tell us your house, we already know everything about it.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">House-to-House Matching Engine</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                   Our matching algorithm instantly identifies items from identical house types and shows them with a green "verified match" badge - guaranteed perfect fit. For items with small differences (e.g., a carpet 10cm too big for your lounge), we show an amber "close match" highlight with the tolerance difference, so you can decide if it still works for you.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Automatic Dimension Detection</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Sellers don't need to measure anything. When they tell us their house type, we automatically know the dimensions of every room and fixture space. Optionally, sellers can add custom measurements if an item differs from standard, but most of the time, we've already got it covered.
                  </p>
                </div>
              </div>
            </section>

            {/* Join Mailing List */}
            <section className="bg-gradient-to-r from-[#087F8C] to-[#087F8C]/80 rounded-lg p-8 shadow-sm">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-white mb-3">Get Notified When We Launch</h2>
                <p className="text-white/90 text-lg mb-6">
                  Join our mailing list to be the first to know when Refittr goes live in July 2026.
                </p>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-md ${
                    message.type === 'success' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-red-500/20 text-white'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#087F8C]"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white text-[#087F8C] font-semibold rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#087F8C] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#6B7280]">
          <p>&copy; 2025 Refittr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
