import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refittr - Built the same? Fits the same.",
  description: "Precision-fit marketplace for second-hand home fixtures. Buy and sell with confidence using intelligent matching to UK house schemas.",
  openGraph: {
    title: "Refittr - Built the same? Fits the same.",
    description: "Precision-fit marketplace for second-hand home fixtures. Buy and sell with confidence using intelligent matching to UK house schemas.",
    url: "https://www.refittr.co.uk",
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
    title: "Refittr - Built the same? Fits the same.",
    description: "Precision-fit marketplace for second-hand home fixtures. Buy and sell with confidence.",
    images: ["https://www.refittr.co.uk/refittr-app-icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
