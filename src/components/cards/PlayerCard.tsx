/**
 * PlayerCard Component
 * Displays player information with improved layout and season selector
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types';
import {
  formatDecimal,
  formatPlayerName,
  formatTeamName,
  getPositionAbbreviation
} from '@/lib/utils/format';
import { Plus, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  selectedTeam?: 1 | 2 | null;
  showActions?: boolean;
  className?: string;
  onSelectTeam?: (player: Player, teamId: 1 | 2) => void;
  onDeselect?: (player: Player) => void;
  seasonOptions?: number[];
  selectedSeason?: number;
  onSeasonChange?: (year: number) => void;
}

export function PlayerCard({
  player,
  isSelected = false,
  selectedTeam = null,
  showActions = true,
  className,
  onSelectTeam,
  onDeselect,
  seasonOptions = [],
  selectedSeason,
  onSeasonChange,
}: PlayerCardProps) {
  const handleTeamSelect = (teamId: 1 | 2) => {
    if (onSelectTeam) {
      onSelectTeam(player, teamId);
    }
  };

  const handleDeselect = () => {
    if (onDeselect) {
      onDeselect(player);
    }
  };

  const position = getPositionAbbreviation(player.position);

  const positionColors: Record<string, string> = {
    PG: 'bg-purple-100 text-purple-800 border-purple-200',
    SG: 'bg-blue-100 text-blue-800 border-blue-200',
    SF: 'bg-green-100 text-green-800 border-green-200',
    PF: 'bg-orange-100 text-orange-800 border-orange-200',
    C: 'bg-red-100 text-red-800 border-red-200',
  };

  const getTeamColorClass = () => {
    if (selectedTeam === 1) return 'ring-2 ring-blue-500 bg-blue-50';
    if (selectedTeam === 2) return 'ring-2 ring-red-500 bg-red-50';
    return '';
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 overflow-hidden',
        'hover:shadow-md',
        isSelected && getTeamColorClass(),
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header: Name + Position + Team Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground truncate">
              {formatPlayerName(player.name)}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {formatTeamName(player.team)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {selectedTeam && (
              <Badge className={cn(
                'text-xs',
                selectedTeam === 1 ? 'bg-blue-500' : 'bg-red-500'
              )}>
                Team {selectedTeam}
              </Badge>
            )}
            <Badge className={cn('border', positionColors[position] || 'bg-gray-100')}>
              {position}
            </Badge>
          </div>
        </div>

        {/* Season Selector - Improved */}
        {seasonOptions.length > 1 && onSeasonChange && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Season</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {seasonOptions.map(year => (
                <button
                  key={year}
                  onClick={() => onSeasonChange(year)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md border transition-colors',
                    selectedSeason === year || (!selectedSeason && year === seasonOptions[0])
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted hover:bg-muted/80 border-transparent'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid - Improved */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatDecimal(player.pointsPerGame)}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PPG</div>
          </div>
          <div className="text-center border-x border-border">
            <div className="text-2xl font-bold text-foreground">
              {formatDecimal(player.reboundsPerGame)}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RPG</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatDecimal(player.assistsPerGame)}
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">APG</div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div>
            {isSelected ? (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeselect();
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Remove from Team {selectedTeam}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTeamSelect(1);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Team 1
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTeamSelect(2);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Team 2
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
