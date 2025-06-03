import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "./structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spark - Transform Ideas Into Reality | Innovation Platform",
  description: "Join a global community of innovators. Share ideas, collaborate on projects, and bring your vision to life with AI-powered tools and supportive mentorship.",
  keywords: ["innovation platform", "idea sharing", "collaboration", "project development", "AI tools", "startup", "entrepreneurs", "creative community"],
  authors: [{ name: "Spark Team" }],
  creator: "Spark Platform",
  publisher: "Spark",
  openGraph: {
    title: "Spark - Transform Ideas Into Reality",
    description: "Join a global community of innovators. Share ideas, collaborate on projects, and bring your vision to life with AI-powered tools.",
    url: "https://spark-frontend-59cy.onrender.com",
    siteName: "Spark Innovation Platform",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark - Transform Ideas Into Reality",
    description: "Join a global community of innovators. Share ideas, collaborate on projects, and bring your vision to life.",
    creator: "@spark_platform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
