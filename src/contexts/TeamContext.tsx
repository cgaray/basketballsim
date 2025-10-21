/**
 * Team Context
 * Manages team roster state and operations
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Player } from '@/types';
import { findBestPlayersByPosition, findWorstPlayersByPosition } from '@/lib/utils/player-stats';
import { MAX_ROSTER_SIZE, DEFAULT_POSITION_REQUIREMENTS, TEAM_NAME_MIN_LENGTH, TEAM_NAME_MAX_LENGTH } from '@/lib/constants';

interface SingleTeamState {
  roster: Player[];
  teamName: string;
}

interface TeamState {
  team1: SingleTeamState;
  team2: SingleTeamState;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  playerPool: Player[];
  isPoolLoading: boolean;
}

interface TeamAction {
  type:
    | 'ADD_PLAYER'
    | 'REMOVE_PLAYER'
    | 'SET_TEAM_NAME'
    | 'CLEAR_ROSTER'
    | 'CLEAR_ROSTER_KEEP_NAME'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'SET_SUCCESS'
    | 'LOAD_TEAM'
    | 'CLEAR_ALL'
    | 'ADD_MULTIPLE_PLAYERS'
    | 'SET_PLAYER_POOL'
    | 'SET_POOL_LOADING';
  payload?: Player | string | boolean | number | { players: Player[]; name: string } | Player[];
  teamId?: 1 | 2;
}

interface TeamContextType extends TeamState {
  addPlayer: (player: Player, teamId: 1 | 2) => void;
  removePlayer: (playerId: number, teamId: 1 | 2) => void;
  setTeamName: (name: string, teamId: 1 | 2) => void;
  clearRoster: (teamId: 1 | 2) => void;
  clearAll: () => void;
  saveTeam: (teamId: 1 | 2) => Promise<void>;
  loadTeam: (teamData: { name: string; players: Player[] }, targetTeam: 1 | 2) => Promise<void>;
  getPositionCount: (teamId: 1 | 2) => Record<string, number>;
  isValidRoster: (teamId: 1 | 2) => boolean;
  isPlayerInTeam: (playerId: number) => 1 | 2 | null;
  addMultiplePlayers: (players: Player[], teamId: 1 | 2) => void;
  fillTeamWithBestPlayers: (availablePlayers: Player[], teamId: 1 | 2, requirements?: Record<string, number>) => void;
  fillTeamWithWorstPlayers: (availablePlayers: Player[], teamId: 1 | 2, requirements?: Record<string, number>) => void;
  ensurePlayerPool: () => Promise<void>;
  clearSuccessMessage: () => void;
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
  successMessage: null,
  playerPool: [],
  isPoolLoading: false,
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

      // Check roster limit
      if (currentTeam.roster.length >= MAX_ROSTER_SIZE) {
        return { ...state, error: `Team ${teamId} roster is full (${MAX_ROSTER_SIZE} players max)` };
      }

      const updatedTeam = {
        ...currentTeam,
        roster: [...currentTeam.roster, action.payload],
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: updatedTeam,
        error: null,
        successMessage: null,
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
        successMessage: null,
      };

    case 'SET_TEAM_NAME':
      const teamName = action.payload as string;

      // Validate team name
      if (teamName.length > TEAM_NAME_MAX_LENGTH) {
        return {
          ...state,
          error: `Team name must be ${TEAM_NAME_MAX_LENGTH} characters or less`,
        };
      }

      const namedTeam = {
        ...currentTeam,
        teamName: teamName,
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: namedTeam,
        error: null,
        successMessage: null,
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
        successMessage: null,
      };

    case 'CLEAR_ROSTER_KEEP_NAME':
      const clearedRosterKeepName = {
        ...currentTeam,
        roster: [],
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: clearedRosterKeepName,
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
        successMessage: null,
      };

    case 'SET_SUCCESS':
      return {
        ...state,
        successMessage: action.payload,
        error: null,
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
        successMessage: null,
        isLoading: false,
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        team1: { roster: [], teamName: '' },
        team2: { roster: [], teamName: '' },
        error: null,
        successMessage: null,
      };

    case 'ADD_MULTIPLE_PLAYERS':
      // Get all players currently in both teams
      const allCurrentPlayers = [...state.team1.roster, ...state.team2.roster];
      const currentPlayerIds = new Set(allCurrentPlayers.map(p => p.id));

      // Filter out players already in teams
      const newPlayers = (action.payload as Player[]).filter(p => !currentPlayerIds.has(p.id));

      // Check roster limit
      const availableSlots = MAX_ROSTER_SIZE - currentTeam.roster.length;
      if (newPlayers.length > availableSlots) {
        return {
          ...state,
          error: `Cannot add ${newPlayers.length} players. Only ${availableSlots} slots available in Team ${teamId}`,
        };
      }

      const updatedTeamWithMultiple = {
        ...currentTeam,
        roster: [...currentTeam.roster, ...newPlayers],
      };

      return {
        ...state,
        [teamId === 1 ? 'team1' : 'team2']: updatedTeamWithMultiple,
        error: null,
        successMessage: null,
      };

    case 'SET_PLAYER_POOL':
      return {
        ...state,
        playerPool: action.payload as Player[],
        isPoolLoading: false,
      };

    case 'SET_POOL_LOADING':
      return {
        ...state,
        isPoolLoading: action.payload as boolean,
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

    // Validate team name
    const trimmedName = team.teamName.trim();
    if (trimmedName.length < TEAM_NAME_MIN_LENGTH) {
      dispatch({ type: 'SET_ERROR', payload: 'Team name is required' });
      return;
    }

    if (trimmedName.length > TEAM_NAME_MAX_LENGTH) {
      dispatch({ type: 'SET_ERROR', payload: `Team name must be ${TEAM_NAME_MAX_LENGTH} characters or less` });
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
      dispatch({ type: 'SET_SUCCESS', payload: `Team "${team.teamName}" saved! Keep editing or save again.` });
      // Don't clear roster - allow continued editing
      // dispatch({ type: 'CLEAR_ROSTER_KEEP_NAME', teamId });

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to save team'
      });
    }
  };

  const loadTeam = async (teamData: { name: string; players: Player[] }, targetTeam: 1 | 2) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      dispatch({
        type: 'LOAD_TEAM',
        payload: {
          name: teamData.name,
          players: teamData.players,
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

  const addMultiplePlayers = (players: Player[], teamId: 1 | 2) => {
    dispatch({ type: 'ADD_MULTIPLE_PLAYERS', payload: players, teamId });
  };

  const fillTeamWithBestPlayers = (availablePlayers: Player[], teamId: 1 | 2, requirements: Record<string, number> = DEFAULT_POSITION_REQUIREMENTS) => {
    try {
      // Get all players currently in both teams
      const allCurrentPlayers = [...state.team1.roster, ...state.team2.roster];
      const takenPlayerIds = new Set(allCurrentPlayers.map(p => p.id));

      const bestPlayersByPosition = findBestPlayersByPosition(
        availablePlayers,
        takenPlayerIds,
        requirements
      );

      // Flatten all selected players
      const selectedPlayers = Object.values(bestPlayersByPosition).flat();

      if (selectedPlayers.length > 0) {
        addMultiplePlayers(selectedPlayers, teamId);
      }
    } catch (error) {
      console.error('Error filling team with best players:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fill team with best players' });
    }
  };

  const fillTeamWithWorstPlayers = (availablePlayers: Player[], teamId: 1 | 2, requirements: Record<string, number> = DEFAULT_POSITION_REQUIREMENTS) => {
    try {
      // Get all players currently in both teams
      const allCurrentPlayers = [...state.team1.roster, ...state.team2.roster];
      const takenPlayerIds = new Set(allCurrentPlayers.map(p => p.id));

      const worstPlayersByPosition = findWorstPlayersByPosition(
        availablePlayers,
        takenPlayerIds,
        requirements
      );

      // Flatten all selected players
      const selectedPlayers = Object.values(worstPlayersByPosition).flat();

      if (selectedPlayers.length > 0) {
        addMultiplePlayers(selectedPlayers, teamId);
      }
    } catch (error) {
      console.error('Error filling team with worst players:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fill team with worst players' });
    }
  };

  const ensurePlayerPool = async () => {
    if (state.playerPool.length > 0 || state.isPoolLoading) {
      return; // Already have pool or loading
    }

    dispatch({ type: 'SET_POOL_LOADING', payload: true });

    try {
      const response = await fetch('/api/players?limit=1000'); // Large pool
      const result = await response.json();

      if (result.success) {
        dispatch({ type: 'SET_PLAYER_POOL', payload: result.data.players });
      } else {
        throw new Error(result.error || 'Failed to fetch player pool');
      }
    } catch (error) {
      console.error('Error fetching player pool:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load player pool' });
      dispatch({ type: 'SET_POOL_LOADING', payload: false });
    }
  };

  const clearSuccessMessage = () => {
    dispatch({ type: 'SET_SUCCESS', payload: null });
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
    addMultiplePlayers,
    fillTeamWithBestPlayers,
    fillTeamWithWorstPlayers,
    ensurePlayerPool,
    clearSuccessMessage,
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
