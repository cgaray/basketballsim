/**
 * TeamRoster Component
 * Displays current team roster with position validation
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, Save, Trash2, X, CheckCircle } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { Player } from '@/types';
import { QuickPositionSearch } from '@/components/players/QuickPositionSearch';
import { cn } from '@/lib/utils/cn';

interface PositionGroupProps {
  position: string;
  players: Player[];
  onRemove: (playerId: number) => void;
}

interface TeamRosterProps {
  teamId: 1 | 2;
  availablePlayers?: Player[];
}

function PositionGroup({ position, players, onRemove }: PositionGroupProps) {
  const positionNames = {
    PG: 'Point Guards',
    SG: 'Shooting Guards',
    SF: 'Small Forwards',
    PF: 'Power Forwards',
    C: 'Centers',
  };

  if (players.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm text-muted-foreground">
          {positionNames[position as keyof typeof positionNames]} ({players.length})
        </h4>
        <div className="space-y-1">
          {players.map(player => (
            <div
              key={player.id}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{player.name}</div>
                <div className="text-xs text-muted-foreground">
                  {player.team} • {player.pointsPerGame.toFixed(1)} PPG
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(player.id)}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
    </div>
  );
}

export function TeamRoster({ teamId, availablePlayers = [] }: TeamRosterProps) {
  const {
    team1,
    team2,
    setTeamName,
    addPlayer,
    removePlayer,
    clearRoster,
    saveTeam,
    getPositionCount,
    isValidRoster,
    isLoading,
    error,
    successMessage,
    fillTeamWithBestPlayers,
    fillTeamWithWorstPlayers,
  } = useTeam();

  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [quickSearchPosition, setQuickSearchPosition] = useState('');

  const currentTeam = teamId === 1 ? team1 : team2;
  const roster = currentTeam.roster;
  const teamName = currentTeam.teamName;

  const positionCounts = getPositionCount(teamId);
  const isComplete = isValidRoster(teamId);

  const groupedPlayers = {
    PG: roster.filter(p => p.position === 'PG'),
    SG: roster.filter(p => p.position === 'SG'),
    SF: roster.filter(p => p.position === 'SF'),
    PF: roster.filter(p => p.position === 'PF'),
    C: roster.filter(p => p.position === 'C'),
  };

  const handleQuickAdd = (position: string) => {
    setQuickSearchPosition(position);
    setShowQuickSearch(true);
  };

  const handleCloseQuickSearch = () => {
    setShowQuickSearch(false);
    setQuickSearchPosition('');
  };

  const filledPositions = Object.values(positionCounts).filter(c => c > 0).length;
  const missingPositions = 5 - filledPositions;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        {/* Team Name Input - Prominent */}
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value, teamId)}
          placeholder="Team Name"
          className="text-lg font-semibold border-0 border-b-2 rounded-none px-0 focus-visible:ring-0"
        />
        
        {/* Metadata Row */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{roster.length}/15 players</span>
          {isComplete && (
            <Badge variant="outline" className="text-green-700 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>

        {/* Unified Position Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Starting 5</span>
            <span>{filledPositions}/5 positions filled</span>
          </div>
          <div className="flex gap-1">
            {(['PG', 'SG', 'SF', 'PF', 'C'] as const).map(position => {
              const count = positionCounts[position];
              const isEmpty = count === 0;
              return (
                <button
                  key={position}
                  onClick={() => handleQuickAdd(position)}
                  className={cn(
                    "flex-1 h-12 rounded-md text-sm font-medium transition-all flex flex-col items-center justify-center",
                    isEmpty 
                      ? "bg-orange-100 text-orange-700 border-2 border-dashed border-orange-300 hover:bg-orange-200" 
                      : "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                  )}
                >
                  <div>{position}</div>
                  <div className="text-xs opacity-75">{count}</div>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Unified Alert Slot */}
        {(error || successMessage) && (
          <Alert variant={error ? "destructive" : "default"} className={error ? "" : "bg-green-50 border-green-200 text-green-800"}>
            {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <AlertDescription>{error || successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Inline Quick Search */}
        {showQuickSearch && (
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Add {quickSearchPosition || 'Player'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCloseQuickSearch}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <QuickPositionSearch
              teamId={teamId}
              position={quickSearchPosition}
              currentRoster={roster}
              onAddPlayer={addPlayer}
              onClose={handleCloseQuickSearch}
            />
          </div>
        )}

        {/* Contextual Helper / Roster Display */}
        {roster.length === 0 ? (
          <div className="text-center py-6 px-4 bg-muted/30 rounded-lg border-2 border-dashed">
            <p className="text-sm text-muted-foreground">
              👆 Click a position above to find players and build your starting 5
            </p>
          </div>
        ) : (
          <>
            {!isComplete && missingPositions > 0 && (
              <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                💡 <strong>Tip:</strong> You need {missingPositions} more position{missingPositions !== 1 ? 's' : ''} for a complete starting lineup
              </div>
            )}
          <div className="space-y-4">
            {(Object.keys(groupedPlayers) as Array<keyof typeof groupedPlayers>).map(position => (
              <PositionGroup
                key={position}
                position={position}
                players={groupedPlayers[position]}
                onRemove={(playerId) => removePlayer(playerId, teamId)}
              />
            ))}
          </div>
          </>
        )}

        {/* Quick Fill Buttons */}
        {availablePlayers.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Quick Fill:</p>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => fillTeamWithBestPlayers(availablePlayers, teamId)}
                disabled={isLoading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                ⭐ Fill with Best
              </Button>
              <Button
                variant="outline"
                onClick={() => fillTeamWithWorstPlayers(availablePlayers, teamId)}
                disabled={isLoading}
                className="flex-1 border-orange-500 text-orange-700 hover:bg-orange-50"
              >
                💀 Fill with Worst
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {roster.length > 0 && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => saveTeam(teamId)}
              disabled={!teamName.trim() || roster.length === 0 || isLoading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Team'}
            </Button>
            <Button
              variant="outline"
              onClick={() => clearRoster(teamId)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
