/**
 * Player Statistics Utilities
 * Functions to analyze player performance and find best years
 */

import { Player } from '@/types';

export interface PlayerYearAnalysis {
  bestYear: number;
  availableYears: number[];
  yearStats: Record<number, Player>;
}

/**
 * Calculate a player's efficiency rating for a given year
 */
export function calculateYearEfficiency(player: Player): number {
  const {
    pointsPerGame = 0,
    reboundsPerGame = 0,
    assistsPerGame = 0,
    stealsPerGame = 0,
    blocksPerGame = 0,
    fieldGoalPercentage = 0,
    threePointPercentage = 0,
    freeThrowPercentage = 0,
    gamesPlayed = 0,
  } = player;

  // Base efficiency calculation
  let efficiency = pointsPerGame * 1.0;
  efficiency += reboundsPerGame * 1.2;
  efficiency += assistsPerGame * 1.5;
  efficiency += stealsPerGame * 2.0;
  efficiency += blocksPerGame * 2.0;

  // Shooting efficiency bonus
  const shootingEfficiency = (fieldGoalPercentage * 0.4) + (threePointPercentage * 0.3) + (freeThrowPercentage * 0.3);
  efficiency *= (0.8 + shootingEfficiency * 0.4);

  // Games played penalty for injury-prone seasons
  if (gamesPlayed < 70) {
    efficiency *= (gamesPlayed / 82);
  }

  return Math.round(efficiency * 10) / 10;
}

/**
 * Find the best year for a player based on their statistics
 */
export function findPlayerBestYear(players: Player[]): number {
  if (players.length === 0) return 0;

  let bestYear = players[0].season || 0;
  let bestEfficiency = 0;

  players.forEach(player => {
    const efficiency = calculateYearEfficiency(player);
    if (efficiency > bestEfficiency) {
      bestEfficiency = efficiency;
      bestYear = player.season || 0;
    }
  });

  return bestYear;
}

/**
 * Analyze a player's career statistics across multiple years
 */
export function analyzePlayerYears(players: Player[]): PlayerYearAnalysis {
  if (players.length === 0) {
    return {
      bestYear: 0,
      availableYears: [],
      yearStats: {},
    };
  }

  // Group players by year
  const yearStats: Record<number, Player> = {};
  const availableYears: number[] = [];

  players.forEach(player => {
    const year = player.season || 0;
    if (year > 0) {
      yearStats[year] = player;
      if (!availableYears.includes(year)) {
        availableYears.push(year);
      }
    }
  });

  // Sort years in descending order
  availableYears.sort((a, b) => b - a);

  // Find best year
  const bestYear = findPlayerBestYear(players);

  return {
    bestYear,
    availableYears,
    yearStats,
  };
}

/**
 * Get player statistics for a specific year
 */
export function getPlayerForYear(players: Player[], year: number): Player | null {
  return players.find(player => player.season === year) || null;
}

/**
 * Compare two players' statistics
 */
export function comparePlayers(player1: Player, player2: Player): {
  winner: 'player1' | 'player2' | 'tie';
  efficiency1: number;
  efficiency2: number;
  differences: Record<string, { player1: number; player2: number; difference: number }>;
} {
  const efficiency1 = calculateYearEfficiency(player1);
  const efficiency2 = calculateYearEfficiency(player2);

  const differences = {
    pointsPerGame: {
      player1: player1.pointsPerGame || 0,
      player2: player2.pointsPerGame || 0,
      difference: (player1.pointsPerGame || 0) - (player2.pointsPerGame || 0),
    },
    reboundsPerGame: {
      player1: player1.reboundsPerGame || 0,
      player2: player2.reboundsPerGame || 0,
      difference: (player1.reboundsPerGame || 0) - (player2.reboundsPerGame || 0),
    },
    assistsPerGame: {
      player1: player1.assistsPerGame || 0,
      player2: player2.assistsPerGame || 0,
      difference: (player1.assistsPerGame || 0) - (player2.assistsPerGame || 0),
    },
    fieldGoalPercentage: {
      player1: player1.fieldGoalPercentage || 0,
      player2: player2.fieldGoalPercentage || 0,
      difference: (player1.fieldGoalPercentage || 0) - (player2.fieldGoalPercentage || 0),
    },
  };

  let winner: 'player1' | 'player2' | 'tie' = 'tie';
  if (efficiency1 > efficiency2) {
    winner = 'player1';
  } else if (efficiency2 > efficiency1) {
    winner = 'player2';
  }

  return {
    winner,
    efficiency1,
    efficiency2,
    differences,
  };
}

/**
 * Get trending statistics for a player (improving/declining)
 */
export function getPlayerTrend(players: Player[]): {
  trend: 'improving' | 'declining' | 'stable';
  recentEfficiency: number;
  careerAverage: number;
  change: number;
} {
  if (players.length < 2) {
    return {
      trend: 'stable',
      recentEfficiency: 0,
      careerAverage: 0,
      change: 0,
    };
  }

  // Sort by year (most recent first)
  const sortedPlayers = [...players].sort((a, b) => (b.season || 0) - (a.season || 0));

  const recentEfficiency = calculateYearEfficiency(sortedPlayers[0]);
  const careerAverage = sortedPlayers.reduce((sum, player) => sum + calculateYearEfficiency(player), 0) / sortedPlayers.length;

  const change = recentEfficiency - careerAverage;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (change > 2) {
    trend = 'improving';
  } else if (change < -2) {
    trend = 'declining';
  }

  return {
    trend,
    recentEfficiency,
    careerAverage,
    change,
  };
}

/**
 * Find the best available players for each position
 */
