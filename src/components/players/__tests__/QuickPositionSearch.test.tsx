import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickPositionSearch } from '../QuickPositionSearch';
import { Player } from '@/types';

// Mock fetch
global.fetch = jest.fn();

describe('QuickPositionSearch', () => {
  const mockOnAddPlayer = jest.fn();
  const mockOnClose = jest.fn();

  const mockPlayer: Player = {
    id: 1,
    name: 'LeBron James',
    position: 'SF',
    team: 'LAL',
    pointsPerGame: 27.1,
    reboundsPerGame: 7.5,
    assistsPerGame: 7.3,
    stealsPerGame: 1.2,
    blocksPerGame: 0.6,
    fieldGoalPercentage: 50.6,
    threePointPercentage: 37.4,
    freeThrowPercentage: 73.2,
    turnoversPerGame: 3.5,
    season: '2023-24',
    gamesPlayed: 71,
    playerEfficiencyRating: 26.1,
  };

  const defaultProps = {
    teamId: 1 as const,
    currentRoster: [],
    onAddPlayer: mockOnAddPlayer,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders component with team number', () => {
    render(<QuickPositionSearch {...defaultProps} />);

    expect(screen.getByText('Quick Add Players - Team 1')).toBeInTheDocument();
  });

  it('displays position filters', () => {
    render(<QuickPositionSearch {...defaultProps} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('PG')).toBeInTheDocument();
    expect(screen.getByText('SG')).toBeInTheDocument();
    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.getByText('PF')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('shows missing positions alert when roster is incomplete', () => {
    render(<QuickPositionSearch {...defaultProps} />);

    expect(screen.getByText('Need players for: PG, SG, SF, PF, C')).toBeInTheDocument();
  });

  it('does not show missing positions alert when roster has all positions', () => {
    const completeRoster: Player[] = [
      { ...mockPlayer, id: 1, position: 'PG' },
      { ...mockPlayer, id: 2, position: 'SG' },
      { ...mockPlayer, id: 3, position: 'SF' },
      { ...mockPlayer, id: 4, position: 'PF' },
      { ...mockPlayer, id: 5, position: 'C' },
    ];

    render(<QuickPositionSearch {...defaultProps} currentRoster={completeRoster} />);

    expect(screen.queryByText(/Need players for:/)).not.toBeInTheDocument();
    expect(screen.getByText('✓ Complete lineup')).toBeInTheDocument();
  });

  it('shows position counts in badges', () => {
    const roster: Player[] = [
      { ...mockPlayer, id: 1, position: 'PG' },
      { ...mockPlayer, id: 2, position: 'PG' },
      { ...mockPlayer, id: 3, position: 'SG' },
    ];

    render(<QuickPositionSearch {...defaultProps} currentRoster={roster} />);

    // Position buttons with their counts
    const pgButton = screen.getByRole('button', { name: /PG/i });
    const sgButton = screen.getByRole('button', { name: /SG/i });
    const sfButton = screen.getByRole('button', { name: /SF/i });

    expect(pgButton).toHaveTextContent('2');
    expect(sgButton).toHaveTextContent('1');
    expect(sfButton).toHaveTextContent('0');
  });

  it('fetches players when position is selected', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          players: [mockPlayer],
        },
      }),
    });

    render(<QuickPositionSearch {...defaultProps} />);

    const pgButton = screen.getByRole('button', { name: /^PG/ });
    fireEvent.click(pgButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/players?')
      );
    });

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  it('fetches players when searching by name', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          players: [mockPlayer],
        },
      }),
    });

    render(<QuickPositionSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by player name...');
    await user.type(searchInput, 'LeBron');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=LeBron')
      );
    });

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  it('filters out players already in roster', async () => {
    const currentRoster = [mockPlayer];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          players: [
            mockPlayer,
            { ...mockPlayer, id: 2, name: 'Anthony Davis' },
          ],
        },
      }),
    });

    render(<QuickPositionSearch {...defaultProps} currentRoster={currentRoster} />);

    const allButton = screen.getAllByRole('button', { name: /All/ })[0];
    fireEvent.click(allButton);

    // Trigger a search
    const searchInput = screen.getByPlaceholderText('Search by player name...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
      expect(screen.getByText('Anthony Davis')).toBeInTheDocument();
    });
  });

  it('calls onAddPlayer when Add to Team button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          players: [mockPlayer],
        },
      }),
    });

    render(<QuickPositionSearch {...defaultProps} />);

    const pgButton = screen.getByRole('button', { name: /^PG/ });
    fireEvent.click(pgButton);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add to Team 1/ });
    fireEvent.click(addButton);

    expect(mockOnAddPlayer).toHaveBeenCalledWith(mockPlayer, 1);
  });

  it('removes player from list after adding', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          players: [mockPlayer],
        },
      }),
    });

    render(<QuickPositionSearch {...defaultProps} />);

    const pgButton = screen.getByRole('button', { name: /^PG/ });
    fireEvent.click(pgButton);

    await waitFor(() => {
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add to Team 1/ });
    fireEvent.click(addButton);

    expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
  });

  it('displays loading state while fetching', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<QuickPositionSearch {...defaultProps} />);

    const pgButton = screen.getByRole('button', { name: /^PG/ });
    fireEvent.click(pgButton);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('displays no players found message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          players: [],
        },
      }),
    });

    render(<QuickPositionSearch {...defaultProps} />);

    const pgButton = screen.getByRole('button', { name: /^PG/ });
    fireEvent.click(pgButton);

    await waitFor(() => {
      expect(screen.getByText('No players found')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(<QuickPositionSearch {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays team roster count', () => {
    const roster: Player[] = [
      { ...mockPlayer, id: 1 },
      { ...mockPlayer, id: 2 },
      { ...mockPlayer, id: 3 },
    ];

    render(<QuickPositionSearch {...defaultProps} currentRoster={roster} />);

    expect(screen.getByText('Team 1: 3/15 players')).toBeInTheDocument();
  });

  it('handles initial position prop', () => {
    render(<QuickPositionSearch {...defaultProps} position="SF" />);

    // The SF button should be selected (have default variant)
    const sfButton = screen.getByRole('button', { name: /^SF/ });
    expect(sfButton.className).toContain('default');
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<QuickPositionSearch {...defaultProps} />);

    const pgButton = screen.getByRole('button', { name: /^PG/ });
    fireEvent.click(pgButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching players:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});