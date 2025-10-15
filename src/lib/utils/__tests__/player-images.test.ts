/**
 * Tests for player image utility functions
 */

import {
  getNBAPlayerImage,
  getFallbackPlayerImage,
  getPlayerImage,
  isValidImageUrl,
  getOptimizedPlayerImage,
} from '../player-images';

// Mock global fetch for testing
global.fetch = jest.fn();

describe('player-images utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNBAPlayerImage', () => {
    it('generates NBA CDN URL from player name', () => {
      const result = getNBAPlayerImage('LeBron James');

      expect(result.url).toContain('cdn.nba.com');
      expect(result.url).toContain('lebron-james');
      expect(result.source).toBe('nba');
      expect(result.alt).toBe('LeBron James NBA photo');
    });

    it('cleans player name for URL', () => {
      const result = getNBAPlayerImage("Luka Dončić");

      expect(result.url).toContain('luka-doni');
      expect(result.url).not.toContain('č');
    });

    it('handles names with multiple spaces', () => {
      const result = getNBAPlayerImage('Karl-Anthony  Towns');

      expect(result.url).toContain('karlanthony-towns');
      expect(result.url).not.toMatch(/\s{2,}/);
    });

    it('handles names with special characters', () => {
      const result = getNBAPlayerImage("Michael O'Brien Jr.");

      expect(result.url).toContain('michael-obrien-jr');
      expect(result.url).not.toContain("'");
      expect(result.url).not.toContain('.');
    });

    it('converts to lowercase', () => {
      const result = getNBAPlayerImage('STEPHEN CURRY');

      expect(result.url).toContain('stephen-curry');
      expect(result.url).not.toMatch(/[A-Z]/);
    });
  });

  describe('getFallbackPlayerImage', () => {
    it('generates SVG fallback with player initials', () => {
      const result = getFallbackPlayerImage('LeBron James');

      expect(result.url).toContain('data:image/svg+xml');
      expect(result.url).toContain('LJ');
      expect(result.source).toBe('fallback');
      expect(result.alt).toBe('LeBron James placeholder');
    });

    it('extracts correct initials from name', () => {
      const result = getFallbackPlayerImage('Stephen Curry');

      expect(result.url).toContain('SC');
    });

    it('handles single name', () => {
      const result = getFallbackPlayerImage('Giannis');

      expect(result.url).toContain('GI');
    });

    it('limits initials to 2 characters', () => {
      const result = getFallbackPlayerImage('Karl-Anthony Towns');

      // Should extract first letters of first two words
      const decodedUrl = decodeURIComponent(result.url);
      expect(decodedUrl).toMatch(/[A-Z]{2}/);
    });

    it('uses team colors when team provided', () => {
      const result = getFallbackPlayerImage('LeBron James', 'Los Angeles Lakers');

      expect(result.url).toContain('#552583'); // Lakers purple
      expect(result.url).toContain('#FDB927'); // Lakers gold
    });

    it('uses default colors for unknown team', () => {
      const result = getFallbackPlayerImage('John Doe', 'Unknown Team');

      expect(result.url).toContain('#374151');
      expect(result.url).toContain('#6B7280');
    });

    it('uses default colors when no team provided', () => {
      const result = getFallbackPlayerImage('John Doe');

      expect(result.url).toContain('#374151');
    });

    it('includes player name in SVG', () => {
      const result = getFallbackPlayerImage('LeBron James');
      const decodedUrl = decodeURIComponent(result.url);

      expect(decodedUrl).toContain('LeBron James');
    });

    it('generates valid SVG structure', () => {
      const result = getFallbackPlayerImage('Test Player');
      const decodedUrl = decodeURIComponent(result.url);

      expect(decodedUrl).toContain('<svg');
      expect(decodedUrl).toContain('</svg>');
      expect(decodedUrl).toContain('<linearGradient');
      expect(decodedUrl).toContain('<text');
    });
  });

  describe('getPlayerImage', () => {
    it('returns NBA image by default', () => {
      const result = getPlayerImage('LeBron James');

      expect(result.source).toBe('nba');
      expect(result.url).toContain('cdn.nba.com');
    });

    it('passes team to fallback on error', () => {
      // Force an error by mocking getNBAPlayerImage to throw
      jest.spyOn(require('../player-images'), 'getNBAPlayerImage').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = getPlayerImage('LeBron James', 'Los Angeles Lakers');

      expect(result.source).toBe('fallback');
      expect(result.url).toContain('#552583'); // Lakers colors
    });
  });

  describe('isValidImageUrl', () => {
    it('returns true for valid image URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
      });

      const result = await isValidImageUrl('https://example.com/image.png');
      expect(result).toBe(true);
    });

    it('returns false for non-OK response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        headers: {
          get: jest.fn(),
        },
      });

      const result = await isValidImageUrl('https://example.com/image.png');
      expect(result).toBe(false);
    });

    it('returns false for non-image content type', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      });

      const result = await isValidImageUrl('https://example.com/page.html');
      expect(result).toBe(false);
    });

    it('returns false on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await isValidImageUrl('https://example.com/image.png');
      expect(result).toBe(false);
    });

    it('uses HEAD method for efficiency', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/jpeg'),
        },
      });

      await isValidImageUrl('https://example.com/image.jpg');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        { method: 'HEAD' }
      );
    });
  });

  describe('getOptimizedPlayerImage', () => {
    it('returns NBA image when valid', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
      });

      const result = await getOptimizedPlayerImage('LeBron James');

      expect(result.source).toBe('nba');
      expect(result.url).toContain('cdn.nba.com');
    });

    it('returns fallback image when NBA image invalid', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        headers: {
          get: jest.fn(),
        },
      });

      const result = await getOptimizedPlayerImage('LeBron James');

      expect(result.source).toBe('fallback');
    });

    it('returns fallback on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getOptimizedPlayerImage('LeBron James');

      expect(result.source).toBe('fallback');
    });

    it('passes team to fallback when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        headers: {
          get: jest.fn(),
        },
      });

      const result = await getOptimizedPlayerImage('LeBron James', 'Los Angeles Lakers');

      expect(result.source).toBe('fallback');
      expect(result.url).toContain('#552583'); // Lakers colors
    });
  });

  describe('team colors mapping', () => {
    const teamsToTest = [
      { team: 'Los Angeles Lakers', primary: '#552583', secondary: '#FDB927' },
      { team: 'Golden State Warriors', primary: '#1D428A', secondary: '#FFC72C' },
      { team: 'Boston Celtics', primary: '#007A33', secondary: '#BA9653' },
      { team: 'Miami Heat', primary: '#98002E', secondary: '#F9A01B' },
      { team: 'Phoenix Suns', primary: '#1D1160', secondary: '#E56020' },
    ];

    teamsToTest.forEach(({ team, primary, secondary }) => {
      it(`uses correct colors for ${team}`, () => {
        const result = getFallbackPlayerImage('Test Player', team);

        expect(result.url).toContain(primary);
        expect(result.url).toContain(secondary);
      });
    });
  });
});
