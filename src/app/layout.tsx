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
// The manifest link and service worker are added dynamically after the user
// authenticates (see page.tsx).
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
          NO manifest link, NO service worker registration here.
          Both are added dynamically after authentication succeeds (see page.tsx)
          to prevent 401 console errors from Vercel Deployment Protection.

          Also: unregister any stale service workers from previous deployments
          that might still be fetching /manifest.json in the background.
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
