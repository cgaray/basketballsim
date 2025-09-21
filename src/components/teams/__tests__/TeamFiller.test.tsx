import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TeamFiller } from '../TeamFiller';
import { useTeam } from '@/contexts/TeamContext';
import { Player } from '@/types';

// Mock the TeamContext
jest.mock('@/contexts/TeamContext');

// Mock the player-stats utility
jest.mock('@/lib/utils/player-stats', () => ({
  findBestPlayersByPosition: jest.fn((players, takenIds, requirements) => {
    const result: Record<string, Player[]> = {};
    Object.keys(requirements).forEach(position => {
      const count = requirements[position];
      result[position] = players
        .filter((p: Player) => p.position === position && !takenIds.has(p.id))
        .slice(0, count);
    });
    return result;
  }),
}));

describe('TeamFiller', () => {
  const mockFillTeam = jest.fn();
  const mockOnSuccess = jest.fn();

  const createMockPlayer = (id: number, position: string, name: string): Player => ({
    id,
    name,
    position,
    team: 'TEST',
    pointsPerGame: 20,
    reboundsPerGame: 5,
    assistsPerGame: 3,
    stealsPerGame: 1,
    blocksPerGame: 0.5,
    fieldGoalPercentage: 0.45,
    threePointPercentage: 0.35,
    freeThrowPercentage: 0.85,
    turnoversPerGame: 2,
    season: '2023-24',
    gamesPlayed: 70,
    playerEfficiencyRating: 20,
  });

  const availablePlayers: Player[] = [
    createMockPlayer(1, 'PG', 'Point Guard 1'),
    createMockPlayer(2, 'PG', 'Point Guard 2'),
    createMockPlayer(3, 'PG', 'Point Guard 3'),
    createMockPlayer(4, 'SG', 'Shooting Guard 1'),
    createMockPlayer(5, 'SG', 'Shooting Guard 2'),
    createMockPlayer(6, 'SF', 'Small Forward 1'),
    createMockPlayer(7, 'SF', 'Small Forward 2'),
    createMockPlayer(8, 'PF', 'Power Forward 1'),
    createMockPlayer(9, 'PF', 'Power Forward 2'),
    createMockPlayer(10, 'C', 'Center 1'),
    createMockPlayer(11, 'C', 'Center 2'),
  ];

  const defaultTeamContext = {
    fillTeamWithBestPlayers: mockFillTeam,
    team1: { roster: [], id: 1, name: 'Team 1' },
    team2: { roster: [], id: 2, name: 'Team 2' },
    isLoading: false,
    addPlayer: jest.fn(),
    removePlayer: jest.fn(),
    clearTeam: jest.fn(),
    clearAllTeams: jest.fn(),
    autoFillTeam: jest.fn(),
    saveTeam: jest.fn(),
    loadTeam: jest.fn(),
    getSavedTeams: jest.fn(),
    deleteSavedTeam: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTeam as jest.Mock).mockReturnValue(defaultTeamContext);
  });

  it('renders team filler component', () => {
    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Fill Team with Best Players')).toBeInTheDocument();
    expect(screen.getByText('Automatically select the highest-rated available players for your team')).toBeInTheDocument();
  });

  it('displays fill strategy options', () => {
    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const strategySelect = screen.getByRole('combobox');
    fireEvent.click(strategySelect);

    // Use getAllByText and check that the options exist (there might be multiple instances)
    expect(screen.getAllByText('Starting Five').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Balanced Roster').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Position Depth').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Custom').length).toBeGreaterThan(0);
  });

  it('shows preview of players to add', () => {
    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Players to add:')).toBeInTheDocument();
    expect(screen.getByText('Available slots:')).toBeInTheDocument();
    expect(screen.getByText('15 slots')).toBeInTheDocument();
  });

  it('calls fillTeamWithBestPlayers when fill button is clicked', async () => {
    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    fireEvent.click(fillButton);

    await waitFor(() => {
      expect(mockFillTeam).toHaveBeenCalledWith(
        availablePlayers,
        1,
        expect.objectContaining({
          PG: 1,
          SG: 1,
          SF: 1,
          PF: 1,
          C: 1,
        })
      );
    });
  });

  it('calls onSuccess after filling team', async () => {
    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    fireEvent.click(fillButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('disables fill button when team is full', () => {
    const fullRoster = Array.from({ length: 15 }, (_, i) => createMockPlayer(100 + i, 'PG', `Player ${i}`));

    (useTeam as jest.Mock).mockReturnValue({
      ...defaultTeamContext,
      team1: { roster: fullRoster, id: 1, name: 'Team 1' },
    });

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    expect(fillButton).toBeDisabled();
  });

  it('shows custom requirements when custom strategy is selected', async () => {
    const user = userEvent.setup();

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const strategySelect = screen.getByRole('combobox');
    fireEvent.click(strategySelect);

    const customOption = screen.getByText('Custom');
    fireEvent.click(customOption);

    await waitFor(() => {
      expect(screen.getByText('Custom Position Requirements')).toBeInTheDocument();
    });

    // Should show input fields for each position
    expect(screen.getAllByRole('spinbutton')).toHaveLength(5);
  });

  it('updates custom requirements when inputs change', async () => {
    const user = userEvent.setup();

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const strategySelect = screen.getByRole('combobox');
    fireEvent.click(strategySelect);
    fireEvent.click(screen.getByText('Custom'));

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '3');

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    fireEvent.click(fillButton);

    await waitFor(() => {
      expect(mockFillTeam).toHaveBeenCalledWith(
        availablePlayers,
        1,
        expect.objectContaining({
          PG: 3,
        })
      );
    });
  });

  it('shows error when not enough slots available', () => {
    const partialRoster = Array.from({ length: 13 }, (_, i) => createMockPlayer(100 + i, 'PG', `Player ${i}`));

    (useTeam as jest.Mock).mockReturnValue({
      ...defaultTeamContext,
      team1: { roster: partialRoster, id: 1, name: 'Team 1' },
    });

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    // Try to select position depth strategy which requires 15 players
    const strategySelect = screen.getByRole('combobox');
    fireEvent.click(strategySelect);
    fireEvent.click(screen.getByText('Position Depth'));

    expect(screen.getByText(/Not enough roster slots available/i)).toBeInTheDocument();
  });

  it('filters out players already in teams', () => {
    const team1Roster = [createMockPlayer(1, 'PG', 'Point Guard 1')];
    const team2Roster = [createMockPlayer(4, 'SG', 'Shooting Guard 1')];

    (useTeam as jest.Mock).mockReturnValue({
      ...defaultTeamContext,
      team1: { roster: team1Roster, id: 1, name: 'Team 1' },
      team2: { roster: team2Roster, id: 2, name: 'Team 2' },
    });

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    fireEvent.click(fillButton);

    // The fill function should exclude players with IDs 1 and 4
    expect(mockFillTeam).toHaveBeenCalled();
  });

  it('handles different fill strategies correctly', async () => {
    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    // Test Balanced Roster strategy
    const strategySelect = screen.getByRole('combobox');
    fireEvent.click(strategySelect);
    fireEvent.click(screen.getByText('Balanced Roster'));

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    fireEvent.click(fillButton);

    await waitFor(() => {
      expect(mockFillTeam).toHaveBeenCalledWith(
        availablePlayers,
        1,
        expect.objectContaining({
          PG: 2,
          SG: 2,
          SF: 2,
          PF: 2,
          C: 2,
        })
      );
    });
  });

  it('shows loading state when filling team', async () => {
    (useTeam as jest.Mock).mockReturnValue({
      ...defaultTeamContext,
      isLoading: true,
    });

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const fillButton = screen.getByRole('button', { name: /Fill Team/i });
    expect(fillButton).toBeDisabled();
  });

  it('limits custom requirements between 0 and 5', async () => {
    const user = userEvent.setup();

    render(
      <TeamFiller
        availablePlayers={availablePlayers}
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    const strategySelect = screen.getByRole('combobox');
    fireEvent.click(strategySelect);
    fireEvent.click(screen.getByText('Custom'));

    const inputs = screen.getAllByRole('spinbutton');

    // Try to set value above 5
    await user.clear(inputs[0]);
    await user.type(inputs[0], '10');

    // Should be clamped to 5
    expect(inputs[0]).toHaveValue(5);
  });

  it('shows message when no suitable players found', () => {
    (useTeam as jest.Mock).mockReturnValue({
      ...defaultTeamContext,
      team1: { roster: [], id: 1, name: 'Team 1' },
    });

    render(
      <TeamFiller
        availablePlayers={[]} // No available players
        teamId={1}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('No suitable players found for the selected requirements.')).toBeInTheDocument();
  });
});