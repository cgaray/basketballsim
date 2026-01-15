/**
 * TeamRoster Component
 * Simplified team roster builder with clear visual hierarchy
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Save, Trash2, X, CheckCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { Player } from '@/types';
import { QuickPositionSearch } from '@/components/players/QuickPositionSearch';
import { cn } from '@/lib/utils/cn';

interface TeamRosterProps {
  teamId: 1 | 2;
  availablePlayers?: Player[];
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
  const [showQuickFill, setShowQuickFill] = useState(false);

  const currentTeam = teamId === 1 ? team1 : team2;
  const roster = currentTeam.roster;
  const teamName = currentTeam.teamName;
  const teamColor = teamId === 1 ? 'blue' : 'red';

  const positionCounts = getPositionCount(teamId);
  const isComplete = isValidRoster(teamId);
  const filledPositions = Object.values(positionCounts).filter(c => c > 0).length;

  const handleQuickAdd = (position: string) => {
    setQuickSearchPosition(position);
    setShowQuickSearch(true);
  };

  const handleCloseQuickSearch = () => {
    setShowQuickSearch(false);
    setQuickSearchPosition('');
  };

  const positionLabels: Record<string, string> = {
    PG: 'Point Guard',
    SG: 'Shooting Guard',
    SF: 'Small Forward',
    PF: 'Power Forward',
    C: 'Center',
  };

  return (
    <Card className={cn(
      'w-full border-2',
      teamId === 1 ? 'border-blue-200' : 'border-red-200'
    )}>
      <CardHeader className="pb-3">
        {/* Team Name Input */}
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value, teamId)}
          placeholder={`Team ${teamId} Name`}
          className={cn(
            'text-lg font-semibold border-0 border-b-2 rounded-none px-0 focus-visible:ring-0',
            teamId === 1 ? 'border-blue-300 focus:border-blue-500' : 'border-red-300 focus:border-red-500'
          )}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {roster.length} player{roster.length !== 1 ? 's' : ''} • {filledPositions}/5 positions
          </span>
          {isComplete && (
            <Badge className={cn(
              'text-xs',
              teamId === 1 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            )}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Messages */}
        {(error || successMessage) && (
          <Alert variant={error ? "destructive" : "default"} className={error ? "" : "bg-green-50 border-green-200 text-green-800"}>
            {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <AlertDescription>{error || successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Position Grid - Main Interaction Area */}
        <div className="grid grid-cols-5 gap-2">
          {(['PG', 'SG', 'SF', 'PF', 'C'] as const).map(position => {
            const count = positionCounts[position];
            const isEmpty = count === 0;
            return (
              <button
                key={position}
                onClick={() => handleQuickAdd(position)}
                className={cn(
                  'p-3 rounded-lg text-center transition-all border-2',
                  'hover:scale-105 active:scale-95',
                  isEmpty
                    ? 'bg-gray-50 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                    : teamId === 1
                      ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                      : 'bg-red-50 border-red-300 hover:bg-red-100'
                )}
              >
                <div className={cn(
                  'text-sm font-bold',
                  isEmpty ? 'text-gray-500' : teamId === 1 ? 'text-blue-700' : 'text-red-700'
                )}>
                  {position}
                </div>
                <div className={cn(
                  'text-xs mt-1',
                  isEmpty ? 'text-gray-400' : 'text-muted-foreground'
                )}>
                  {isEmpty ? 'Add' : `${count} added`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Position Search - Expandable */}
        {showQuickSearch && (
          <div className={cn(
            'rounded-lg p-4 border-2',
            teamId === 1 ? 'bg-blue-50/50 border-blue-200' : 'bg-red-50/50 border-red-200'
          )}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">
                Add {positionLabels[quickSearchPosition] || 'Player'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCloseQuickSearch} className="h-8 w-8 p-0">
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

        {/* Roster List */}
        {roster.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Current Roster</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {roster.map(player => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg',
                    teamId === 1 ? 'bg-blue-50/50' : 'bg-red-50/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs w-8 justify-center">
                      {player.position}
                    </Badge>
                    <span className="text-sm font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {player.pointsPerGame?.toFixed(1)} PPG
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(player.id, teamId)}
                      className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn(
            'text-center py-8 rounded-lg border-2 border-dashed',
            teamId === 1 ? 'border-blue-200 bg-blue-50/30' : 'border-red-200 bg-red-50/30'
          )}>
            <p className="text-sm text-muted-foreground">
              Click a position above to add players
            </p>
          </div>
        )}

        {/* Quick Fill - Collapsible */}
        {availablePlayers.length > 0 && (
          <div className="border-t pt-3">
            <button
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Quick Fill Options
              </span>
              {showQuickFill ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showQuickFill && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTeamWithBestPlayers(availablePlayers, teamId)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Fill with Best
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTeamWithWorstPlayers(availablePlayers, teamId)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Fill with Worst
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {roster.length > 0 && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => saveTeam(teamId)}
              disabled={!teamName.trim() || roster.length === 0 || isLoading}
              className={cn(
                'flex-1',
                teamId === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Team'}
            </Button>
            <Button
              variant="outline"
              onClick={() => clearRoster(teamId)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
