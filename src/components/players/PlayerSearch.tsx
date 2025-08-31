/**
 * PlayerSearch Component
 * Provides search and filtering functionality for players
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { SearchFilters } from '@/types';

interface PlayerSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const POSITIONS = [
  { value: '', label: 'All Positions' },
  { value: 'PG', label: 'Point Guard' },
  { value: 'SG', label: 'Shooting Guard' },
  { value: 'SF', label: 'Small Forward' },
  { value: 'PF', label: 'Power Forward' },
  { value: 'C', label: 'Center' },
];

export function PlayerSearch({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}: PlayerSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by player name..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-48">
            <select
              value={filters.position || ''}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-basketball-orange focus:border-transparent"
            >
              {POSITIONS.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Team Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <Input
                placeholder="Team name..."
                value={filters.team || ''}
                onChange={(e) => handleFilterChange('team', e.target.value)}
              />
            </div>

            {/* Season Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season
              </label>
              <Input
                type="number"
                placeholder="2023"
                value={filters.season || ''}
                onChange={(e) => handleFilterChange('season', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Points Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points Per Game
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPoints || ''}
                  onChange={(e) => handleFilterChange('minPoints', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPoints || ''}
                  onChange={(e) => handleFilterChange('maxPoints', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Rebounds Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rebounds Per Game
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minRebounds || ''}
                  onChange={(e) => handleFilterChange('minRebounds', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxRebounds || ''}
                  onChange={(e) => handleFilterChange('maxRebounds', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Assists Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assists Per Game
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minAssists || ''}
                  onChange={(e) => handleFilterChange('minAssists', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAssists || ''}
                  onChange={(e) => handleFilterChange('maxAssists', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={onSearch}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
