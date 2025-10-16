/**
 * Tests for MatchSimulator component
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MatchSimulator } from '../MatchSimulator';
import { SimulationEngine } from '@/lib/simulation/engine';
import { MatchResult } from '@/lib/simulation/types';

// Mock the SimulationEngine
jest.mock('@/lib/simulation/engine');

// Mock fetch
global.fetch = jest.fn();

// TODO: Fix timing issues with animation in tests
describe('MatchSimulator', () => {
  const mockTeam1 = {
    id: 1,
    name: 'Lakers',
    players: [
      {
        id: 1,
        name: 'LeBron James',
        position: 'SF',
        pointsPerGame: 25.0,
        reboundsPerGame: 7.5,
        assistsPerGame: 8.0,
        stealsPerGame: 1.2,
        blocksPerGame: 0.6,
        fieldGoalPercentage: 0.52,
        threePointPercentage: 0.35,
        freeThrowPercentage: 0.85,
      },
    ],
  };

  const mockTeam2 = {
    id: 2,
    name: 'Warriors',
    players: [
      {
        id: 2,
        name: 'Stephen Curry',
        position: 'PG',
        pointsPerGame: 29.0,
        reboundsPerGame: 5.0,
        assistsPerGame: 6.5,
        stealsPerGame: 1.5,
        blocksPerGame: 0.3,
        fieldGoalPercentage: 0.48,
        threePointPercentage: 0.42,
        freeThrowPercentage: 0.91,
      },
    ],
  };

  const mockMatchResult: MatchResult = {
    team1: { id: 1, name: 'Lakers', players: mockTeam1.players },
    team2: { id: 2, name: 'Warriors', players: mockTeam2.players },
    team1Score: 108,
    team2Score: 102,
    winner: 'team1',
    mvp: {
      player: 'LeBron James',
      team: 'team1',
      points: 28,
      rebounds: 8,
      assists: 10,
    },
    quarters: [
      {
        quarter: 1,
        team1Score: 27,
        team2Score: 25,
        possessions: [
          {
            team: 'team1',
            quarter: 1,
            time: '11:30',
            player: 'LeBron James',
            action: 'Layup made',
            points: 2,
            result: 'made',
          },
        ],
      },
      {
        quarter: 2,
        team1Score: 26,
        team2Score: 28,
        possessions: [],
      },
      {
        quarter: 3,
        team1Score: 29,
        team2Score: 24,
        possessions: [],
      },
      {
        quarter: 4,
        team1Score: 26,
        team2Score: 25,
        possessions: [],
      },
    ],
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    // Mock SimulationEngine to return instantly (no animation)
    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: jest.fn().mockReturnValue(mockMatchResult),
    }));
  });

  it('shows loading state initially', () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    expect(screen.getByText('Simulating Match...')).toBeInTheDocument();
  });

  it('displays quarter progress during simulation', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Should show quarter indicators
    await waitFor(() => {
      const indicators = screen.getAllByRole('generic').filter(
        el => el.className.includes('rounded-full')
      );
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  it('displays final score after simulation', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Wait for simulation to complete (with animation)
    await waitFor(() => {
      expect(screen.getByText('Final Score')).toBeInTheDocument();
      expect(screen.getByText('108')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
    });
  });

  it('highlights winning team', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      const lakersScore = screen.getByText('108').closest('div');
      expect(lakersScore).toHaveClass('text-green-600');
    });
  });

  it('displays quarter breakdown', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Quarter Scores')).toBeInTheDocument();
      expect(screen.getByText('Q1')).toBeInTheDocument();
      expect(screen.getByText('Q2')).toBeInTheDocument();
      expect(screen.getByText('Q3')).toBeInTheDocument();
      expect(screen.getByText('Q4')).toBeInTheDocument();
    });
  });

  it('displays MVP information', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('MVP')).toBeInTheDocument();
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('28 PTS')).toBeInTheDocument();
      expect(screen.getByText('8 REB')).toBeInTheDocument();
      expect(screen.getByText('10 AST')).toBeInTheDocument();
    });
  });

  it('shows play-by-play section', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Play-by-Play')).toBeInTheDocument();
    });
  });

  it('toggles play-by-play details', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      const toggleButton = screen.getByText('Show Details');
      expect(toggleButton).toBeInTheDocument();
    });

    const toggleButton = screen.getByText('Show Details');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
      expect(screen.getByText('Layup made')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button clicked', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Back to Team Selection')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Team Selection'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('allows simulation to be run again', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Simulate Again')).toBeInTheDocument();
    });

    const simulateButton = screen.getByText('Simulate Again');
    fireEvent.click(simulateButton);

    // Should show loading state again
    expect(screen.getByText('Simulating Match...')).toBeInTheDocument();
  });

  it('saves match result to API', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

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

  it('handles simulation error gracefully', async () => {
    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: jest.fn().mockImplementation(() => {
        throw new Error('Simulation failed');
      }),
    }));

    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText(/Simulation failed/i)).toBeInTheDocument();
    });
  });

  it('displays overtime quarters correctly', async () => {
    const overtimeResult = {
      ...mockMatchResult,
      quarters: [
        ...mockMatchResult.quarters,
        {
          quarter: 5,
          team1Score: 12,
          team2Score: 8,
          possessions: [],
        },
      ],
    };

    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: jest.fn().mockReturnValue(overtimeResult),
    }));

    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // 5 quarters: 500ms initial + 5 * 1000ms
    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('OT1')).toBeInTheDocument();
    });
  });

  it('creates SimulationEngine with correct team data', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(SimulationEngine).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'Lakers',
          players: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              name: 'LeBron James',
            }),
          ]),
        }),
        expect.objectContaining({
          id: 2,
          name: 'Warriors',
        })
      );
    });
  });

  it('displays team names in score display', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('Warriors')).toBeInTheDocument();
    });
  });

  it('shows possession details with timestamps', async () => {
    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Details'));

    await waitFor(() => {
      expect(screen.getByText('11:30')).toBeInTheDocument();
    });
  });

  it('limits play-by-play display to 10 possessions per quarter', async () => {
    const manyPossessions = Array(20).fill(null).map((_, i) => ({
      team: 'team1' as const,
      quarter: 1,
      time: '11:30',
      player: 'LeBron James',
      action: `Action ${i}`,
      points: 2,
      result: 'made' as const,
    }));

    const resultWithManyPossessions = {
      ...mockMatchResult,
      quarters: [
        {
          ...mockMatchResult.quarters[0],
          possessions: manyPossessions,
        },
      ],
    };

    (SimulationEngine as jest.Mock).mockImplementation(() => ({
      simulateMatch: jest.fn().mockReturnValue(resultWithManyPossessions),
    }));

    render(<MatchSimulator team1={mockTeam1} team2={mockTeam2} onBack={mockOnBack} />);

    // Removed fake timer advance

    await waitFor(() => {
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show Details'));

    await waitFor(() => {
      expect(screen.getByText('... and 10 more plays')).toBeInTheDocument();
    });
  });
});
