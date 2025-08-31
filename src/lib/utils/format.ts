/**
 * Utility functions for formatting basketball statistics and data
 */

/**
 * Format a number as a percentage with 1 decimal place
 * @param value - Number to format (0-1)
 * @returns string - Formatted percentage
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format a number with 1 decimal place
 * @param value - Number to format
 * @returns string - Formatted number
 */
export function formatDecimal(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return value.toFixed(1);
}

/**
 * Format a number as a whole number
 * @param value - Number to format
 * @returns string - Formatted number
 */
export function formatInteger(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return Math.round(value).toString();
}

/**
 * Format time in MM:SS format
 * @param seconds - Time in seconds
 * @returns string - Formatted time
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format player name for display
 * @param name - Player name
 * @returns string - Formatted name
 */
export function formatPlayerName(name: string): string {
  return name.trim();
}

/**
 * Get position abbreviation from full position name
 * @param position - Full position name
 * @returns string - Position abbreviation
 */
export function getPositionAbbreviation(position: string): string {
  const positionMap: Record<string, string> = {
    'Point Guard': 'PG',
    'Shooting Guard': 'SG',
    'Small Forward': 'SF',
    'Power Forward': 'PF',
    'Center': 'C',
    'PG': 'PG',
    'SG': 'SG',
    'SF': 'SF',
    'PF': 'PF',
    'C': 'C',
  };
  
  return positionMap[position] || position;
}

/**
 * Get full position name from abbreviation
 * @param abbreviation - Position abbreviation
 * @returns string - Full position name
 */
export function getFullPositionName(abbreviation: string): string {
  const positionMap: Record<string, string> = {
    'PG': 'Point Guard',
    'SG': 'Shooting Guard',
    'SF': 'Small Forward',
    'PF': 'Power Forward',
    'C': 'Center',
  };
  
  return positionMap[abbreviation] || abbreviation;
}

/**
 * Format team name for display
 * @param team - Team name
 * @returns string - Formatted team name
 */
export function formatTeamName(team: string | null | undefined): string {
  if (!team) return 'Free Agent';
  return team.trim();
}

/**
 * Generate a random ID for play-by-play events
 * @returns string - Random ID
 */
export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Calculate player efficiency rating (PER-like metric)
 * @param player - Player object with stats
 * @returns number - Efficiency rating
 */
export function calculatePlayerEfficiency(player: {
  pointsPerGame?: number;
  reboundsPerGame?: number;
  assistsPerGame?: number;
  stealsPerGame?: number;
  blocksPerGame?: number;
  fieldGoalPercentage?: number;
  threePointPercentage?: number;
  freeThrowPercentage?: number;
}): number {
  const {
    pointsPerGame = 0,
    reboundsPerGame = 0,
    assistsPerGame = 0,
    stealsPerGame = 0,
    blocksPerGame = 0,
    fieldGoalPercentage = 0,
    threePointPercentage = 0,
    freeThrowPercentage = 0,
  } = player;

  // Simple efficiency calculation
  const shootingEfficiency = (fieldGoalPercentage + threePointPercentage + freeThrowPercentage) / 3;
  const productionEfficiency = pointsPerGame + (reboundsPerGame * 1.2) + (assistsPerGame * 1.5) + (stealsPerGame * 2) + (blocksPerGame * 2);
  
  return (productionEfficiency * shootingEfficiency) / 10;
}
