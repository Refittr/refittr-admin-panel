'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardNotFound() {
  const router = useRouter()

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Message */}
        <h1 className="text-6xl font-bold text-[#0F172A] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-[#6B7280] mb-8">
          The dashboard page you're looking for doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-white text-[#087F8C] font-semibold rounded-lg border-2 border-[#087F8C] hover:bg-[#F8F9FA] transition-colors"
          >
            Go Back
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#087F8C] text-white font-semibold rounded-lg hover:bg-[#087F8C]/90 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-[#6B7280] mb-4">
            Quick Links
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/dashboard" className="text-[#087F8C] hover:underline">
              Dashboard
            </Link>
            <span className="text-[#D1D5DB]">•</span>
            <Link href="/dashboard/builders" className="text-[#087F8C] hover:underline">
              Builders
            </Link>
            <span className="text-[#D1D5DB]">•</span>
            <Link href="/dashboard/schemas" className="text-[#087F8C] hover:underline">
              Schemas
            </Link>
            <span className="text-[#D1D5DB]">•</span>
            <Link href="/dashboard/rooms" className="text-[#087F8C] hover:underline">
              Rooms
            </Link>
            <span className="text-[#D1D5DB]">•</span>
            <Link href="/dashboard/developments" className="text-[#087F8C] hover:underline">
              Developments
            </Link>
            <span className="text-[#D1D5DB]">•</span>
            <Link href="/dashboard/streets" className="text-[#087F8C] hover:underline">
              Streets
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
