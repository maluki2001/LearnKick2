import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { PlayerProfileProvider } from "@/contexts/PlayerProfileContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { VersionCheck } from "@/components/VersionCheck";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnKick - Sports Learning Game",
  description: "A sports-themed, head-to-head learning game for kids aged 6-12 that makes education feel like play",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LearnKick"
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "LearnKick",
    title: "LearnKick - Sports Learning Game",
    description: "A sports-themed, head-to-head learning game for kids aged 6-12"
  }
};

export const viewport = {
  themeColor: "#3B82F6"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ServiceWorkerRegistration />
        <SessionProvider>
          <LanguageProvider>
            <AccessibilityProvider>
              <PlayerProfileProvider>
                <VersionCheck />
                {children}
              </PlayerProfileProvider>
            </AccessibilityProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
