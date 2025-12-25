import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import QueryProvider from "@/providers/query-provider";
import { Header as HouseianaHeader, Footer as HouseianaFooter } from "@/layout";
import { ToastContainer } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#E74C3C',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://houseiana.net'), 
  title: {
    default: "Houseiana - Find Your Perfect Stay",
    template: "%s | Houseiana"
  },
  description: "Discover and book unique holiday homes, apartments, and villas around the world with Houseiana. Experience local living with premium comfort.",
  keywords: ["Holiday Homes", "Vacation Rentals", "Houseiana", "Booking", "Travel", "Accommodation", "Villas", "Apartments"],
  authors: [{ name: "Houseiana Team" }],
  creator: "Houseiana",
  publisher: "Houseiana",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://houseiana.net",
    title: "Houseiana - Find Your Perfect Stay",
    description: "Discover and book unique holiday homes, apartments, and villas around the world.",
    siteName: "Houseiana",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Houseiana Holiday Homes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Houseiana - Find Your Perfect Stay",
    description: "Discover and book unique holiday homes, apartments, and villas around the world.",
    images: ["/og-image.jpg"],
    creator: "@houseiana", 
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Houseiana',
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <QueryProvider>
        <html lang="en">
          <body className={`${inter.variable} font-sans antialiased`}>
            <HouseianaHeader />
            {children}
            <ToastContainer />
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}
