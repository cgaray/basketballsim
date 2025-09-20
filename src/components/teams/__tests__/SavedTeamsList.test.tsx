import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SavedTeamsList } from '../SavedTeamsList';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('SavedTeamsList', () => {
  const mockOnLoadTeam = jest.fn();

  const mockPlayer = {
    id: 1,
    name: 'LeBron James',
    position: 'SF',
    team: 'LAL',
    pointsPerGame: 27.1,
    reboundsPerGame: 7.5,
    assistsPerGame: 7.3,
  };

  const mockTeam = {
    id: 1,
    name: 'Dream Team',
    players: [
      { ...mockPlayer, id: 1, position: 'PG' },
      { ...mockPlayer, id: 2, position: 'SG' },
      { ...mockPlayer, id: 3, position: 'SF' },
      { ...mockPlayer, id: 4, position: 'PF' },
      { ...mockPlayer, id: 5, position: 'C' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    expect(screen.getByText('Loading saved teams...')).toBeInTheDocument();
  });

  it('displays teams list after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    expect(screen.getByText('5 players')).toBeInTheDocument();
  });

  it('shows empty state when no teams exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('No saved teams yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Build a team and save it to see it here')).toBeInTheDocument();
  });

  it('displays position counts for each team', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('PG: 1')).toBeInTheDocument();
    });

    expect(screen.getByText('SG: 1')).toBeInTheDocument();
    expect(screen.getByText('SF: 1')).toBeInTheDocument();
    expect(screen.getByText('PF: 1')).toBeInTheDocument();
    expect(screen.getByText('C: 1')).toBeInTheDocument();
  });

  it('shows trophy icon for complete rosters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // Trophy icon should be present for complete roster
    const trophyIcon = document.querySelector('.text-yellow-500');
    expect(trophyIcon).toBeInTheDocument();
  });

  it('expands team details when eye button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // Initially, roster details are not shown
    expect(screen.queryByText('Roster:')).not.toBeInTheDocument();

    // Click eye button to expand
    const eyeButton = screen.getAllByRole('button')[0]; // First button is the eye button
    fireEvent.click(eyeButton);

    expect(screen.getByText('Roster:')).toBeInTheDocument();
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('PG • 27.1 PPG')).toBeInTheDocument();
  });

  it('calls onLoadTeam when load buttons are clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // Click Load to Team 1
    const loadTeam1Button = screen.getByRole('button', { name: /Load to Team 1/i });
    fireEvent.click(loadTeam1Button);

    expect(mockOnLoadTeam).toHaveBeenCalledWith(mockTeam, 1);

    // Click Load to Team 2
    const loadTeam2Button = screen.getByRole('button', { name: /Load to Team 2/i });
    fireEvent.click(loadTeam2Button);

    expect(mockOnLoadTeam).toHaveBeenCalledWith(mockTeam, 2);
  });

  it('deletes team when delete button is clicked and confirmed', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockTeam],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons[deleteButtons.length - 1]; // Last button is delete
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this team?');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/teams/1', {
        method: 'DELETE',
      });
    });

    // Team should be removed from list
    await waitFor(() => {
      expect(screen.queryByText('Dream Team')).not.toBeInTheDocument();
    });
  });

  it('does not delete team when deletion is cancelled', async () => {
    (global.confirm as jest.Mock).mockReturnValue(false);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(deleteButton);

    // Delete should not be called
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial fetch
    expect(screen.getByText('Dream Team')).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load teams')).toBeInTheDocument();
    });
  });

  it('handles API error responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch teams')).toBeInTheDocument();
    });
  });

  it('creates simulate link with team id', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    const simulateLink = screen.getByRole('link', { name: /Simulate/i });
    expect(simulateLink).toHaveAttribute('href', '/matches?team1=1');
  });

  it('handles incomplete rosters correctly', async () => {
    const incompleteTeam = {
      ...mockTeam,
      players: [
        { ...mockPlayer, id: 1, position: 'PG' },
        { ...mockPlayer, id: 2, position: 'SG' },
        // Missing SF, PF, C
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [incompleteTeam],
      }),
    });

    render(<SavedTeamsList onLoadTeam={mockOnLoadTeam} />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // No trophy icon for incomplete roster
    const trophyIcon = document.querySelector('.text-yellow-500');
    expect(trophyIcon).not.toBeInTheDocument();

    // Position counts show zeros for missing positions
    expect(screen.getByText('SF: 0')).toBeInTheDocument();
    expect(screen.getByText('PF: 0')).toBeInTheDocument();
    expect(screen.getByText('C: 0')).toBeInTheDocument();
  });

  it('renders without onLoadTeam prop', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [mockTeam],
      }),
    });

    render(<SavedTeamsList />);

    await waitFor(() => {
      expect(screen.getByText('Dream Team')).toBeInTheDocument();
    });

    // Load buttons should not be present
    expect(screen.queryByText(/Load to Team/i)).not.toBeInTheDocument();

    // Simulate button should still be present
    expect(screen.getByRole('link', { name: /Simulate/i })).toBeInTheDocument();
  });
});