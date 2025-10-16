/**
 * TeamRoster Component
 * Displays current team roster with position validation
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Users, Save, Trash2, Trophy, Search, Plus, CheckCircle } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { Player } from '@/types';
import { QuickPositionSearch } from '@/components/players/QuickPositionSearch';

interface PositionGroupProps {
  position: string;
  players: Player[];
  onRemove: (playerId: number) => void;
  onQuickAdd: (position: string) => void;
}

interface TeamRosterProps {
  teamId: 1 | 2;
  availablePlayers?: Player[];
}

function PositionGroup({ position, players, onRemove, onQuickAdd }: PositionGroupProps) {
  const positionNames = {
    PG: 'Point Guards',
    SG: 'Shooting Guards',
    SF: 'Small Forwards',
    PF: 'Power Forwards',
    C: 'Centers',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
          {positionNames[position as keyof typeof positionNames]} ({players.length})
          {players.length === 0 && <AlertCircle className="w-4 h-4 text-orange-500" />}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuickAdd(position)}
          className="h-7 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add {position}
        </Button>
      </div>
      {players.length === 0 ? (
        <div className="p-3 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground text-sm">
          No {position} players
        </div>
      ) : (
        <div className="space-y-1">
          {players.map(player => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
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
      )}
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Roster ({roster.length}/15)
            {isComplete && <Trophy className="w-5 h-5 text-yellow-500" />}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(['PG', 'SG', 'SF', 'PF', 'C'] as const).map(position => {
              const count = positionCounts[position];
              const isMissing = count === 0;
              return (
                <Button
                  key={position}
                  variant={isMissing ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleQuickAdd(position)}
                  className={isMissing ? "animate-pulse" : ""}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {position} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Team Name</label>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value, teamId)}
            placeholder="Enter team name..."
            className="w-full"
          />
        </div>

        {/* Position Summary */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(positionCounts).map(([pos, count]) => (
            <Badge
              key={pos}
              variant={count > 0 ? "default" : "outline"}
              className="justify-center py-1"
            >
              {pos}: {count}
            </Badge>
          ))}
        </div>

        {/* Roster Status */}
        <div className="flex items-center gap-2 text-sm">
          {isComplete ? (
            <div className="flex items-center gap-2 text-green-600">
              <Trophy className="w-4 h-4" />
              Complete starting lineup!
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              Missing positions for complete lineup
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          </div>
        )}

        {/* Quick Search Component */}
        {showQuickSearch && (
          <div className="mb-4">
            <QuickPositionSearch
              teamId={teamId}
              position={quickSearchPosition}
              currentRoster={roster}
              onAddPlayer={addPlayer}
              onClose={handleCloseQuickSearch}
            />
          </div>
        )}

        {/* Players by Position */}
        {roster.length > 0 ? (
          <div className="space-y-4">
            {(Object.keys(groupedPlayers) as Array<keyof typeof groupedPlayers>).map(position => (
              <PositionGroup
                key={position}
                position={position}
                players={groupedPlayers[position]}
                onRemove={(playerId) => removePlayer(playerId, teamId)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No players added yet</p>
            <p className="text-sm">Start building your team by browsing players</p>
          </div>
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
