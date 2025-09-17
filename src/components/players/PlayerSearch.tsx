/**
 * PlayerSearch Component
 * Provides basic search functionality for players by name and position
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface PlayerSearchProps {
  searchTerm: string;
  position: string;
  onSearchChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onClear: () => void;
}

const POSITIONS = [
  { value: '', label: 'All Positions' },
  { value: 'Point Guard', label: 'Point Guard' },
  { value: 'Shooting Guard', label: 'Shooting Guard' },
  { value: 'Small Forward', label: 'Small Forward' },
  { value: 'Power Forward', label: 'Power Forward' },
  { value: 'Center', label: 'Center' },
];

export function PlayerSearch({
  searchTerm,
  position,
  onSearchChange,
  onPositionChange,
  onClear,
}: PlayerSearchProps) {
  const hasFilters = searchTerm || position;

  return (
    <div className="flex gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by player name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Position Filter */}
      <div className="w-48">
        <select
          value={position}
          onChange={(e) => onPositionChange(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
        >
          {POSITIONS.map((pos) => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Button */}
      {hasFilters && (
        <Button
          onClick={onClear}
          variant="outline"
          size="icon"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}