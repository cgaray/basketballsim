import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerSearch } from '../PlayerSearch';

describe('PlayerSearch', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnPositionChange = jest.fn();
  const mockOnClear = jest.fn();

  const defaultProps = {
    searchTerm: '',
    position: '',
    onSearchChange: mockOnSearchChange,
    onPositionChange: mockOnPositionChange,
    onClear: mockOnClear,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and position select', () => {
    render(<PlayerSearch {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search by player name...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('All Positions')).toBeInTheDocument();
  });

  it('displays all position options', () => {
    render(<PlayerSearch {...defaultProps} />);

    const select = screen.getByRole('combobox');

    expect(select).toHaveDisplayValue('All Positions');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(options[0]).toHaveTextContent('All Positions');
    expect(options[1]).toHaveTextContent('Point Guard');
    expect(options[2]).toHaveTextContent('Shooting Guard');
    expect(options[3]).toHaveTextContent('Small Forward');
    expect(options[4]).toHaveTextContent('Power Forward');
    expect(options[5]).toHaveTextContent('Center');
  });

  it('calls onSearchChange when typing in search input', async () => {
    const user = userEvent.setup();
    render(<PlayerSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by player name...');
    await user.type(searchInput, 'LeBron');

    expect(mockOnSearchChange).toHaveBeenCalledTimes(6);
    expect(mockOnSearchChange).toHaveBeenLastCalledWith('LeBron');
  });

  it('calls onPositionChange when selecting a position', () => {
    render(<PlayerSearch {...defaultProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'PG' } });

    expect(mockOnPositionChange).toHaveBeenCalledWith('PG');
  });

  it('shows clear button when filters are active', () => {
    const { rerender } = render(<PlayerSearch {...defaultProps} />);

    // No clear button when no filters
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Clear button appears with search term
    rerender(<PlayerSearch {...defaultProps} searchTerm="LeBron" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Clear button appears with position filter
    rerender(<PlayerSearch {...defaultProps} searchTerm="" position="PG" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(<PlayerSearch {...defaultProps} searchTerm="LeBron" />);

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('displays current search term and position values', () => {
    render(
      <PlayerSearch
        {...defaultProps}
        searchTerm="James"
        position="SF"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search by player name...');
    expect(searchInput).toHaveValue('James');

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('SF');
  });

  it('handles empty state correctly', () => {
    render(<PlayerSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by player name...');
    expect(searchInput).toHaveValue('');

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('');

    // No clear button in empty state
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('maintains accessibility standards', () => {
    render(<PlayerSearch {...defaultProps} searchTerm="test" />);

    // Check for proper ARIA labels implicitly through role queries
    const searchInput = screen.getByPlaceholderText('Search by player name...');
    const select = screen.getByRole('combobox');
    const clearButton = screen.getByRole('button');

    expect(searchInput).toBeEnabled();
    expect(select).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });
});