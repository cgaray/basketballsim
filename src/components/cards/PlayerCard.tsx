/**
 * PlayerCard Component
 * Displays player information in a basketball card format
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types';
import { 
  formatDecimal, 
  formatPercentage, 
  formatPlayerName, 
  formatTeamName, 
  getPositionAbbreviation,
  calculatePlayerEfficiency 
} from '@/lib/utils/format';
import { getPlayerImage, PlayerImageData } from '@/lib/utils/player-images';
import { Circle, Plus, X, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { YearSelector } from '@/components/ui/year-selector';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  isDragging?: boolean;
  showActions?: boolean;
  showYearSelector?: boolean;
  availableYears?: number[];
  selectedYear?: number;
  bestYear?: number;
  className?: string;
  onSelect?: (player: Player) => void;
  onDeselect?: (player: Player) => void;
  onYearChange?: (year: number) => void;
}

export function PlayerCard({
  player,
  isSelected = false,
  isDragging = false,
  showActions = true,
  showYearSelector = false,
  availableYears = [],
  selectedYear,
  bestYear,
  className,
  onSelect,
  onDeselect,
  onYearChange,
}: PlayerCardProps) {
  const [imageData, setImageData] = useState<PlayerImageData | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const imgData = getPlayerImage(player.name, player.team);
        setImageData(imgData);
        setImageError(false);
      } catch (error) {
        setImageError(true);
      }
    };

    loadImage();
  }, [player.name, player.team]);

  const handleClick = () => {
    if (isSelected && onDeselect) {
      onDeselect(player);
    } else if (!isSelected && onSelect) {
      onSelect(player);
    }
  };

  const efficiency = calculatePlayerEfficiency(player);
  const position = getPositionAbbreviation(player.position);

  const getPositionBadgeVariant = (pos: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants = {
      PG: 'default' as const,
      SG: 'secondary' as const,
      SF: 'outline' as const,
      PF: 'destructive' as const,
      C: 'default' as const,
    };
    return variants[pos as keyof typeof variants] || 'outline';
  };

  const getRarityBorder = (eff: number) => {
    if (eff >= 20) return 'border-yellow-500';
    if (eff >= 15) return 'border-purple-500';
    if (eff >= 10) return 'border-blue-500';
    return 'border-border';
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 cursor-pointer group',
        'hover:shadow-lg hover:scale-105',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        isDragging && 'opacity-50 scale-95',
        getRarityBorder(efficiency),
        className
      )}
      onClick={handleClick}
    >
      {/* Card Header with Player Image */}
      <div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted">
        {imageData && !imageError ? (
          <img
            src={imageData.url}
            alt={imageData.alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
            <Circle className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Position Badge */}
        <Badge
          variant={getPositionBadgeVariant(position)}
          className="absolute top-2 left-2 text-xs font-bold"
        >
          {position}
        </Badge>

        {/* Efficiency Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {efficiency.toFixed(1)}
        </div>

        {/* Team Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-white text-xs font-medium truncate">
            {formatTeamName(player.team)}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        {/* Player Name */}
        <h3 className="font-bold text-lg text-foreground mb-1 truncate">
          {formatPlayerName(player.name)}
        </h3>

        {/* Season Info and Year Selector */}
        <div className="mb-3 bg-muted rounded-lg p-2">
          {showYearSelector && availableYears.length > 1 ? (
            <YearSelector
              availableYears={availableYears}
              selectedYear={selectedYear || player.season || 2023}
              onYearChange={onYearChange || (() => {})}
              bestYear={bestYear}
              className="mb-1"
            />
          ) : (
            player.season && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Season {player.season} • {player.gamesPlayed || 0} GP
                </p>
              </div>
            )
          )}
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {formatDecimal(player.pointsPerGame)}
            </div>
            <div className="text-xs text-muted-foreground">PPG</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {formatDecimal(player.reboundsPerGame)}
            </div>
            <div className="text-xs text-muted-foreground">RPG</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">
              {formatDecimal(player.assistsPerGame)}
            </div>
            <div className="text-xs text-muted-foreground">APG</div>
          </div>
        </div>

        {/* Shooting Percentages */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {formatPercentage(player.fieldGoalPercentage)}
            </div>
            <div className="text-muted-foreground">FG%</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {formatPercentage(player.threePointPercentage)}
            </div>
            <div className="text-muted-foreground">3P%</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {formatPercentage(player.freeThrowPercentage)}
            </div>
            <div className="text-muted-foreground">FT%</div>
          </div>
        </div>

        {/* Defensive Stats */}
        {(player.stealsPerGame || player.blocksPerGame) && (
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span>SPG: {formatDecimal(player.stealsPerGame)}</span>
            <span>BPG: {formatDecimal(player.blocksPerGame)}</span>
          </div>
        )}

        {/* Action Button */}
        {showActions && (
          <Button
            variant={isSelected ? "destructive" : "default"}
            size="sm"
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {isSelected ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Remove
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Add to Team
              </>
            )}
          </Button>
        )}
      </CardContent>

    </Card>
  );
}
