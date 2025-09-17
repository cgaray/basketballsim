/**
 * PlayerCard Component
 * Displays essential player information in a simple card format
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
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  showActions?: boolean;
  className?: string;
  onSelect?: (player: Player) => void;
  onDeselect?: (player: Player) => void;
}

export function PlayerCard({
  player,
  isSelected = false,
  showActions = true,
  className,
  onSelect,
  onDeselect,
}: PlayerCardProps) {
  const handleClick = () => {
    if (isSelected && onDeselect) {
      onDeselect(player);
    } else if (!isSelected && onSelect) {
      onSelect(player);
    }
  };

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

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-md',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Header with Name and Position */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-foreground truncate">
            {formatPlayerName(player.name)}
          </h3>
          <Badge variant={getPositionBadgeVariant(position)}>
            {position}
          </Badge>
        </div>

        {/* Team */}
        <p className="text-sm text-muted-foreground mb-3">
          {formatTeamName(player.team)}
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
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

        {/* Action Button */}
        {showActions && (
          <Button
            variant={isSelected ? "destructive" : "default"}
            size="sm"
            className="w-full"
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
