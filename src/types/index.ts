/**
 * Core type definitions for the Basketball Team Builder & Simulator
 */

export interface Player {
  id: number;
  name: string;
  position: string;
  team?: string;
  season?: number;
  gamesPlayed?: number;
  pointsPerGame?: number;
  reboundsPerGame?: number;
  assistsPerGame?: number;
  stealsPerGame?: number;
  blocksPerGame?: number;
  fieldGoalPercentage?: number;
  threePointPercentage?: number;
  freeThrowPercentage?: number;
  imageUrl?: string;
  createdAt: Date;
}

export interface Team {
  id: number;
  name: string;
  userId?: string;
  players: number[]; // Array of player IDs
  createdAt: Date;
}

export interface Match {
  id: number;
  team1Id: number;
  team2Id: number;
  team1Score: number;
  team2Score: number;
  winnerId?: number;
  playByPlay?: PlayByPlayEvent[];
  createdAt: Date;
}

export interface PlayByPlayEvent {
  id: string;
  quarter: number;
  time: string; // MM:SS format
  team: 'team1' | 'team2';
  playerId: number;
  playerName: string;
  action: string;
  points: number;
  description: string;
}

export interface GameStats {
  playerId: number;
  playerName: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fieldGoalAttempts: number;
  fieldGoalMade: number;
  threePointAttempts: number;
  threePointMade: number;
  freeThrowAttempts: number;
  freeThrowMade: number;
  minutesPlayed: number;
}

export interface TeamStats {
  teamId: number;
  teamName: string;
  score: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  playerStats: GameStats[];
}

export interface SimulationResult {
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  playByPlay: PlayByPlayEvent[];
  winner: number;
  finalScore: {
    team1: number;
    team2: number;
  };
}

export interface PlayerCard {
  player: Player;
  isSelected: boolean;
  isDragging: boolean;
  position?: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
}

export interface TeamBuilderState {
  team1: {
    name: string;
    players: PlayerCard[];
  };
  team2: {
    name: string;
    players: PlayerCard[];
  };
  availablePlayers: PlayerCard[];
}

export interface SearchFilters {
  position?: string;
  team?: string;
  minPoints?: number;
  maxPoints?: number;
  minRebounds?: number;
  maxRebounds?: number;
  minAssists?: number;
  maxAssists?: number;
  season?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PlayerSearchResult {
  players: Player[];
  pagination: PaginationParams;
}

// Basketball-specific types
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface PositionRequirements {
  PG: number; // Point Guard
  SG: number; // Shooting Guard
  SF: number; // Small Forward
  PF: number; // Power Forward
  C: number;  // Center
}

export const DEFAULT_POSITION_REQUIREMENTS: PositionRequirements = {
  PG: 1,
  SG: 1,
  SF: 1,
  PF: 1,
  C: 1,
};

export interface GameSettings {
  quarters: number;
  quarterLength: number; // in minutes
  shotClock: number; // in seconds
  enablePlayByPlay: boolean;
  simulationSpeed: 'slow' | 'normal' | 'fast';
}
