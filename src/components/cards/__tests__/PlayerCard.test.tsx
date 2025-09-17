/**
 * Tests for PlayerCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from '../PlayerCard';
import { Player } from '@/types';

// Mock the format utilities
const mockFormatDecimal = jest.fn((value) => value?.toFixed(1) || 'N/A');
const mockFormatPercentage = jest.fn((value) => value ? `${(value * 100).toFixed(1)}%` : 'N/A');
const mockFormatPlayerName = jest.fn((name) => name?.trim() || '');
const mockFormatTeamName = jest.fn((team) => team || 'Free Agent');
const mockGetPositionAbbreviation = jest.fn((position) => {
  const map: Record<string, string> = {
    'Point Guard': 'PG',
    'Shooting Guard': 'SG',
    'Small Forward': 'SF',
    'Power Forward': 'PF',
    'Center': 'C',
  };
  return map[position] || position;
});
const mockCalculatePlayerEfficiency = jest.fn(() => 15.5);

jest.mock('@/lib/utils/format', () => ({
  formatDecimal: mockFormatDecimal,
  formatPercentage: mockFormatPercentage,
  formatPlayerName: mockFormatPlayerName,
  formatTeamName: mockFormatTeamName,
  getPositionAbbreviation: mockGetPositionAbbreviation,
  calculatePlayerEfficiency: mockCalculatePlayerEfficiency,
}));

const mockPlayer: Player = {
  id: 1,
  name: 'LeBron James',
  position: 'Small Forward',
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
  imageUrl: 'https://example.com/lebron.jpg',
  createdAt: new Date('2023-01-01'),
};

describe('PlayerCard', () => {
  const defaultProps = {
    player: mockPlayer,
    isSelected: false,
    showActions: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders player information correctly', () => {
    render(<PlayerCard {...defaultProps} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('SF')).toBeInTheDocument(); // Position badge
  });

  it('displays player statistics', () => {
    render(<PlayerCard {...defaultProps} />);

    expect(screen.getByText('25.0')).toBeInTheDocument(); // Points
    expect(screen.getByText('7.5')).toBeInTheDocument(); // Rebounds
    expect(screen.getByText('8.0')).toBeInTheDocument(); // Assists
    expect(screen.getByText('PPG')).toBeInTheDocument();
    expect(screen.getByText('RPG')).toBeInTheDocument();
    expect(screen.getByText('APG')).toBeInTheDocument();
  });


  it('applies selected styling when isSelected is true', () => {
    render(<PlayerCard {...defaultProps} isSelected={true} />);

    const card = screen.getByRole('button');
    expect(card).toHaveClass('ring-2', 'ring-primary');
  });

  it('calls onSelect when clicked and not selected', () => {
    const onSelect = jest.fn();
    render(<PlayerCard {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockPlayer);
  });

  it('calls onDeselect when clicked and selected', () => {
    const onDeselect = jest.fn();
    render(
      <PlayerCard 
        {...defaultProps} 
        isSelected={true} 
        onDeselect={onDeselect} 
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onDeselect).toHaveBeenCalledWith(mockPlayer);
  });

  it('shows "Add to Team" button when not selected', () => {
    render(<PlayerCard {...defaultProps} />);

    expect(screen.getByText('Add to Team')).toBeInTheDocument();
  });

  it('shows "Remove" button when selected', () => {
    render(<PlayerCard {...defaultProps} isSelected={true} />);

    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('does not show action buttons when showActions is false', () => {
    render(<PlayerCard {...defaultProps} showActions={false} />);

    expect(screen.queryByText('Add to Team')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('handles player without team', () => {
    const playerWithoutTeam = { ...mockPlayer, team: undefined };
    render(<PlayerCard {...defaultProps} player={playerWithoutTeam} />);

    expect(screen.getByText('Free Agent')).toBeInTheDocument();
  });

});
