import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import AuthBootstrapper from "@/components/AuthBootstrapper";
import AppToaster from "@/components/AppToaster";
import SWRProvider from "@/components/SWRProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIAT Insider | Student Reviews, Campus Life & Admission Guides",
  description:
    "Read NIAT campus life reviews, hostel realities, admission guidance and placement insights from students. Compare campuses and start your NIAT journey confidently.",
  keywords: [
    "NIAT",
    "niat insider",
    "niat university",
    "niat admissions",
    "niat campus life",
    "niat placements",
    "niat btech reviews",
    "niat hostel review",
    "niat student platform",
    "college guide india",
  ],
  metadataBase: new URL("https://www.niatinsider.com"),
  alternates: {
    canonical: "https://www.niatinsider.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/niat.svg", type: "image/svg+xml" }],
    shortcut: ["/niat.svg"],
    apple: ["/niat.svg"],
  },
  openGraph: {
    title: "NIAT Insider | Student Reviews, Campus Life & Admission Guides",
    description:
      "Read NIAT campus life reviews, hostel realities, admission guidance and placement insights from students. Compare campuses and start your NIAT journey confidently.",
    url: "https://www.niatinsider.com",
    siteName: "NIAT Insider",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://www.niatinsider.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "NIAT Insider | Student Reviews, Campus Life & Admission Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NIAT Insider | Student Reviews, Campus Life & Admission Guides",
    description:
      "Read NIAT campus life reviews, hostel realities, admission guidance and placement insights from students. Compare campuses and start your NIAT journey confidently.",
    images: ["https://www.niatinsider.com/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NIAT Insider",
    url: "https://www.niatinsider.com",
    logo: "https://www.niatinsider.com/niat.svg",
    sameAs: ["https://www.niatinsider.com"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T2Y84XG7GL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T2Y84XG7GL');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <SWRProvider>
          <AuthBootstrapper />
          {children}
          <AppToaster />
        </SWRProvider>
      </body>
    </html>
  );
}
