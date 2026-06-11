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
// blocks /api/manifest on preview deployments, causing 401 console errors.
// PWA (manifest + service worker) is disabled on preview to avoid these errors.
// On production (custom domain, no DP), PWA works normally.
export const metadata: Metadata = {
  title: "SPMB 2026 - Sistem Verifikasi Pendaftaran",
  description: "Sistem Verifikasi Penerimaan Murid Baru Tahun 2026",
  icons: {
    icon: "/api/app-icon?size=192",
    apple: "/api/app-icon?size=192",
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
        <link rel="icon" type="image/png" sizes="192x192" href="/api/app-icon?size=192" />
        <link rel="apple-touch-icon" href="/api/app-icon?size=192" />
        <link rel="apple-touch-icon" sizes="512x512" href="/api/app-icon?size=512" />
      </head>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
        {/*
          NO manifest link here — it causes 401 errors on Vercel preview (DP blocks it).
          PWA is disabled on preview deployments to keep the console clean.

          Also: unregister any stale service workers from previous deployments
          that might still be fetching /manifest.json or /sw.js in the background.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Unregister stale service workers from previous deployments
              // that may still fetch /manifest.json and cause 401 errors
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(reg) { reg.unregister(); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
