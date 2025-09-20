/**
 * PlayerCard Component
 * Displays essential player information in a simple card format
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerAvatar } from '@/components/ui/player-avatar';
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
  selectedTeam?: 1 | 2 | null;
  showActions?: boolean;
  className?: string;
  onSelectTeam?: (player: Player, teamId: 1 | 2) => void;
  onDeselect?: (player: Player) => void;
}

export function PlayerCard({
  player,
  isSelected = false,
  selectedTeam = null,
  showActions = true,
  className,
  onSelectTeam,
  onDeselect,
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

  const getTeamColorClass = () => {
    if (selectedTeam === 1) return 'ring-2 ring-blue-500 bg-blue-50';
    if (selectedTeam === 2) return 'ring-2 ring-green-500 bg-green-50';
    return '';
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        'hover:shadow-md',
        isSelected && getTeamColorClass(),
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header with Avatar, Name and Position */}
        <div className="flex items-start gap-3 mb-3">
          <PlayerAvatar
            name={player.name}
            imageUrl={player.imageUrl}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-foreground truncate">
                {formatPlayerName(player.name)}
              </h3>
              <Badge variant={getPositionBadgeVariant(position)}>
                {position}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatTeamName(player.team)}
            </p>
            {selectedTeam && (
              <Badge variant="secondary" className={cn(
                'mt-2',
                selectedTeam === 1 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              )}>
                Team {selectedTeam}
              </Badge>
            )}
          </div>
        </div>

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

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-2">
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
                  variant="outline"
                  size="sm"
                  className="border-blue-300 hover:bg-blue-50 text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTeamSelect(1);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Team 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-300 hover:bg-green-50 text-green-700"
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
