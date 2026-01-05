'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
                  Every year, thousands of perfectly good home fixtures end up in landfills simply because homeowners don't know if they'll fit in their new space. Meanwhile, others spend hundreds or thousands of pounds on new fixtures when quality second-hand options exist.
                </p>
                <p>
                  Refittr solves this problem by bringing precision to the second-hand fixtures market. We've built an intelligent matching system that compares item dimensions to verified UK house builder schemas, giving you confidence that what you buy will actually fit.
                </p>
                <p className="font-semibold text-[#087F8C]">
                  Reduce waste. Save money. Perfect fit guaranteed.
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
                    <h3 className="text-lg font-semibold text-[#0F172A]">Verified House Schemas</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed ml-11">
                    We maintain a comprehensive database of UK house builder floor plans and specifications. From major builders like Persimmon, Taylor Wimpey, and Barratt Homes, we have the exact dimensions of rooms, doorways, and spaces in thousands of UK homes built from 2010 onwards.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#087F8C] text-white font-bold mr-3">2</span>
                    <h3 className="text-lg font-semibold text-[#0F172A]">Intelligent Matching Algorithm</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed ml-11">
                    When you search for a fixture, our algorithm compares the item's dimensions against your house schema. We check if it fits through doorways, if it suits the room dimensions, and if it matches the space constraints. No more guessing, no more measuring mistakes.
                  </p>
                </div>
                <div>
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#087F8C] text-white font-bold mr-3">3</span>
                    <h3 className="text-lg font-semibold text-[#0F172A]">Buy & Sell with Confidence</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed ml-11">
                    Sellers list their items with accurate dimensions. Buyers search knowing exactly what will fit. Our platform shows you only the fixtures that work for your specific house type, eliminating the frustration of purchasing items that don't fit.
                  </p>
                </div>
              </div>
            </section>

            {/* Who We Serve */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Who We Serve</h2>
              <p className="text-[#6B7280] leading-relaxed mb-4">
                Refittr is designed for UK homeowners who live in newer homes (2010+) from major house builders. Our platform is particularly valuable for:
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
                  <span><strong>Verification before purchase</strong> - We verify fit before you commit to buying</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>No guessing games</strong> - Our algorithm tells you definitively if it will fit</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>House-specific recommendations</strong> - See items that work for your exact house type</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Intelligent search</strong> - Filter by your house builder, development, and room type</span>
                </p>
                <p className="flex items-start">
                  <span className="text-[#087F8C] mr-2">✓</span>
                  <span><strong>Specialised platform</strong> - Built exclusively for home fixtures, not general items</span>
                </p>
              </div>
            </section>

            {/* The Team */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">The Team</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Refittr is a bootstrapped startup founded by a team passionate about reducing waste and making home furnishing more accessible and affordable. We're combining technical expertise in data engineering, algorithm development, and marketplace design to solve a real problem that affects thousands of UK homeowners.
              </p>
              <p className="text-[#6B7280] leading-relaxed mt-4">
                Based in the UK and starting with Merseyside, we're committed to building a platform that genuinely helps people while contributing to a more sustainable future.
              </p>
            </section>

            {/* The Technology */}
            <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">The Technology</h2>
              <p className="text-[#6B7280] leading-relaxed mb-6">
                Behind Refittr is sophisticated technology that makes the matching process seamless:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Database of House Schemas</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    We've compiled comprehensive floor plans and specifications from major UK house builders. This includes room dimensions, doorway widths, ceiling heights, and access routes throughout the property.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Intelligent Matching Algorithm</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Our algorithm compares fixture dimensions against your house schema in real-time. It considers not just final placement, but the entire delivery route - doorways, hallways, staircases, and corners.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Verified Measurements</h3>
                  <p className="text-[#6B7280] leading-relaxed">
                    Sellers provide standardised measurements that our system validates. Buyers can trust that the dimensions are accurate and complete.
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
