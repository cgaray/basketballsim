/**
 * Team Context
 * Manages team roster state and operations
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Player } from '@/types';

interface SingleTeamState {
  roster: Player[];
  teamName: string;
}

interface TeamState {
  team1: SingleTeamState;
  team2: SingleTeamState;
  isLoading: boolean;
  error: string | null;
}

interface TeamAction {
  type: 'ADD_PLAYER' | 'REMOVE_PLAYER' | 'SET_TEAM_NAME' | 'CLEAR_ROSTER' | 'SET_LOADING' | 'SET_ERROR' | 'LOAD_TEAM' | 'CLEAR_ALL';
  payload?: Player | string | boolean | number | { players: Player[]; name: string };
  teamId?: 1 | 2;
}

interface TeamContextType extends TeamState {
  addPlayer: (player: Player, teamId: 1 | 2) => void;
  removePlayer: (playerId: number, teamId: 1 | 2) => void;
  setTeamName: (name: string, teamId: 1 | 2) => void;
  clearRoster: (teamId: 1 | 2) => void;
  clearAll: () => void;
  saveTeam: (teamId: 1 | 2) => Promise<void>;
  loadTeam: (teamId: number, targetTeam: 1 | 2) => Promise<void>;
  getPositionCount: (teamId: 1 | 2) => Record<string, number>;
  isValidRoster: (teamId: 1 | 2) => boolean;
  isPlayerInTeam: (playerId: number) => 1 | 2 | null;
}

const initialState: TeamState = {
  team1: {
    roster: [],
    teamName: '',
  },
  team2: {
    roster: [],
    teamName: '',
  },
  isLoading: false,
  error: null,
};

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  const teamId = action.teamId || 1;
  const currentTeam = teamId === 1 ? state.team1 : state.team2;

  switch (action.type) {
    case 'ADD_PLAYER':
      // Don't add if player already exists in either team
      const playerInTeam1 = state.team1.roster.find(p => p.id === action.payload.id);
      const playerInTeam2 = state.team2.roster.find(p => p.id === action.payload.id);

      if (playerInTeam1 || playerInTeam2) {
        const existingTeam = playerInTeam1 ? 'Team 1' : 'Team 2';
        return { ...state, error: `Player already in ${existingTeam}` };
      }

      // Check roster limit (15 players max)
      if (currentTeam.roster.length >= 15) {
        return { ...state, error: `Team ${teamId} roster is full (15 players max)` };
      }

      const updatedTeam = {
        ...currentTeam,
        roster: [...currentTeam.roster, action.payload],
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: updatedTeam,
        error: null,
      };

    case 'REMOVE_PLAYER':
      const filteredTeam = {
        ...currentTeam,
        roster: currentTeam.roster.filter(p => p.id !== action.payload),
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: filteredTeam,
        error: null,
      };

    case 'SET_TEAM_NAME':
      const namedTeam = {
        ...currentTeam,
        teamName: action.payload,
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: namedTeam,
      };

    case 'CLEAR_ROSTER':
      const clearedTeam = {
        roster: [],
        teamName: '',
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: clearedTeam,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'LOAD_TEAM':
      const loadedTeam = {
        roster: action.payload.players,
        teamName: action.payload.name,
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: loadedTeam,
        error: null,
        isLoading: false,
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        team1: { roster: [], teamName: '' },
        team2: { roster: [], teamName: '' },
        error: null,
      };

    default:
      return state;
  }
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  const addPlayer = (player: Player, teamId: 1 | 2) => {
    dispatch({ type: 'ADD_PLAYER', payload: player, teamId });
  };

  const removePlayer = (playerId: number, teamId: 1 | 2) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId, teamId });
  };

  const setTeamName = (name: string, teamId: 1 | 2) => {
    dispatch({ type: 'SET_TEAM_NAME', payload: name, teamId });
  };

  const clearRoster = (teamId: 1 | 2) => {
    dispatch({ type: 'CLEAR_ROSTER', teamId });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const saveTeam = async (teamId: 1 | 2) => {
    const team = teamId === 1 ? state.team1 : state.team2;

    if (!team.teamName.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Team name is required' });
      return;
    }

    if (team.roster.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Team must have at least one player' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: team.teamName,
          players: team.roster.map(p => p.id),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save team');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'CLEAR_ROSTER', teamId });

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to save team'
      });
    }
  };

  const loadTeam = async (teamId: number, targetTeam: 1 | 2) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(`/api/teams/${teamId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load team');
      }

      dispatch({
        type: 'LOAD_TEAM',
        payload: {
          name: result.data.name,
          players: result.data.players,
        },
        teamId: targetTeam
      });

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load team'
      });
    }
  };

  const getPositionCount = (teamId: 1 | 2): Record<string, number> => {
    const team = teamId === 1 ? state.team1 : state.team2;
    const counts: Record<string, number> = {
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0,
    };

    team.roster.forEach(player => {
      counts[player.position] = (counts[player.position] || 0) + 1;
    });

    return counts;
  };

  const isValidRoster = (teamId: 1 | 2): boolean => {
    const positions = getPositionCount(teamId);
    // Basic validation: at least one player at each position for a complete starting 5
    return positions.PG > 0 && positions.SG > 0 && positions.SF > 0 &&
           positions.PF > 0 && positions.C > 0;
  };

  const isPlayerInTeam = (playerId: number): 1 | 2 | null => {
    const inTeam1 = state.team1.roster.find(p => p.id === playerId);
    const inTeam2 = state.team2.roster.find(p => p.id === playerId);

    if (inTeam1) return 1;
    if (inTeam2) return 2;
    return null;
  };

  const contextValue: TeamContextType = {
    ...state,
    addPlayer,
    removePlayer,
    setTeamName,
    clearRoster,
    clearAll,
    saveTeam,
    loadTeam,
    getPositionCount,
    isValidRoster,
    isPlayerInTeam,
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}