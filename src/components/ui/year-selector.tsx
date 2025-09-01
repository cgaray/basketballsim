/**
 * Year Selector Component
 * Allows users to select different years/seasons for player statistics
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Calendar className="w-4 h-4 text-gray-500" />
      
      <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {sortedYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              <div className="flex items-center gap-2">
                {year}
                {year === bestYear && (
                  <Trophy className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {bestYear && bestYear !== selectedYear && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBestYearClick}
          className="flex items-center gap-1"
        >
          <Trophy className="w-3 h-3 text-yellow-500" />
          Best Year
        </Button>
      )}

      {bestYear === selectedYear && (
        <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          <Trophy className="w-3 h-3" />
          Peak Season
        </div>
      )}
    </div>
  );
}
