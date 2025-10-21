/**
 * Application-wide constants for Basketball Team Builder & Simulator
 */

// Team Roster Limits
export const MAX_ROSTER_SIZE = 15;
export const MIN_ROSTER_SIZE = 1;
export const STARTING_LINEUP_SIZE = 5;

// Basketball Positions
export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;

export const POSITION_NAMES = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
} as const;

// Default position requirements for a valid starting lineup
export const DEFAULT_POSITION_REQUIREMENTS = {
  PG: 1,
  SG: 1,
  SF: 1,
  PF: 1,
  C: 1,
} as const;

// Position colors (used in UI)
export const POSITION_COLORS = {
  PG: 'blue',
  SG: 'green',
  SF: 'purple',
  PF: 'orange',
  C: 'red',
} as const;

// Game Simulation Settings
export const DEFAULT_GAME_SETTINGS = {
  quarters: 4,
  quarterLength: 12, // minutes
  shotClock: 24, // seconds
  overtimeLength: 5, // minutes
  enablePlayByPlay: true,
  simulationSpeed: 'normal',
} as const;

// API Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 1000;

// Player Stats Thresholds (for efficiency/rarity calculations)
export const EFFICIENCY_THRESHOLDS = {
  ELITE: 0.8,      // Top 20% - Legendary
  GREAT: 0.6,      // Top 40% - Epic
  GOOD: 0.4,       // Top 60% - Rare
  AVERAGE: 0.2,    // Top 80% - Uncommon
  BELOW_AVERAGE: 0, // Bottom 20% - Common
} as const;

// Team Name Validation
export const TEAM_NAME_MIN_LENGTH = 1;
export const TEAM_NAME_MAX_LENGTH = 50;

// Performance Targets (from CLAUDE.md)
export const PERFORMANCE_TARGETS = {
  loadTimeMs: 2000, // 2 seconds
  targetFps: 60,
} as const;
