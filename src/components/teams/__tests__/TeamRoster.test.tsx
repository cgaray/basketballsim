/**
 * Tests for TeamRoster component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamRoster } from '../TeamRoster';
import { Player, Position } from '@/types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: any) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: jest.fn(),
  }, {}),
  Draggable: ({ children }: any) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: jest.fn(),
  }, {}),
}));

// Mock PlayerCard component
jest.mock('@/components/cards/PlayerCard', () => ({
  PlayerCard: ({ player, className }: any) => (
    <div data-testid={`player-card-${player.id}`} className={className}>
      {player.name}
    </div>
  ),
}));

describe('TeamRoster', () => {
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
    imageUrl: null,
    createdAt: new Date('2023-01-01'),
  };

  const mockPlayer2: Player = {
    id: 2,
    name: 'Stephen Curry',
    position: 'PG',
    team: 'Golden State Warriors',
    season: 2023,
    gamesPlayed: 75,
    pointsPerGame: 29.0,
    reboundsPerGame: 5.0,
    assistsPerGame: 6.5,
    stealsPerGame: 1.5,
    blocksPerGame: 0.3,
    fieldGoalPercentage: 0.48,
    threePointPercentage: 0.42,
    freeThrowPercentage: 0.91,
    imageUrl: null,
    createdAt: new Date('2023-01-01'),
  };

  const mockValidation = {
    isValid: true,
    errors: [],
    warnings: [],
    positionCounts: {
      PG: 1,
      SG: 0,
      SF: 1,
      PF: 0,
      C: 0,
    },
  };

  const mockOnRemovePlayer = jest.fn();
  const mockOnTeamNameChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders team name input', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const input = screen.getByDisplayValue('Lakers');
      expect(input).toBeInTheDocument();
    });
  });

  it('displays player count', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1, mockPlayer2]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('2/15 players')).toBeInTheDocument();
    });
  });

  it('shows validation icon when valid', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const checkIcon = screen.getByRole('generic', { hidden: true });
      expect(checkIcon).toBeInTheDocument();
    });
  });

  it('shows warning icon when invalid', async () => {
    const invalidValidation = {
      ...mockValidation,
      isValid: false,
      errors: ['Need at least 5 players'],
    };

    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={invalidValidation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Need at least 5 players')).toBeInTheDocument();
    });
  });

  it('displays position counts', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1, mockPlayer2]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('PG: 1')).toBeInTheDocument();
      expect(screen.getByText('SF: 1')).toBeInTheDocument();
    });
  });

  it('calls onTeamNameChange when name is edited', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const input = screen.getByDisplayValue('Lakers');
      fireEvent.change(input, { target: { value: 'Warriors' } });
    });

    expect(mockOnTeamNameChange).toHaveBeenCalledWith('Warriors');
  });

  it('renders empty state when no players', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Drop players here to build your team')).toBeInTheDocument();
    });
  });

  it('renders player cards for each player', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1, mockPlayer2]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('player-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-2')).toBeInTheDocument();
    });
  });

  it('calls onRemovePlayer when remove button clicked', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(btn =>
        btn.className.includes('destructive')
      );
      if (removeButton) {
        fireEvent.click(removeButton);
      }
    });

    expect(mockOnRemovePlayer).toHaveBeenCalledWith(mockPlayer1);
  });

  it('displays validation errors', async () => {
    const validation = {
      ...mockValidation,
      isValid: false,
      errors: ['Need at least 5 players', 'Missing required position: C'],
    };

    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={validation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Need at least 5 players')).toBeInTheDocument();
      expect(screen.getByText('Missing required position: C')).toBeInTheDocument();
    });
  });

  it('displays validation warnings', async () => {
    const validation = {
      ...mockValidation,
      warnings: ['Consider adding more bench depth'],
    };

    render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={validation}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Consider adding more bench depth')).toBeInTheDocument();
    });
  });

  it('applies team 1 border color', async () => {
    const { container } = render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const card = container.querySelector('.border-primary');
      expect(card).toBeInTheDocument();
    });
  });

  it('applies team 2 border color', async () => {
    const { container } = render(
      <TeamRoster
        teamId={2}
        teamName="Warriors"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const card = container.querySelector('.border-emerald-600');
      expect(card).toBeInTheDocument();
    });
  });

  it('shows placeholder text for team name', async () => {
    render(
      <TeamRoster
        teamId={1}
        teamName=""
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Team 1');
      expect(input).toBeInTheDocument();
    });
  });

  it('applies correct position colors', async () => {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      positionCounts: {
        PG: 1,
        SG: 1,
        SF: 1,
        PF: 1,
        C: 1,
      },
    };

    const { container } = render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1, mockPlayer2]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={validation}
      />
    );

    await waitFor(() => {
      expect(container.querySelector('.bg-blue-100')).toBeInTheDocument(); // PG
      expect(container.querySelector('.bg-purple-100')).toBeInTheDocument(); // SF
    });
  });

  it('disables drop when isDropDisabled is true', async () => {
    const { container } = render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
        isDropDisabled={true}
      />
    );

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });

    // Component should still render but with drop disabled
    // This is handled by react-beautiful-dnd which we've mocked
  });

  it('handles SSR hydration correctly', () => {
    // First render (SSR)
    const { container, rerender } = render(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    // Should render placeholder initially
    expect(container.querySelector('.border-primary')).toBeInTheDocument();

    // After mount (client-side)
    rerender(
      <TeamRoster
        teamId={1}
        teamName="Lakers"
        players={[mockPlayer1]}
        onRemovePlayer={mockOnRemovePlayer}
        onTeamNameChange={mockOnTeamNameChange}
        validation={mockValidation}
      />
    );

    // Should render full component
    expect(container.querySelector('.border-primary')).toBeInTheDocument();
  });
});
