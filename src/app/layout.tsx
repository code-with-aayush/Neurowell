
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showFooter = !['/login', '/signup', '/patients'].includes(pathname);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <title>NeuroWell Monitor for Professionals</title>
        <meta name="description" content="Empowering clinicians with real-time biometric data and AI-powered insights for patient care." />
      </head>
      <body className="font-body antialiased h-full bg-background" suppressHydrationWarning={true}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          {showFooter && <Footer />}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
