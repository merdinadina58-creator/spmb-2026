import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPMB 2026 - Sistem Verifikasi Pendaftaran",
  description: "Sistem Verifikasi Penerimaan Peserta Didik Baru Tahun 2026",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Initial loading state - shown before React hydrates, prevents blank white page */}
        <div id="initial-loader" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)',
          color: '#6ee7b7', fontFamily: 'system-ui, sans-serif',
          transition: 'opacity 0.3s ease-out'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 16px',
              borderRadius: 16, background: 'rgba(5, 150, 105, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <p style={{ fontSize: 14, opacity: 0.8 }}>Memuat sistem...</p>
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          // Hide initial loader once React hydrates
          setTimeout(function() {
            var loader = document.getElementById('initial-loader');
            if (loader) {
              loader.style.opacity = '0';
              setTimeout(function() { loader.remove(); }, 300);
            }
          }, 500);
        `}} />
        {children}
        <Toaster />
        <noscript>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)',
            color: '#6ee7b7', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 20
          }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>JavaScript Diperlukan</p>
              <p style={{ fontSize: 14, opacity: 0.7 }}>Aplikasi SPMB 2026 memerlukan JavaScript untuk berjalan.</p>
              <p style={{ fontSize: 14, opacity: 0.7 }}>Silakan aktifkan JavaScript di browser Anda.</p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}
