/**
 * Player Profile demo page
 * Renders the PlayerProfile screen ported from Claude Design.
 *
 * Loads the design's fonts (Oswald for stat numerals, Public Sans for body) via
 * next/font, exposed as CSS variables the component references.
 */

import { Oswald, Public_Sans } from 'next/font/google';
import { PlayerProfile } from '@/components/players/PlayerProfile';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
  display: 'swap',
});

export default function PlayerProfilePage() {
  return (
    <div className={`${oswald.variable} ${publicSans.variable}`}>
      <PlayerProfile />
    </div>
  );
}
