import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import './globals.css';
import './motion.css';
import './travel-search.css';
import './film.css';
import './v2/v2.css';

const poppins = localFont({
  src: [
    { path: '../public/fonts/type-3.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/type-4.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/type-5.ttf', weight: '600', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

const oswald = localFont({
  src: [
    { path: '../public/fonts/type-0.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/type-1.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/type-2.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-oswald',
  display: 'swap',
});

const fjordBC = localFont({
  src: '../public/fonts/fjord-bc.woff',
  weight: '400',
  style: 'normal',
  variable: '--font-brand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KHUVÉ — Discover Da Nang & Vietnam',
  description:
    'Discover Da Nang and explore Vietnam with KHUVÉ. Find trip ideas for Hoi An, Ha Long, Hue, Phu Quoc, Sa Pa, and Hanoi.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${oswald.variable} ${fjordBC.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
