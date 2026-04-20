import type { Metadata } from 'next';
import {
  Inter_Tight,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Space_Grotesk,
  Fraunces,
} from 'next/font/google';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex',
  display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SunoStudio — AI Music Creation',
  description: 'Professional AI music generation studio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[
        interTight.variable,
        jetbrainsMono.variable,
        ibmPlexMono.variable,
        spaceGrotesk.variable,
        fraunces.variable,
      ].join(' ')}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
