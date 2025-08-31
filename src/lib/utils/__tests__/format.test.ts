/**
 * Tests for format utility functions
 */

import {
  formatPercentage,
  formatDecimal,
  formatInteger,
  formatTime,
  formatPlayerName,
  getPositionAbbreviation,
  getFullPositionName,
  formatTeamName,
  generateEventId,
  calculatePlayerEfficiency,
} from '../format';

describe('formatPercentage', () => {
  it('should format percentage correctly', () => {
    expect(formatPercentage(0.5)).toBe('50.0%');
    expect(formatPercentage(0.123)).toBe('12.3%');
    expect(formatPercentage(1)).toBe('100.0%');
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('should handle null and undefined values', () => {
    expect(formatPercentage(null)).toBe('N/A');
    expect(formatPercentage(undefined)).toBe('N/A');
  });
});

describe('formatDecimal', () => {
  it('should format decimal numbers correctly', () => {
    expect(formatDecimal(25.5)).toBe('25.5');
    expect(formatDecimal(10.123)).toBe('10.1');
    expect(formatDecimal(0)).toBe('0.0');
    expect(formatDecimal(100)).toBe('100.0');
  });

  it('should handle null and undefined values', () => {
    expect(formatDecimal(null)).toBe('N/A');
    expect(formatDecimal(undefined)).toBe('N/A');
  });
});

describe('formatInteger', () => {
  it('should format integers correctly', () => {
    expect(formatInteger(25.5)).toBe('26');
    expect(formatInteger(25.4)).toBe('25');
    expect(formatInteger(0)).toBe('0');
    expect(formatInteger(100)).toBe('100');
  });

  it('should handle null and undefined values', () => {
    expect(formatInteger(null)).toBe('N/A');
    expect(formatInteger(undefined)).toBe('N/A');
  });
});

describe('formatTime', () => {
  it('should format time in MM:SS format', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(125)).toBe('02:05');
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(3600)).toBe('60:00');
  });
});

describe('formatPlayerName', () => {
  it('should format player names correctly', () => {
    expect(formatPlayerName('  LeBron James  ')).toBe('LeBron James');
    expect(formatPlayerName('Michael Jordan')).toBe('Michael Jordan');
    expect(formatPlayerName('')).toBe('');
  });
});

describe('getPositionAbbreviation', () => {
  it('should return correct abbreviations for full position names', () => {
    expect(getPositionAbbreviation('Point Guard')).toBe('PG');
    expect(getPositionAbbreviation('Shooting Guard')).toBe('SG');
    expect(getPositionAbbreviation('Small Forward')).toBe('SF');
    expect(getPositionAbbreviation('Power Forward')).toBe('PF');
    expect(getPositionAbbreviation('Center')).toBe('C');
  });

  it('should return the same value for existing abbreviations', () => {
    expect(getPositionAbbreviation('PG')).toBe('PG');
    expect(getPositionAbbreviation('SG')).toBe('SG');
    expect(getPositionAbbreviation('SF')).toBe('SF');
    expect(getPositionAbbreviation('PF')).toBe('PF');
    expect(getPositionAbbreviation('C')).toBe('C');
  });

  it('should return unknown positions as-is', () => {
    expect(getPositionAbbreviation('Unknown Position')).toBe('Unknown Position');
  });
});

describe('getFullPositionName', () => {
  it('should return full position names for abbreviations', () => {
    expect(getFullPositionName('PG')).toBe('Point Guard');
    expect(getFullPositionName('SG')).toBe('Shooting Guard');
    expect(getFullPositionName('SF')).toBe('Small Forward');
    expect(getFullPositionName('PF')).toBe('Power Forward');
    expect(getFullPositionName('C')).toBe('Center');
  });

  it('should return unknown abbreviations as-is', () => {
    expect(getFullPositionName('UNK')).toBe('UNK');
  });
});

describe('formatTeamName', () => {
  it('should format team names correctly', () => {
    expect(formatTeamName('Los Angeles Lakers')).toBe('Los Angeles Lakers');
    expect(formatTeamName('  Boston Celtics  ')).toBe('Boston Celtics');
    expect(formatTeamName('')).toBe('Free Agent');
    expect(formatTeamName(null)).toBe('Free Agent');
    expect(formatTeamName(undefined)).toBe('Free Agent');
  });
});

describe('generateEventId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateEventId();
    const id2 = generateEventId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});

describe('calculatePlayerEfficiency', () => {
  it('should calculate efficiency for a complete player', () => {
    const player = {
      pointsPerGame: 25.0,
      reboundsPerGame: 7.5,
      assistsPerGame: 8.0,
      stealsPerGame: 1.5,
      blocksPerGame: 0.8,
      fieldGoalPercentage: 0.52,
      threePointPercentage: 0.35,
      freeThrowPercentage: 0.85,
    };

    const efficiency = calculatePlayerEfficiency(player);
    expect(efficiency).toBeGreaterThan(0);
    expect(typeof efficiency).toBe('number');
  });

  it('should handle players with missing stats', () => {
    const player = {
      pointsPerGame: 20.0,
      reboundsPerGame: undefined,
      assistsPerGame: 5.0,
    };

    const efficiency = calculatePlayerEfficiency(player);
    expect(efficiency).toBeGreaterThanOrEqual(0);
    expect(typeof efficiency).toBe('number');
  });

  it('should handle empty player object', () => {
    const player = {};
    const efficiency = calculatePlayerEfficiency(player);
    expect(efficiency).toBe(0);
  });
});
