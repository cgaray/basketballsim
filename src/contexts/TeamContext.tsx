/**
 * Team Context
 * Manages team roster state and operations
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Player } from '@/types';

interface TeamState {
  roster: Player[];
  teamName: string;
  isLoading: boolean;
  error: string | null;
}

interface TeamAction {
  type: 'ADD_PLAYER' | 'REMOVE_PLAYER' | 'SET_TEAM_NAME' | 'CLEAR_ROSTER' | 'SET_LOADING' | 'SET_ERROR' | 'LOAD_TEAM';
  payload?: any;
}

interface TeamContextType extends TeamState {
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: number) => void;
  setTeamName: (name: string) => void;
  clearRoster: () => void;
  saveTeam: () => Promise<void>;
  loadTeam: (teamId: number) => Promise<void>;
  getPositionCount: () => Record<string, number>;
  isValidRoster: () => boolean;
}

const initialState: TeamState = {
  roster: [],
  teamName: '',
  isLoading: false,
  error: null,
};

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'ADD_PLAYER':
      // Don't add if player already exists
      if (state.roster.find(p => p.id === action.payload.id)) {
        return { ...state, error: 'Player already in roster' };
      }
      // Check roster limit (15 players max)
      if (state.roster.length >= 15) {
        return { ...state, error: 'Roster is full (15 players max)' };
      }
      return {
        ...state,
        roster: [...state.roster, action.payload],
        error: null,
      };

    case 'REMOVE_PLAYER':
      return {
        ...state,
        roster: state.roster.filter(p => p.id !== action.payload),
        error: null,
      };

    case 'SET_TEAM_NAME':
      return {
        ...state,
        teamName: action.payload,
      };

    case 'CLEAR_ROSTER':
      return {
        ...state,
        roster: [],
        teamName: '',
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
      return {
        ...state,
        roster: action.payload.players,
        teamName: action.payload.name,
        error: null,
        isLoading: false,
      };

    default:
      return state;
  }
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  const addPlayer = (player: Player) => {
    dispatch({ type: 'ADD_PLAYER', payload: player });
  };

  const removePlayer = (playerId: number) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };

  const setTeamName = (name: string) => {
    dispatch({ type: 'SET_TEAM_NAME', payload: name });
  };

  const clearRoster = () => {
    dispatch({ type: 'CLEAR_ROSTER' });
  };

  const saveTeam = async () => {
    if (!state.teamName.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Team name is required' });
      return;
    }

    if (state.roster.length === 0) {
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
          name: state.teamName,
          players: state.roster.map(p => p.id),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save team');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'CLEAR_ROSTER' });

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to save team'
      });
    }
  };

  const loadTeam = async (teamId: number) => {
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
        }
      });

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load team'
      });
    }
  };

  const getPositionCount = (): Record<string, number> => {
    const counts: Record<string, number> = {
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0,
    };

    state.roster.forEach(player => {
      counts[player.position] = (counts[player.position] || 0) + 1;
    });

    return counts;
  };

  const isValidRoster = (): boolean => {
    const positions = getPositionCount();
    // Basic validation: at least one player at each position for a complete starting 5
    return positions.PG > 0 && positions.SG > 0 && positions.SF > 0 &&
           positions.PF > 0 && positions.C > 0;
  };

  const contextValue: TeamContextType = {
    ...state,
    addPlayer,
    removePlayer,
    setTeamName,
    clearRoster,
    saveTeam,
    loadTeam,
    getPositionCount,
    isValidRoster,
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