export function findBestPlayersByPosition(
  availablePlayers: Player[],
  takenPlayerIds: Set<number> = new Set(),
  requirements: Record<string, number> = { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 }
): Record<string, Player[]> {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  const result: Record<string, Player[]> = {};

  // Initialize result object with empty arrays for each position
  positions.forEach(pos => {
    result[pos] = [];
  });

  // Filter out taken players
  const available = availablePlayers.filter(player => !takenPlayerIds.has(player.id));

  // Group players by position
  const playersByPosition: Record<string, Player[]> = {};
  positions.forEach(pos => {
    playersByPosition[pos] = available.filter(player => player.position === pos);
  });

  // For each position, find the best players based on efficiency
  positions.forEach(position => {
    const positionPlayers = playersByPosition[position];

    // Sort by efficiency (highest first)
    const sortedPlayers = positionPlayers
      .map(player => ({
        player,
        efficiency: calculateYearEfficiency(player),
        gamesPlayed: player.gamesPlayed || 0,
      }))
      .sort((a, b) => {
        // Primary sort: efficiency (higher is better)
        if (b.efficiency !== a.efficiency) {
          return b.efficiency - a.efficiency;
        }
        // Secondary sort: games played (more games is better, indicates healthy season)
        return b.gamesPlayed - a.gamesPlayed;
      });

    // Take the required number of players for this position
    const requiredCount = requirements[position] || 1;
    result[position] = sortedPlayers
      .slice(0, requiredCount)
      .map(item => item.player);
  });

  return result;
}

/**
 * Find the worst available players for each position (for fun challenges!)
 */
export function findWorstPlayersByPosition(
  availablePlayers: Player[],
  takenPlayerIds: Set<number> = new Set(),
  requirements: Record<string, number> = { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 }
): Record<string, Player[]> {
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
  const result: Record<string, Player[]> = {};

  // Initialize result object with empty arrays for each position
  positions.forEach(pos => {
    result[pos] = [];
  });

  // Filter out taken players
  const available = availablePlayers.filter(player => !takenPlayerIds.has(player.id));

  // Group players by position
  const playersByPosition: Record<string, Player[]> = {};
  positions.forEach(pos => {
    playersByPosition[pos] = available.filter(player => player.position === pos);
  });

  // For each position, find the WORST players based on efficiency
  positions.forEach(position => {
    const positionPlayers = playersByPosition[position];

    // Sort by efficiency (LOWEST first - reverse of findBestPlayersByPosition)
    const sortedPlayers = positionPlayers
      .map(player => ({
        player,
        efficiency: calculateYearEfficiency(player),
        gamesPlayed: player.gamesPlayed || 0,
      }))
      .sort((a, b) => {
        // Primary sort: efficiency (LOWER is "better" for worst team)
        if (a.efficiency !== b.efficiency) {
          return a.efficiency - b.efficiency;
        }
        // Secondary sort: games played (fewer games for worst)
        return a.gamesPlayed - b.gamesPlayed;
      });

    // Take the required number of worst players for this position
    const requiredCount = requirements[position] || 1;
    result[position] = sortedPlayers
      .slice(0, requiredCount)
      .map(item => item.player);
  });

  return result;
}

/**
 * Calculate a comprehensive player rating for position-based selection
 */
export function calculatePlayerRating(player: Player): number {
  const efficiency = calculateYearEfficiency(player);

  // Position-specific adjustments
  let positionMultiplier = 1.0;
  switch (player.position) {
    case 'PG':
      // Point guards value assists and efficiency
      positionMultiplier = 1.1;
      break;
    case 'SG':
      // Shooting guards value scoring and 3-point shooting
      positionMultiplier = player.threePointPercentage > 0.35 ? 1.05 : 0.95;
      break;
    case 'SF':
      // Small forwards are well-rounded
      positionMultiplier = 1.0;
      break;
    case 'PF':
      // Power forwards value rebounding and defense
      positionMultiplier = player.reboundsPerGame > 8 ? 1.05 : 0.95;
      break;
    case 'C':
      // Centers value size and interior defense
      positionMultiplier = player.blocksPerGame > 1.5 ? 1.1 : 0.9;
      break;
  }

  return efficiency * positionMultiplier;
}

/**
 * Get team composition recommendations based on available players
 */
export function getTeamCompositionRecommendation(
  availablePlayers: Player[],
  takenPlayerIds: Set<number> = new Set()
): {
  recommended: Record<string, Player[]>;
  alternatives: Record<string, Player[]>;
  depthChart: Record<string, Player[]>;
} {
  const available = availablePlayers.filter(player => !takenPlayerIds.has(player.id));

  // Starting 5 (best players at each position)
  const startingFive = findBestPlayersByPosition(available, takenPlayerIds, {
    PG: 1, SG: 1, SF: 1, PF: 1, C: 1
  });

  // Bench depth (2-3 players per position)
  const benchDepth = findBestPlayersByPosition(available, takenPlayerIds, {
    PG: 2, SG: 2, SF: 2, PF: 2, C: 2
  });

  // Alternative options (next best 2 players per position)
  const alternatives = findBestPlayersByPosition(available, takenPlayerIds, {
    PG: 2, SG: 2, SF: 2, PF: 2, C: 2
  });

  // Remove players already selected in starting five from alternatives
  const startingPlayerIds = new Set(
    Object.values(startingFive).flat().map(p => p.id)
  );

  Object.keys(alternatives).forEach(position => {
    alternatives[position] = alternatives[position].filter(
      player => !startingPlayerIds.has(player.id)
    );
  });

  // Create depth chart (combine starting + bench)
  const depthChart: Record<string, Player[]> = {};
  Object.keys(startingFive).forEach(position => {
    depthChart[position] = [
      ...startingFive[position],
      ...benchDepth[position].slice(0, 2) // Limit bench to 2 per position
    ];
  });

  return {
    recommended: startingFive,
    alternatives,
    depthChart,
  };
}
