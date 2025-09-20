/**
 * Team Filler Component
 * Provides functionality to automatically fill teams with best available players
 */

'use client';

import React, { useState } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Star, Trophy } from 'lucide-react';
import { Player, Position } from '@/types';
import { findBestPlayersByPosition } from '@/lib/utils/player-stats';

interface TeamFillerProps {
  availablePlayers: Player[];
  teamId: 1 | 2;
  onSuccess?: () => void;
}

type FillStrategy = 'starting-five' | 'balanced-roster' | 'position-depth' | 'custom';

interface FillStrategyConfig {
  name: string;
  description: string;
  requirements: Record<string, number>;
  icon: React.ReactNode;
}

const FILL_STRATEGIES: Record<FillStrategy, FillStrategyConfig> = {
  'starting-five': {
    name: 'Starting Five',
    description: 'Fill with the best player available at each position',
    requirements: { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 },
    icon: <Star className="w-4 h-4" />,
  },
  'balanced-roster': {
    name: 'Balanced Roster',
    description: 'Create a well-rounded team with good depth at each position',
    requirements: { PG: 2, SG: 2, SF: 2, PF: 2, C: 2 },
    icon: <Users className="w-4 h-4" />,
  },
  'position-depth': {
    name: 'Position Depth',
    description: 'Maximize depth at each position for substitutions',
    requirements: { PG: 3, SG: 3, SF: 3, PF: 3, C: 3 },
    icon: <Trophy className="w-4 h-4" />,
  },
  'custom': {
    name: 'Custom',
    description: 'Choose specific numbers for each position',
    requirements: { PG: 1, SG: 1, SF: 1, PF: 1, C: 1 },
    icon: <Users className="w-4 h-4" />,
  },
};

export function TeamFiller({ availablePlayers, teamId, onSuccess }: TeamFillerProps) {
  const { fillTeamWithBestPlayers, team1, team2, isLoading } = useTeam();
  const [selectedStrategy, setSelectedStrategy] = useState<FillStrategy>('starting-five');
  const [customRequirements, setCustomRequirements] = useState<Record<string, number>>({
    PG: 1, SG: 1, SF: 1, PF: 1, C: 1
  });
  const [isFilling, setIsFilling] = useState(false);

  const currentTeam = teamId === 1 ? team1 : team2;
  const currentTeamPlayers = currentTeam.roster;
  const takenPlayerIds = new Set([...team1.roster, ...team2.roster].map(p => p.id));

  const getCurrentRequirements = (): Record<string, number> => {
    if (selectedStrategy === 'custom') {
      return customRequirements;
    }
    return FILL_STRATEGIES[selectedStrategy].requirements;
  };

  const getAvailableSlots = (): number => {
    return 15 - currentTeamPlayers.length;
  };

  const getRecommendedPlayers = (): Record<string, Player[]> => {
    const requirements = getCurrentRequirements();
    const available = availablePlayers.filter(p => !takenPlayerIds.has(p.id));

    return findBestPlayersByPosition(available, takenPlayerIds, requirements);
  };

  const getTotalPlayersToAdd = (): number => {
    const recommended = getRecommendedPlayers();
    return Object.values(recommended).flat().length;
  };

  const canFillTeam = (): boolean => {
    const slotsAvailable = getAvailableSlots();
    const playersToAdd = getTotalPlayersToAdd();
    return playersToAdd <= slotsAvailable && playersToAdd > 0;
  };

  const handleFillTeam = async () => {
    if (!canFillTeam()) return;

    setIsFilling(true);
    try {
      const requirements = getCurrentRequirements();
      fillTeamWithBestPlayers(availablePlayers, teamId, requirements);
      onSuccess?.();
    } catch (error) {
      console.error('Error filling team:', error);
    } finally {
      setIsFilling(false);
    }
  };

  const handleCustomRequirementChange = (position: string, value: number) => {
    setCustomRequirements(prev => ({
      ...prev,
      [position]: Math.max(0, Math.min(5, value)) // Limit between 0 and 5
    }));
  };

  const recommendedPlayers = getRecommendedPlayers();
  const totalPlayersToAdd = getTotalPlayersToAdd();
  const slotsAvailable = getAvailableSlots();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Fill Team with Best Players
        </CardTitle>
        <CardDescription>
          Automatically select the highest-rated available players for your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Strategy Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fill Strategy</label>
          <Select value={selectedStrategy} onValueChange={(value: FillStrategy) => setSelectedStrategy(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[320px]">
              {Object.entries(FILL_STRATEGIES).map(([key, strategy]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-start gap-2 py-1">
                    <div className="mt-0.5">{strategy.icon}</div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="font-medium leading-tight">{strategy.name}</div>
                      <div className="text-xs text-muted-foreground leading-tight break-words">{strategy.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Requirements (only show when custom is selected) */}
        {selectedStrategy === 'custom' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Custom Position Requirements</label>
            <div className="grid grid-cols-5 gap-2">
              {(['PG', 'SG', 'SF', 'PF', 'C'] as Position[]).map(position => (
                <div key={position} className="space-y-1">
                  <label className="text-xs font-medium">{position}</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={customRequirements[position]}
                    onChange={(e) => handleCustomRequirementChange(position, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preview</label>
          <div className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Players to add:</span>
              <Badge variant={totalPlayersToAdd <= slotsAvailable ? "default" : "destructive"}>
                {totalPlayersToAdd} players
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Available slots:</span>
              <Badge variant="outline">{slotsAvailable} slots</Badge>
            </div>

            {/* Position breakdown */}
            <div className="space-y-1 text-xs">
              <div className="font-medium">Players by position:</div>
              {Object.entries(recommendedPlayers).map(([position, players]) => (
                players.length > 0 && (
                  <div key={position} className="flex justify-between">
                    <span>{position}:</span>
                    <span>{players.length} player{players.length !== 1 ? 's' : ''}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Fill Button */}
        <Button
          onClick={handleFillTeam}
          disabled={!canFillTeam() || isFilling || isLoading}
          className="w-full"
        >
          {isFilling ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Filling Team...
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Fill Team ({totalPlayersToAdd} players)
            </>
          )}
        </Button>

        {/* Status Messages */}
        {!canFillTeam() && totalPlayersToAdd > slotsAvailable && (
          <div className="text-sm text-destructive">
            Not enough roster slots available. Need {totalPlayersToAdd - slotsAvailable} more slots.
          </div>
        )}

        {!canFillTeam() && totalPlayersToAdd === 0 && (
          <div className="text-sm text-muted-foreground">
            No suitable players found for the selected requirements.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
