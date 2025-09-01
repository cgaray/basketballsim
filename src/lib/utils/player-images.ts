/**
 * Player Image Utilities
 * Functions to get NBA player images from various sources
 */

export interface PlayerImageData {
  url: string;
  source: 'nba' | 'fallback';
  alt: string;
}

/**
 * Get NBA player image URL using player name
 * Uses NBA's CDN for official player photos
 */
export function getNBAPlayerImage(playerName: string): PlayerImageData {
  // Clean player name for URL
  const cleanName = playerName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '-');

  // NBA CDN URL pattern
  const nbaUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${cleanName}.png`;
  
  return {
    url: nbaUrl,
    source: 'nba',
    alt: `${playerName} NBA photo`
  };
}

/**
 * Get fallback player image with initials
 * Creates a placeholder with player initials when NBA image is not available
 */
export function getFallbackPlayerImage(playerName: string, team?: string): PlayerImageData {
  const initials = playerName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Create a gradient background based on team colors
  const teamColors = getTeamColors(team);
  
  return {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${teamColors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${teamColors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="280" fill="url(#grad)"/>
        <circle cx="100" cy="80" r="60" fill="rgba(255,255,255,0.1)"/>
        <text x="100" y="95" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
        <text x="100" y="250" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" opacity="0.8">${playerName}</text>
      </svg>
    `)}`,
    source: 'fallback',
    alt: `${playerName} placeholder`
  };
}

/**
 * Get team colors for gradient backgrounds
 */
function getTeamColors(team?: string): { primary: string; secondary: string } {
  const teamColorMap: Record<string, { primary: string; secondary: string }> = {
    'Los Angeles Lakers': { primary: '#552583', secondary: '#FDB927' },
    'Golden State Warriors': { primary: '#1D428A', secondary: '#FFC72C' },
    'Phoenix Suns': { primary: '#1D1160', secondary: '#E56020' },
    'Milwaukee Bucks': { primary: '#00471B', secondary: '#EEE1C6' },
    'Denver Nuggets': { primary: '#0E2240', secondary: '#FEC524' },
    'Dallas Mavericks': { primary: '#00538C', secondary: '#002B5E' },
    'Philadelphia 76ers': { primary: '#006BB6', secondary: '#ED174C' },
    'Boston Celtics': { primary: '#007A33', secondary: '#BA9653' },
    'Los Angeles Clippers': { primary: '#C8102E', secondary: '#1D428A' },
    'Miami Heat': { primary: '#98002E', secondary: '#F9A01B' },
    'Indiana Pacers': { primary: '#002D62', secondary: '#FDBB30' },
    'Oklahoma City Thunder': { primary: '#007AC1', secondary: '#EF3B24' },
    'Memphis Grizzlies': { primary: '#5D76A9', secondary: '#12173F' },
    'New Orleans Pelicans': { primary: '#0C2340', secondary: '#C8102E' },
    'Atlanta Hawks': { primary: '#E03A3E', secondary: '#C1D32F' },
  };

  return teamColorMap[team || ''] || { primary: '#374151', secondary: '#6B7280' };
}

/**
 * Get player image with fallback handling
 */
export function getPlayerImage(playerName: string, team?: string): PlayerImageData {
  try {
    return getNBAPlayerImage(playerName);
  } catch (error) {
    return getFallbackPlayerImage(playerName, team);
  }
}

/**
 * Check if an image URL is valid
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Get optimized player image with validation
 */
export async function getOptimizedPlayerImage(playerName: string, team?: string): Promise<PlayerImageData> {
  const nbaImage = getNBAPlayerImage(playerName);
  
  try {
    const isValid = await isValidImageUrl(nbaImage.url);
    if (isValid) {
      return nbaImage;
    }
  } catch {
    // Fall through to fallback
  }
  
  return getFallbackPlayerImage(playerName, team);
}
