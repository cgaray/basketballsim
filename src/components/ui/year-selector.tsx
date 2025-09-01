/**
 * Year Selector Component
 * Allows users to select different years/seasons for player statistics
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  bestYear?: number;
  className?: string;
}

export function YearSelector({
  availableYears,
  selectedYear,
  onYearChange,
  bestYear,
  className,
}: YearSelectorProps) {
  const sortedYears = [...availableYears].sort((a, b) => b - a); // Most recent first

  const handleBestYearClick = () => {
    if (bestYear) {
      onYearChange(bestYear);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value);
    onYearChange(year);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Year Dropdown */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <select
          value={selectedYear}
          onChange={handleSelectChange}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-basketball-orange focus:border-basketball-orange"
        >
          {sortedYears.map((year) => (
            <option key={year} value={year} className="text-gray-900 bg-white">
              {year}
              {year === bestYear ? ' ⭐' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Best Year Button or Peak Season Badge */}
      {bestYear && bestYear !== selectedYear && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBestYearClick}
          className="w-full flex items-center justify-center gap-1 bg-white border-gray-300 hover:bg-gray-50 text-xs"
        >
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-gray-700">Best Year</span>
        </Button>
      )}

      {bestYear === selectedYear && (
        <div className="flex items-center justify-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded border border-yellow-200">
          <Trophy className="w-3 h-3 text-yellow-600" />
          <span className="font-medium">Peak Season</span>
        </div>
      )}
    </div>
  );
}
