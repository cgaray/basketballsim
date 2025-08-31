/**
 * Tests for useTeamBuilder hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTeamBuilder } from '../useTeamBuilder';
import { Player } from '@/types';

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
  imageUrl: 'https://example.com/lebron.jpg',
  createdAt: new Date('2023-01-01'),
};

const mockPlayer2: Player = {
  id: 2,
  name: 'Stephen Curry',
  position: 'PG',
  team: 'Golden State Warriors',
  season: 2023,
  gamesPlayed: 82,
  pointsPerGame: 29.4,
  reboundsPerGame: 6.1,
  assistsPerGame: 6.3,
  stealsPerGame: 0.9,
  blocksPerGame: 0.4,
  fieldGoalPercentage: 0.49,
  threePointPercentage: 0.42,
  freeThrowPercentage: 0.91,
  imageUrl: 'https://example.com/curry.jpg',
  createdAt: new Date('2023-01-01'),
};

const mockPlayer3: Player = {
  id: 3,
  name: 'Kevin Durant',
  position: 'PF',
  team: 'Phoenix Suns',
  season: 2023,
  gamesPlayed: 82,
  pointsPerGame: 29.7,
  reboundsPerGame: 6.7,
  assistsPerGame: 5.0,
  stealsPerGame: 0.7,
  blocksPerGame: 1.4,
  fieldGoalPercentage: 0.56,
  threePointPercentage: 0.40,
  freeThrowPercentage: 0.91,
  imageUrl: 'https://example.com/durant.jpg',
  createdAt: new Date('2023-01-01'),
};

describe('useTeamBuilder', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTeamBuilder());

    expect(result.current.team1.name).toBe('Team 1');
    expect(result.current.team1.players).toEqual([]);
    expect(result.current.team2.name).toBe('Team 2');
    expect(result.current.team2.players).toEqual([]);
    expect(result.current.availablePlayers).toEqual([]);
    expect(result.current.selectedPlayer).toBeNull();
  });

  it('should initialize with provided available players', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1, mockPlayer2]));

    expect(result.current.availablePlayers).toHaveLength(2);
    expect(result.current.availablePlayers).toContain(mockPlayer1);
    expect(result.current.availablePlayers).toContain(mockPlayer2);
  });

  it('should add player to team', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

    act(() => {
      result.current.addPlayerToTeam(mockPlayer1, 1);
    });

    expect(result.current.team1.players).toHaveLength(1);
    expect(result.current.team1.players).toContain(mockPlayer1);
    expect(result.current.availablePlayers).toHaveLength(0);
  });

  it('should not add duplicate player to team', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

    act(() => {
      result.current.addPlayerToTeam(mockPlayer1, 1);
      result.current.addPlayerToTeam(mockPlayer1, 1);
    });

    expect(result.current.team1.players).toHaveLength(1);
  });

  it('should remove player from other team when adding to new team', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

    act(() => {
      result.current.addPlayerToTeam(mockPlayer1, 1);
      result.current.addPlayerToTeam(mockPlayer1, 2);
    });

    expect(result.current.team1.players).toHaveLength(0);
    expect(result.current.team2.players).toHaveLength(1);
    expect(result.current.team2.players).toContain(mockPlayer1);
  });

  it('should remove player from team', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

    act(() => {
      result.current.addPlayerToTeam(mockPlayer1, 1);
      result.current.removePlayerFromTeam(mockPlayer1, 1);
    });

    expect(result.current.team1.players).toHaveLength(0);
    expect(result.current.availablePlayers).toHaveLength(1);
    expect(result.current.availablePlayers).toContain(mockPlayer1);
  });

  it('should move player between teams', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

    act(() => {
      result.current.addPlayerToTeam(mockPlayer1, 1);
      result.current.movePlayerBetweenTeams(mockPlayer1, 1, 2);
    });

    expect(result.current.team1.players).toHaveLength(0);
    expect(result.current.team2.players).toHaveLength(1);
    expect(result.current.team2.players).toContain(mockPlayer1);
  });

  it('should set team name', () => {
    const { result } = renderHook(() => useTeamBuilder());

    act(() => {
      result.current.setTeamName(1, 'Lakers');
    });

    expect(result.current.team1.name).toBe('Lakers');
  });

  it('should set available players', () => {
    const { result } = renderHook(() => useTeamBuilder());

    act(() => {
      result.current.setAvailablePlayers([mockPlayer1, mockPlayer2]);
    });

    expect(result.current.availablePlayers).toHaveLength(2);
    expect(result.current.availablePlayers).toContain(mockPlayer1);
    expect(result.current.availablePlayers).toContain(mockPlayer2);
  });

  it('should set selected player', () => {
    const { result } = renderHook(() => useTeamBuilder());

    act(() => {
      result.current.setSelectedPlayer(mockPlayer1);
    });

    expect(result.current.selectedPlayer).toBe(mockPlayer1);
  });

  it('should clear team', () => {
    const { result } = renderHook(() => useTeamBuilder([mockPlayer1, mockPlayer2]));

    act(() => {
      result.current.addPlayerToTeam(mockPlayer1, 1);
      result.current.addPlayerToTeam(mockPlayer2, 1);
      result.current.clearTeam(1);
    });

    expect(result.current.team1.players).toHaveLength(0);
    expect(result.current.availablePlayers).toHaveLength(2);
  });

  describe('team validation', () => {
    it('should validate empty team', () => {
      const { result } = renderHook(() => useTeamBuilder());

      const validation = result.current.getTeamValidation(1);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Team must have at least one player');
    });

    it('should validate team with valid players', () => {
      const { result } = renderHook(() => useTeamBuilder([mockPlayer1, mockPlayer2, mockPlayer3]));

      act(() => {
        result.current.addPlayerToTeam(mockPlayer1, 1); // SF
        result.current.addPlayerToTeam(mockPlayer2, 1); // PG
        result.current.addPlayerToTeam(mockPlayer3, 1); // PF
      });

      const validation = result.current.getTeamValidation(1);

      expect(validation.isValid).toBe(false); // Missing SG and C
      expect(validation.errors).toContain('Need at least 1 SG player(s)');
      expect(validation.errors).toContain('Need at least 1 C player(s)');
    });

    it('should count positions correctly', () => {
      const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

      act(() => {
        result.current.addPlayerToTeam(mockPlayer1, 1);
      });

      const validation = result.current.getTeamValidation(1);

      expect(validation.positionCounts.SF).toBe(1);
      expect(validation.positionCounts.PG).toBe(0);
    });
  });

  describe('canAddPlayerToTeam', () => {
    it('should allow adding player to empty team', () => {
      const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

      expect(result.current.canAddPlayerToTeam(mockPlayer1, 1)).toBe(true);
    });

    it('should not allow adding duplicate player', () => {
      const { result } = renderHook(() => useTeamBuilder([mockPlayer1]));

      act(() => {
        result.current.addPlayerToTeam(mockPlayer1, 1);
      });

      expect(result.current.canAddPlayerToTeam(mockPlayer1, 1)).toBe(false);
    });

    it('should not allow adding player to full team', () => {
      const { result } = renderHook(() => useTeamBuilder());

      // Create 15 mock players
      const mockPlayers = Array.from({ length: 15 }, (_, i) => ({
        ...mockPlayer1,
        id: i + 1,
        name: `Player ${i + 1}`,
      }));

      act(() => {
        result.current.setAvailablePlayers(mockPlayers);
        mockPlayers.forEach(player => {
          result.current.addPlayerToTeam(player, 1);
        });
      });

      const newPlayer = { ...mockPlayer1, id: 100, name: 'New Player' };
      expect(result.current.canAddPlayerToTeam(newPlayer, 1)).toBe(false);
    });
  });
});
