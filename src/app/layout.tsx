import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SPMB 2026 - Sistem Verifikasi Pendaftaran",
  description: "Sistem Verifikasi Penerimaan Murid Baru Tahun 2026",
  manifest: "/api/manifest",
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
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[PWA] Service Worker registered, scope:', reg.scope);
                      reg.update().catch(function() {});
                    })
                    .catch(function(err) {
                      console.warn('[PWA] Service Worker registration failed:', err);
                    });

                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    console.log('[PWA] New Service Worker activated');
                  });
                });

                navigator.serviceWorker.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'SW_UPDATED') {
                    console.log('[PWA] App updated, refresh recommended');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
