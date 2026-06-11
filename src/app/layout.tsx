import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

// NOTE: manifest is NOT included here because Vercel Deployment Protection
// blocks the manifest fetch on preview deployments, causing 401 console errors.
// The manifest link is added dynamically after authentication succeeds (see page.tsx).
export const metadata: Metadata = {
  title: "SPMB 2026 - Sistem Verifikasi Pendaftaran",
  description: "Sistem Verifikasi Penerimaan Murid Baru Tahun 2026",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SPMB 2026",
  },
  applicationName: "SPMB 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
      </head>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
        {/*
          Service Worker and manifest are NOT registered here.
          They are added dynamically after authentication succeeds (see page.tsx)
          to avoid 401 errors from Vercel Deployment Protection on preview deployments.
        */}
      </body>
    </html>
  );
}
