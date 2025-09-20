/**
 * Custom hook for team builder state management
 */

import { useState, useCallback } from 'react';
import { Player, Position, PositionRequirements, DEFAULT_POSITION_REQUIREMENTS } from '@/types';

export interface TeamBuilderState {
  team1: {
    name: string;
    players: Player[];
  };
  team2: {
    name: string;
    players: Player[];
  };
  availablePlayers: Player[];
  selectedPlayer: Player | null;
}

export interface TeamBuilderActions {
  addPlayerToTeam: (player: Player, teamId: 1 | 2) => void;
  removePlayerFromTeam: (player: Player, teamId: 1 | 2) => void;
  movePlayerBetweenTeams: (player: Player, fromTeam: 1 | 2, toTeam: 1 | 2) => void;
  setTeamName: (teamId: 1 | 2, name: string) => void;
  setAvailablePlayers: (players: Player[]) => void;
  setSelectedPlayer: (player: Player | null) => void;
  clearTeam: (teamId: 1 | 2) => void;
  getTeamValidation: (teamId: 1 | 2) => TeamValidationResult;
  canAddPlayerToTeam: (player: Player, teamId: 1 | 2) => boolean;
  fillTeamWithBestPlayers: (teamId: 1 | 2, requirements?: Record<string, number>) => void;
}

export interface TeamValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  positionCounts: Record<Position, number>;
}

export function useTeamBuilder(initialAvailablePlayers: Player[] = []): TeamBuilderState & TeamBuilderActions {
  const [state, setState] = useState<TeamBuilderState>({
    team1: {
      name: 'Team 1',
      players: [],
    },
    team2: {
      name: 'Team 2',
      players: [],
    },
    availablePlayers: initialAvailablePlayers,
    selectedPlayer: null,
  });

  const addPlayerToTeam = useCallback((player: Player, teamId: 1 | 2) => {
    setState(prev => {
      const teamKey = teamId === 1 ? 'team1' : 'team2';
      const team = prev[teamKey];
      
      // Check if player is already in the team
      if (team.players.some(p => p.id === player.id)) {
        return prev;
      }

      // Check if player is in the other team
      const otherTeamKey = teamId === 1 ? 'team2' : 'team1';
      const otherTeam = prev[otherTeamKey];
      const isInOtherTeam = otherTeam.players.some(p => p.id === player.id);

      return {
        ...prev,
        [teamKey]: {
          ...team,
          players: [...team.players, player],
        },
        availablePlayers: prev.availablePlayers.filter(p => p.id !== player.id),
        [otherTeamKey]: isInOtherTeam ? {
          ...otherTeam,
          players: otherTeam.players.filter(p => p.id !== player.id),
        } : otherTeam,
      };
    });
  }, []);

  const removePlayerFromTeam = useCallback((player: Player, teamId: 1 | 2) => {
    setState(prev => {
      const teamKey = teamId === 1 ? 'team1' : 'team2';
      const team = prev[teamKey];

      return {
        ...prev,
        [teamKey]: {
          ...team,
          players: team.players.filter(p => p.id !== player.id),
        },
        availablePlayers: [...prev.availablePlayers, player],
      };
    });
  }, []);

  const movePlayerBetweenTeams = useCallback((player: Player, fromTeam: 1 | 2, toTeam: 1 | 2) => {
    if (fromTeam === toTeam) return;

    setState(prev => {
      const fromTeamKey = fromTeam === 1 ? 'team1' : 'team2';
      const toTeamKey = toTeam === 1 ? 'team1' : 'team2';
      const fromTeamState = prev[fromTeamKey];
      const toTeamState = prev[toTeamKey];

      return {
        ...prev,
        [fromTeamKey]: {
          ...fromTeamState,
          players: fromTeamState.players.filter(p => p.id !== player.id),
        },
        [toTeamKey]: {
          ...toTeamState,
          players: [...toTeamState.players, player],
        },
      };
    });
  }, []);

  const setTeamName = useCallback((teamId: 1 | 2, name: string) => {
    setState(prev => {
      const teamKey = teamId === 1 ? 'team1' : 'team2';
      return {
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          name,
        },
      };
    });
  }, []);

  const setAvailablePlayers = useCallback((players: Player[]) => {
    setState(prev => ({
      ...prev,
      availablePlayers: players,
    }));
  }, []);

  const setSelectedPlayer = useCallback((player: Player | null) => {
    setState(prev => ({
      ...prev,
      selectedPlayer: player,
    }));
  }, []);

  const clearTeam = useCallback((teamId: 1 | 2) => {
    setState(prev => {
      const teamKey = teamId === 1 ? 'team1' : 'team2';
      const team = prev[teamKey];

      return {
        ...prev,
        [teamKey]: {
          ...team,
          players: [],
        },
        availablePlayers: [...prev.availablePlayers, ...team.players],
      };
    });
  }, []);

  const getTeamValidation = useCallback((teamId: 1 | 2): TeamValidationResult => {
    const teamKey = teamId === 1 ? 'team1' : 'team2';
    const team = state[teamKey];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Count positions
    const positionCounts: Record<Position, number> = {
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0,
    };

    team.players.forEach(player => {
      const position = player.position as Position;
      if (positionCounts.hasOwnProperty(position)) {
        positionCounts[position]++;
      }
    });

    // Check team size
    if (team.players.length === 0) {
      errors.push('Team must have at least one player');
    } else if (team.players.length > 15) {
      errors.push('Team cannot have more than 15 players');
    }

    // Check position requirements
    Object.entries(DEFAULT_POSITION_REQUIREMENTS).forEach(([position, required]) => {
      const count = positionCounts[position as Position] || 0;
      if (count < required) {
        errors.push(`Need at least ${required} ${position} player(s)`);
      } else if (count > required + 2) {
        warnings.push(`Consider reducing ${position} players (${count} current, ${required} recommended)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      positionCounts,
    };
  }, [state]);

  const canAddPlayerToTeam = useCallback((player: Player, teamId: 1 | 2): boolean => {
    const teamKey = teamId === 1 ? 'team1' : 'team2';
    const team = state[teamKey];

    // Check if team is full
    if (team.players.length >= 15) {
      return false;
    }

    // Check if player is already in this team
    if (team.players.some(p => p.id === player.id)) {
      return false;
    }

    return true;
  }, [state]);

  const fillTeamWithBestPlayers = useCallback((teamId: 1 | 2, requirements: Record<string, number> = { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 }) => {
    // This method would need to be implemented to integrate with the TeamContext
    // For now, we'll leave it as a placeholder that can be connected later
    console.log(`Fill team ${teamId} with best players using requirements:`, requirements);
  }, []);

  return {
    ...state,
    addPlayerToTeam,
    removePlayerFromTeam,
    movePlayerBetweenTeams,
    setTeamName,
    setAvailablePlayers,
    setSelectedPlayer,
    clearTeam,
    getTeamValidation,
    canAddPlayerToTeam,
    fillTeamWithBestPlayers,
  };
}
