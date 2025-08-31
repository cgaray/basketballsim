/**
 * PlayerCard Component
 * Displays player information in a beautiful card format
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle, Target, TrendingUp, Award } from 'lucide-react';
import { Player } from '@/types';
import { 
  formatDecimal, 
  formatPercentage, 
  formatPlayerName, 
  formatTeamName,
  getPositionAbbreviation,
  calculatePlayerEfficiency 
} from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  isDragging?: boolean;
  onSelect?: (player: Player) => void;
  onDeselect?: (player: Player) => void;
  showActions?: boolean;
  className?: string;
}

export function PlayerCard({
  player,
  isSelected = false,
  isDragging = false,
  onSelect,
  onDeselect,
  showActions = true,
  className,
}: PlayerCardProps) {
  const efficiency = calculatePlayerEfficiency(player);
  const positionAbbr = getPositionAbbreviation(player.position);

  const handleAction = () => {
    if (isSelected && onDeselect) {
      onDeselect(player);
    } else if (!isSelected && onSelect) {
      onSelect(player);
    }
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group',
        isSelected && 'ring-2 ring-basketball-orange bg-orange-50',
        isDragging && 'opacity-50 scale-95',
        className
      )}
      onClick={showActions ? handleAction : undefined}
    >
      {/* Position Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={cn(
          'px-2 py-1 rounded-full text-xs font-bold text-white',
          positionAbbr === 'PG' && 'bg-blue-500',
          positionAbbr === 'SG' && 'bg-green-500',
          positionAbbr === 'SF' && 'bg-purple-500',
          positionAbbr === 'PF' && 'bg-orange-500',
          positionAbbr === 'C' && 'bg-red-500',
        )}>
          {positionAbbr}
        </div>
      </div>

      {/* Efficiency Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
          <TrendingUp className="w-3 h-3" />
          {efficiency.toFixed(1)}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-basketball-dark truncate">
              {formatPlayerName(player.name)}
            </h3>
            <p className="text-sm text-gray-600">
              {formatTeamName(player.team)}
            </p>
            {player.season && (
              <p className="text-xs text-gray-500">
                Season {player.season}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-basketball-orange">
              {formatDecimal(player.pointsPerGame)}
            </div>
            <div className="text-xs text-gray-600">PPG</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-basketball-court">
              {formatDecimal(player.reboundsPerGame)}
            </div>
            <div className="text-xs text-gray-600">RPG</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-basketball-blue">
              {formatDecimal(player.assistsPerGame)}
            </div>
            <div className="text-xs text-gray-600">APG</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">FG%</span>
            <span className="font-medium">
              {formatPercentage(player.fieldGoalPercentage)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">3P%</span>
            <span className="font-medium">
              {formatPercentage(player.threePointPercentage)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">FT%</span>
            <span className="font-medium">
              {formatPercentage(player.freeThrowPercentage)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Games</span>
            <span className="font-medium">
              {player.gamesPlayed || 'N/A'}
            </span>
          </div>
        </div>

        {/* Defensive Stats */}
        {(player.stealsPerGame || player.blocksPerGame) && (
          <div className="flex items-center justify-between text-sm mb-4 p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Defense</span>
            </div>
            <div className="flex gap-3">
              {player.stealsPerGame && (
                <span className="font-medium">
                  {formatDecimal(player.stealsPerGame)} SPG
                </span>
              )}
              {player.blocksPerGame && (
                <span className="font-medium">
                  {formatDecimal(player.blocksPerGame)} BPG
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {showActions && (
          <Button
            variant={isSelected ? 'destructive' : 'basketball'}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
          >
            {isSelected ? (
              <>
                <Award className="w-4 h-4 mr-2" />
                Remove
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 mr-2" />
                Add to Team
              </>
            )}
          </Button>
        )}
      </CardContent>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-basketball-orange/5 pointer-events-none" />
      )}
    </Card>
  );
}
