/**
 * Tests for player statistics utility functions
 */

import {
  calculateYearEfficiency,
  findPlayerBestYear,
  analyzePlayerYears,
  getPlayerForYear,
  comparePlayers,
  getPlayerTrend,
  findBestPlayersByPosition,
  calculatePlayerRating,
  getTeamCompositionRecommendation,
} from '../player-stats';
import { Player } from '@/types';

describe('player-stats utilities', () => {
  const mockPlayer1: Player = {
    id: 1,
    name: 'LeBron James',
    position: 'SF',
    team: 'Los Angeles Lakers',
    season: 2023,
    gamesPlayed: 82,
    pointsPerGame: 25.0,
    reboundsPerGame: 7.5,
    assistsPerGame: 8.0,
    stealsPerGame: 1.2,
    blocksPerGame: 0.6,
    fieldGoalPercentage: 0.52,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.85,
    imageUrl: null,
    createdAt: new Date('2023-01-01'),
  };

  const mockPlayer2: Player = {
    id: 2,
    name: 'Stephen Curry',
    position: 'PG',
    team: 'Golden State Warriors',
    season: 2023,
    gamesPlayed: 75,
    pointsPerGame: 29.0,
    reboundsPerGame: 5.0,
    assistsPerGame: 6.5,
    stealsPerGame: 1.5,
    blocksPerGame: 0.3,
    fieldGoalPercentage: 0.48,
    threePointPercentage: 0.42,
    freeThrowPercentage: 0.91,
    imageUrl: null,
    createdAt: new Date('2023-01-01'),
  };

  const mockPlayer3Center: Player = {
    id: 3,
    name: 'Joel Embiid',
    position: 'C',
    team: 'Philadelphia 76ers',
    season: 2023,
    gamesPlayed: 66,
    pointsPerGame: 33.0,
    reboundsPerGame: 10.2,
    assistsPerGame: 4.2,
    stealsPerGame: 1.0,
    blocksPerGame: 1.7,
    fieldGoalPercentage: 0.54,
    threePointPercentage: 0.33,
    freeThrowPercentage: 0.86,
    imageUrl: null,
    createdAt: new Date('2023-01-01'),
  };

  describe('calculateYearEfficiency', () => {
    it('calculates efficiency based on all stats', () => {
      const efficiency = calculateYearEfficiency(mockPlayer1);
      expect(efficiency).toBeGreaterThan(0);
      expect(typeof efficiency).toBe('number');
    });

    it('handles player with minimal stats', () => {
      const minimalPlayer: Player = {
        ...mockPlayer1,
        pointsPerGame: 5,
        reboundsPerGame: 2,
        assistsPerGame: 1,
        stealsPerGame: 0.5,
        blocksPerGame: 0.2,
      };
      const efficiency = calculateYearEfficiency(minimalPlayer);
      expect(efficiency).toBeGreaterThan(0);
    });

    it('applies games played penalty for injury-prone seasons', () => {
      const healthyPlayer = { ...mockPlayer1, gamesPlayed: 82 };
      const injuredPlayer = { ...mockPlayer1, gamesPlayed: 40 };

      const healthyEfficiency = calculateYearEfficiency(healthyPlayer);
      const injuredEfficiency = calculateYearEfficiency(injuredPlayer);

      expect(healthyEfficiency).toBeGreaterThan(injuredEfficiency);
    });

    it('handles undefined stats with defaults', () => {
      const playerWithNulls: Player = {
        ...mockPlayer1,
        pointsPerGame: undefined,
        reboundsPerGame: undefined,
        assistsPerGame: undefined,
      };
      const efficiency = calculateYearEfficiency(playerWithNulls);
      expect(efficiency).toBeGreaterThanOrEqual(0);
    });

    it('factors in shooting efficiency', () => {
      const goodShooter = {
        ...mockPlayer1,
        fieldGoalPercentage: 0.60,
        threePointPercentage: 0.45,
        freeThrowPercentage: 0.90,
      };
      const poorShooter = {
        ...mockPlayer1,
        fieldGoalPercentage: 0.35,
        threePointPercentage: 0.25,
        freeThrowPercentage: 0.65,
      };

      const goodEfficiency = calculateYearEfficiency(goodShooter);
      const poorEfficiency = calculateYearEfficiency(poorShooter);

      expect(goodEfficiency).toBeGreaterThan(poorEfficiency);
    });
  });

  describe('findPlayerBestYear', () => {
    it('returns the best year based on efficiency', () => {
      const players = [
        { ...mockPlayer1, season: 2021, pointsPerGame: 20 },
        { ...mockPlayer1, season: 2022, pointsPerGame: 25 },
        { ...mockPlayer1, season: 2023, pointsPerGame: 30 },
      ];
      const bestYear = findPlayerBestYear(players);
      expect(bestYear).toBe(2023);
    });

    it('returns 0 for empty array', () => {
      const bestYear = findPlayerBestYear([]);
      expect(bestYear).toBe(0);
    });

    it('handles single player', () => {
      const bestYear = findPlayerBestYear([mockPlayer1]);
      expect(bestYear).toBe(2023);
    });
  });

  describe('analyzePlayerYears', () => {
    it('analyzes multiple years of player data', () => {
      const players = [
        { ...mockPlayer1, season: 2021 },
        { ...mockPlayer1, season: 2022 },
        { ...mockPlayer1, season: 2023 },
      ];
      const analysis = analyzePlayerYears(players);

      expect(analysis.availableYears).toEqual([2023, 2022, 2021]);
      expect(analysis.bestYear).toBeDefined();
      expect(Object.keys(analysis.yearStats)).toHaveLength(3);
    });

    it('returns empty analysis for no players', () => {
      const analysis = analyzePlayerYears([]);
      expect(analysis.bestYear).toBe(0);
      expect(analysis.availableYears).toEqual([]);
      expect(analysis.yearStats).toEqual({});
    });

    it('sorts years in descending order', () => {
      const players = [
        { ...mockPlayer1, season: 2019 },
        { ...mockPlayer1, season: 2023 },
        { ...mockPlayer1, season: 2021 },
      ];
      const analysis = analyzePlayerYears(players);
      expect(analysis.availableYears).toEqual([2023, 2021, 2019]);
    });

    it('filters out players with no season', () => {
      const players = [
        { ...mockPlayer1, season: 2023 },
        { ...mockPlayer1, season: null },
        { ...mockPlayer1, season: 0 },
      ];
      const analysis = analyzePlayerYears(players);
      expect(analysis.availableYears).toEqual([2023]);
    });
  });

  describe('getPlayerForYear', () => {
    it('returns player for specified year', () => {
      const players = [
        { ...mockPlayer1, season: 2021 },
        { ...mockPlayer1, season: 2022 },
        { ...mockPlayer1, season: 2023 },
      ];
      const player = getPlayerForYear(players, 2022);
      expect(player).toBeDefined();
      expect(player?.season).toBe(2022);
    });

    it('returns null for year not found', () => {
      const players = [{ ...mockPlayer1, season: 2023 }];
      const player = getPlayerForYear(players, 2020);
      expect(player).toBeNull();
    });
  });

  describe('comparePlayers', () => {
    it('compares two players and returns winner', () => {
      const comparison = comparePlayers(mockPlayer1, mockPlayer2);

      expect(comparison.winner).toMatch(/player1|player2|tie/);
      expect(comparison.efficiency1).toBeGreaterThan(0);
      expect(comparison.efficiency2).toBeGreaterThan(0);
      expect(comparison.differences).toBeDefined();
    });

    it('calculates stat differences correctly', () => {
      const comparison = comparePlayers(mockPlayer1, mockPlayer2);

      expect(comparison.differences.pointsPerGame).toBeDefined();
      expect(comparison.differences.reboundsPerGame).toBeDefined();
      expect(comparison.differences.assistsPerGame).toBeDefined();
      expect(comparison.differences.fieldGoalPercentage).toBeDefined();
    });

    it('identifies higher efficiency player as winner', () => {
      const superstar = { ...mockPlayer1, pointsPerGame: 35, assistsPerGame: 12 };
      const average = { ...mockPlayer1, pointsPerGame: 12, assistsPerGame: 3 };

      const comparison = comparePlayers(superstar, average);
      expect(comparison.winner).toBe('player1');
    });
  });

  describe('getPlayerTrend', () => {
    it('identifies improving player trend', () => {
      const players = [
        { ...mockPlayer1, season: 2021, pointsPerGame: 20 },
        { ...mockPlayer1, season: 2022, pointsPerGame: 23 },
        { ...mockPlayer1, season: 2023, pointsPerGame: 28 },
      ];
      const trend = getPlayerTrend(players);

      expect(trend.trend).toMatch(/improving|declining|stable/);
      expect(trend.recentEfficiency).toBeGreaterThan(0);
      expect(trend.careerAverage).toBeGreaterThan(0);
    });

    it('returns stable for single player', () => {
      const trend = getPlayerTrend([mockPlayer1]);
      expect(trend.trend).toBe('stable');
      expect(trend.change).toBe(0);
    });

    it('identifies declining player trend', () => {
      const players = [
        { ...mockPlayer1, season: 2021, pointsPerGame: 28 },
        { ...mockPlayer1, season: 2022, pointsPerGame: 22 },
        { ...mockPlayer1, season: 2023, pointsPerGame: 15 },
      ];
      const trend = getPlayerTrend(players);

      expect(trend.trend).toBe('declining');
      expect(trend.change).toBeLessThan(0);
    });

    it('returns stable for empty array', () => {
      const trend = getPlayerTrend([]);
      expect(trend.trend).toBe('stable');
      expect(trend.recentEfficiency).toBe(0);
      expect(trend.careerAverage).toBe(0);
    });
  });

  describe('findBestPlayersByPosition', () => {
    it('finds best players for each position', () => {
      const players = [mockPlayer1, mockPlayer2, mockPlayer3Center];
      const best = findBestPlayersByPosition(players);

      expect(best.PG).toHaveLength(1);
      expect(best.SF).toHaveLength(1);
      expect(best.C).toHaveLength(1);
    });

    it('excludes taken players', () => {
      const players = [mockPlayer1, mockPlayer2];
      const takenIds = new Set([mockPlayer1.id]);
      const best = findBestPlayersByPosition(players, takenIds);

      expect(best.SF).toHaveLength(0);
      expect(best.PG).toHaveLength(1);
    });

    it('respects position requirements', () => {
      const players = [mockPlayer1, mockPlayer2];
      const requirements = { PG: 2, SG: 1, SF: 1, PF: 1, C: 1 };
      const best = findBestPlayersByPosition(players, new Set(), requirements);

      expect(best.PG).toHaveLength(1); // Only 1 PG available
    });

    it('returns empty arrays for positions with no players', () => {
      const players = [mockPlayer2]; // Only PG
      const best = findBestPlayersByPosition(players);

      expect(best.SG).toEqual([]);
      expect(best.SF).toEqual([]);
      expect(best.PF).toEqual([]);
      expect(best.C).toEqual([]);
    });
  });

  describe('calculatePlayerRating', () => {
    it('calculates rating with position multiplier', () => {
      const rating = calculatePlayerRating(mockPlayer1);
      expect(rating).toBeGreaterThan(0);
    });

    it('applies PG multiplier for point guards', () => {
      const pgRating = calculatePlayerRating(mockPlayer2);
      expect(pgRating).toBeGreaterThan(0);
    });

    it('applies SG multiplier for good shooters', () => {
      const goodSG = { ...mockPlayer1, position: 'SG', threePointPercentage: 0.40 };
      const poorSG = { ...mockPlayer1, position: 'SG', threePointPercentage: 0.25 };

      const goodRating = calculatePlayerRating(goodSG);
      const poorRating = calculatePlayerRating(poorSG);

      expect(goodRating).toBeGreaterThan(poorRating);
    });

    it('applies C multiplier for shot blockers', () => {
      const goodCenter = { ...mockPlayer3Center, blocksPerGame: 2.5 };
      const poorCenter = { ...mockPlayer3Center, blocksPerGame: 0.5 };

      const goodRating = calculatePlayerRating(goodCenter);
      const poorRating = calculatePlayerRating(poorCenter);

      expect(goodRating).toBeGreaterThan(poorRating);
    });

    it('applies PF multiplier for rebounders', () => {
      const goodPF = { ...mockPlayer1, position: 'PF', reboundsPerGame: 10 };
      const poorPF = { ...mockPlayer1, position: 'PF', reboundsPerGame: 5 };

      const goodRating = calculatePlayerRating(goodPF);
      const poorRating = calculatePlayerRating(poorPF);

      expect(goodRating).toBeGreaterThan(poorRating);
    });
  });

  describe('getTeamCompositionRecommendation', () => {
    it('provides team composition with starting five', () => {
      const players = [mockPlayer1, mockPlayer2, mockPlayer3Center];
      const recommendation = getTeamCompositionRecommendation(players);

      expect(recommendation.recommended).toBeDefined();
      expect(recommendation.alternatives).toBeDefined();
      expect(recommendation.depthChart).toBeDefined();
    });

    it('excludes taken players from recommendations', () => {
      const players = [mockPlayer1, mockPlayer2, mockPlayer3Center];
      const takenIds = new Set([mockPlayer1.id]);
      const recommendation = getTeamCompositionRecommendation(players, takenIds);

      const allRecommendedIds = Object.values(recommendation.recommended)
        .flat()
        .map(p => p.id);
      expect(allRecommendedIds).not.toContain(mockPlayer1.id);
    });

    it('creates depth chart with starters and bench', () => {
      const players = [
        mockPlayer1,
        mockPlayer2,
        mockPlayer3Center,
        { ...mockPlayer1, id: 4, position: 'PG' },
        { ...mockPlayer1, id: 5, position: 'SF' },
      ];
      const recommendation = getTeamCompositionRecommendation(players);

      expect(recommendation.depthChart).toBeDefined();
      Object.values(recommendation.depthChart).forEach(positionPlayers => {
        expect(positionPlayers.length).toBeLessThanOrEqual(3); // Max 3 per position
      });
    });

    it('removes starters from alternatives', () => {
      const players = [
        mockPlayer1,
        mockPlayer2,
        mockPlayer3Center,
        { ...mockPlayer1, id: 4, position: 'SF' },
      ];
      const recommendation = getTeamCompositionRecommendation(players);

      const starterIds = new Set(
        Object.values(recommendation.recommended).flat().map(p => p.id)
      );
      const alternativeIds = Object.values(recommendation.alternatives)
        .flat()
        .map(p => p.id);

      alternativeIds.forEach(id => {
        expect(starterIds.has(id)).toBe(false);
      });
    });
  });
});
