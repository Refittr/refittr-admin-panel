import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* ASCII Sad House */}
          <div className="mb-8">
            <pre className="text-[#6B7280] text-sm sm:text-base md:text-lg inline-block font-mono leading-tight">
{`
     /\\
    /  \\
   /    \\
  /______\\
  |  __  |
  | |  | |
  | |__| |
  | .__. |
  |_|  |_|
   ( ͡° ͜ʖ ͡°)
  This page
  doesn't fit!
`}
            </pre>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-[#0F172A] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-[#6B7280] mb-8">
            Looks like this page doesn't match any of our schemas.
            <br />
            Unlike our fixtures, this one just doesn't fit!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#087F8C] text-white font-semibold rounded-lg hover:bg-[#087F8C]/90 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 bg-white text-[#087F8C] font-semibold rounded-lg border-2 border-[#087F8C] hover:bg-[#F8F9FA] transition-colors"
            >
              Learn About Refittr
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-[#6B7280] mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/" className="text-[#087F8C] hover:underline">
                Home
              </Link>
              <span className="text-[#D1D5DB]">•</span>
              <Link href="/about" className="text-[#087F8C] hover:underline">
                About
              </Link>
              <span className="text-[#D1D5DB]">•</span>
              <Link href="/login" className="text-[#087F8C] hover:underline">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#6B7280]">
          <p>&copy; 2026 Refittr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

