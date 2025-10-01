/**
 * Tests for PlayerCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlayerCard } from '../PlayerCard';
import { Player } from '@/types';

// Mock the format utilities before importing the component
jest.mock('@/lib/utils/format', () => {
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

  return {
    formatDecimal: mockFormatDecimal,
    formatPercentage: mockFormatPercentage,
    formatPlayerName: mockFormatPlayerName,
    formatTeamName: mockFormatTeamName,
    getPositionAbbreviation: mockGetPositionAbbreviation,
    calculatePlayerEfficiency: mockCalculatePlayerEfficiency,
  };
});

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


  it('applies selected styling when isSelected is true with team 1', () => {
    const { container } = render(<PlayerCard {...defaultProps} isSelected={true} selectedTeam={1} />);

    const card = container.querySelector('.ring-2');
    expect(card).toHaveClass('ring-blue-500');
  });

  it('applies selected styling when isSelected is true with team 2', () => {
    const { container } = render(<PlayerCard {...defaultProps} isSelected={true} selectedTeam={2} />);

    const card = container.querySelector('.ring-2');
    expect(card).toHaveClass('ring-green-500');
  });

  it('calls onDeselect when Remove button is clicked', () => {
    const onDeselect = jest.fn();
    render(
      <PlayerCard
        {...defaultProps}
        isSelected={true}
        selectedTeam={1}
        onDeselect={onDeselect}
      />
    );

    fireEvent.click(screen.getByText(/Remove from Team/));
    expect(onDeselect).toHaveBeenCalledWith(mockPlayer);
  });

  it('calls onSelectTeam when Team 1 or Team 2 button is clicked', () => {
    const onSelectTeam = jest.fn();
    render(
      <PlayerCard
        {...defaultProps}
        isSelected={false}
        onSelectTeam={onSelectTeam}
      />
    );

    // Click Team 1 button
    fireEvent.click(screen.getByText('Team 1'));
    expect(onSelectTeam).toHaveBeenCalledWith(mockPlayer, 1);

    // Click Team 2 button
    fireEvent.click(screen.getByText('Team 2'));
    expect(onSelectTeam).toHaveBeenCalledWith(mockPlayer, 2);
  });

  it('shows "Add to Team" button when not selected', () => {
    render(<PlayerCard {...defaultProps} />);

    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
  });

  it('shows "Remove from Team" button with team number when selected', () => {
    render(<PlayerCard {...defaultProps} isSelected={true} selectedTeam={1} />);

    expect(screen.getByText('Remove from Team 1')).toBeInTheDocument();
  });

  it('does not show action buttons when showActions is false', () => {
    render(<PlayerCard {...defaultProps} showActions={false} />);

    expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Team 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove from Team')).not.toBeInTheDocument();
  });

  it('handles player without team', () => {
    const playerWithoutTeam = { ...mockPlayer, team: undefined };
    render(<PlayerCard {...defaultProps} player={playerWithoutTeam} />);

    expect(screen.getByText('Free Agent')).toBeInTheDocument();
  });

});
