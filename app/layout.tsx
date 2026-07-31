import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Space_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'Mister Rosso Kitchenette',
  description: 'Menú fresco de fusión asiática con especialidades diarias. Ubicado en Querétaro, México.',
  keywords: ['Mister Rosso', 'Kitchenette', 'Comida Asiática', 'Querétaro', 'Tacos', 'Menú'],
  openGraph: {
    title: 'Mister Rosso Kitchenette',
    description: 'Menú fresco de fusión asiática con especialidades diarias.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${dmSans.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
