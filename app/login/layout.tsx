import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Admin Login - Refittr",
  description: "Login to the Refittr admin panel to manage house schemas, builders, developments, and marketplace listings.",
  openGraph: {
    title: "Admin Login - Refittr",
    description: "Login to the Refittr admin panel.",
    url: "https://www.refittr.co.uk/login",
    siteName: "Refittr",
    images: [{
      url: "https://www.refittr.co.uk/refittr-app-icon-512.png",
      width: 512,
      height: 512,
      alt: "Refittr Logo",
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Login - Refittr",
    description: "Login to the Refittr admin panel.",
    images: ["https://www.refittr.co.uk/refittr-app-icon-512.png"],
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
