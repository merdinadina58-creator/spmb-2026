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
  manifest: "/manifest.json",
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
        {/* Service Worker Registration — with silent error handling to avoid console 401s */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      reg.update().catch(function() {});
                    })
                    .catch(function() {
                      // Silently fail — PWA is optional
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
