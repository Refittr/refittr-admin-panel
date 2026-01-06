import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About Refittr - Revolutionising Second-Hand Home Fixtures",
  description: "Learn how Refittr uses house-to-house matching to guarantee perfect fits. Same house builder, same house type = everything fits. No measuring needed.",
  openGraph: {
    title: "About Refittr - Revolutionising Second-Hand Home Fixtures",
    description: "Learn how Refittr uses house-to-house matching to guarantee perfect fits. Same house builder, same house type = everything fits.",
    url: "https://www.refittr.co.uk/about",
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
    title: "About Refittr - Revolutionising Second-Hand Home Fixtures",
    description: "Learn how Refittr uses house-to-house matching to guarantee perfect fits. Same house = perfect fit.",
    images: ["https://www.refittr.co.uk/refittr-app-icon-512.png"],
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
