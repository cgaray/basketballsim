import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MatchSimulator } from '../MatchSimulator';
import { SimulationEngine } from '@/lib/simulation/engine';

// Mock the SimulationEngine
jest.mock('@/lib/simulation/engine');

// Mock fetch
global.fetch = jest.fn();

describe('MatchSimulator', () => {
  const mockOnBack = jest.fn();

  const mockTeam1 = {
    id: 1,
    name: 'Team Alpha',
    players: [
      {
        id: 1,
        name: 'Player 1',
        position: 'PG',
        pointsPerGame: 25,
        reboundsPerGame: 5,
        assistsPerGame: 8,
        stealsPerGame: 2,
        blocksPerGame: 0.5,
        fieldGoalPercentage: 0.48,
        threePointPercentage: 0.38,
        freeThrowPercentage: 0.85,
      },
    ],
  };

  const mockTeam2 = {
    id: 2,
    name: 'Team Beta',
    players: [
      {
        id: 2,
        name: 'Player 2',
        position: 'SG',
        pointsPerGame: 22,
        reboundsPerGame: 4,
        assistsPerGame: 5,
        stealsPerGame: 1.5,
        blocksPerGame: 0.3,
        fieldGoalPercentage: 0.45,
        threePointPercentage: 0.36,
        freeThrowPercentage: 0.82,
      },
    ],
  };

  const mockMatchResult = {
    team1: { id: 1, name: 'Team Alpha', players: [] },
    team2: { id: 2, name: 'Team Beta', players: [] },
    team1Score: 110,
    team2Score: 105,
    winner: 'team1' as const,
    quarters: [
      {
        quarter: 1,
        team1Score: 28,
        team2Score: 26,
        possessions: [
          {
            team: 'team1' as const,
            player: 'Player 1',
            action: 'makes 3-point shot',
            points: 3,
            time: '11:45',
          },
        ],
      },
      {
        quarter: 2,
        team1Score: 27,
        team2Score: 29,
        possessions: [],
      },
      {
        quarter: 3,
        team1Score: 30,
        team2Score: 25,
        possessions: [],
      },
      {
        quarter: 4,
        team1Score: 25,
        team2Score: 25,
        possessions: [],
      },
    ],
    mvp: {
      player: 'Player 1',
      team: 'team1' as const,
      points: 35,
      rebounds: 7,
      assists: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({}),
    });

    const mockSimulateMatch = jest.fn().mockReturnValue(mockMatchResult);
    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: mockSimulateMatch,
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('automatically starts simulation on mount', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Simulating Match...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });
  });

  it('displays loading state with quarter progress', async () => {
    // Slow down the simulation to see loading states
    const slowSimulateMatch = jest.fn().mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(mockMatchResult), 5000));
    });

    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: slowSimulateMatch,
    }));

    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Simulating Match...')).toBeInTheDocument();
  });

  it('displays final match result', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });

    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
    expect(screen.getByText('110')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
  });

  it('highlights winning team', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });

    const team1Element = screen.getByText('Team Alpha').parentElement;
    const team2Element = screen.getByText('Team Beta').parentElement;

    expect(team1Element).toHaveClass('text-green-600');
    expect(team2Element).not.toHaveClass('text-green-600');
  });

  it('displays quarter scores table', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Quarter Scores')).toBeInTheDocument();
    });

    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Q2')).toBeInTheDocument();
    expect(screen.getByText('Q3')).toBeInTheDocument();
    expect(screen.getByText('Q4')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument(); // Q1 team1 score
  });

  it('displays MVP information', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MVP')).toBeInTheDocument();
    });

    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('35 PTS')).toBeInTheDocument();
    expect(screen.getByText('7 REB')).toBeInTheDocument();
    expect(screen.getByText('10 AST')).toBeInTheDocument();
  });

  it('toggles play-by-play display', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Play-by-Play')).toBeInTheDocument();
    });

    // Initially hidden
    expect(screen.queryByText('makes 3-point shot')).not.toBeInTheDocument();

    // Click to show
    const showButton = screen.getByRole('button', { name: /Show Details/i });
    fireEvent.click(showButton);

    expect(screen.getByText('makes 3-point shot')).toBeInTheDocument();

    // Click to hide
    const hideButton = screen.getByRole('button', { name: /Hide Details/i });
    fireEvent.click(hideButton);

    expect(screen.queryByText('makes 3-point shot')).not.toBeInTheDocument();
  });

  it('saves match result to API', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/matches',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"team1Id":1'),
        })
      );
    });
  });

  it('handles simulation errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Simulation failed');

    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
    }));

    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Simulation failed')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Back to Team Selection/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('allows re-simulation', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });

    const simulateAgainButton = screen.getByRole('button', { name: /Simulate Again/i });
    fireEvent.click(simulateAgainButton);

    expect(screen.getByText('Simulating Match...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /Back to Team Selection/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('handles overtime quarters correctly', async () => {
    const overtimeResult = {
      ...mockMatchResult,
      quarters: [
        ...mockMatchResult.quarters,
        {
          quarter: 5,
          team1Score: 10,
          team2Score: 8,
          possessions: [],
        },
      ],
    };

    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: jest.fn().mockReturnValue(overtimeResult),
    }));

    render(
      <MatchSimulator
        team1={mockTeam1}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('OT1')).toBeInTheDocument();
    });
  });

  it('handles players with missing stats gracefully', async () => {
    const teamWithIncompletePlayer = {
      ...mockTeam1,
      players: [
        {
          id: 1,
          name: 'Player 1',
          position: 'PG',
          // Missing most stats
        },
      ],
    };

    render(
      <MatchSimulator
        team1={teamWithIncompletePlayer}
        team2={mockTeam2}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
    });

    // Should use default values and not crash
    expect(SimulationEngine).toHaveBeenCalled();
  });
});