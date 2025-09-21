/**
 * TeamRoster Component
 * Displays a team's roster
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Player, Position } from '@/types';
import { TeamValidationResult } from '@/hooks/useTeamBuilder';
import { AlertTriangle, CheckCircle, X, Users } from 'lucide-react';

interface TeamRosterProps {
  teamId: 1 | 2;
  teamName: string;
  players: Player[];
  onRemovePlayer: (player: Player) => void;
  onTeamNameChange: (name: string) => void;
  validation: TeamValidationResult;
  isDropDisabled?: boolean;
}

export function TeamRoster({
  teamId,
  teamName,
  players,
  onRemovePlayer,
  onTeamNameChange,
  validation,
}: TeamRosterProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTeamBorder = () => {
    return teamId === 1 ? 'border-primary' : 'border-emerald-600';
  };

  const getTeamColor = () => {
    return teamId === 1 ? 'border-primary' : 'border-emerald-600';
  };

  const getPositionColor = (position: Position): string => {
    const colors = {
      PG: 'bg-blue-100 text-blue-800',
      SG: 'bg-green-100 text-green-800',
      SF: 'bg-purple-100 text-purple-800',
      PF: 'bg-orange-100 text-orange-800',
      C: 'bg-red-100 text-red-800',
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  // Render a placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Card className={`h-full ${getTeamBorder()} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={teamName}
                onChange={(e) => onTeamNameChange(e.target.value)}
                className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                placeholder={`Team ${teamId}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {players.length}/15 players
              </span>
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>

          {/* Position Summary */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(validation.positionCounts).map(([position, count]) => (
              <div
                key={position}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(position as Position)}`}
              >
                {position}: {count}
              </div>
            ))}
          </div>

          {/* Validation Messages */}
          {validation.errors.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-600 text-sm flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {error}
                </div>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-600 text-sm flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {warning}
                </div>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="min-h-[400px] bg-muted rounded-lg p-4">
            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Users className="w-12 h-12 mb-2" />
                <p className="text-center">
                  Add players here to build your team
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {players.map((player) => (
                  <div key={player.id} className="relative group">
                    <PlayerCard
                      player={player}
                      showActions={false}
                      className="cursor-pointer"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemovePlayer(player)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${getTeamColor()} border-2`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              placeholder={`Team ${teamId}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {players.length}/15 players
            </span>
            {validation.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Position Summary */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(validation.positionCounts).map(([position, count]) => (
            <div
              key={position}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(position as Position)}`}
            >
              {position}: {count}
            </div>
          ))}
        </div>

        {/* Validation Messages */}
        {validation.errors.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {validation.errors.map((error, index) => (
              <div key={index} className="text-red-600 text-sm flex items-center gap-1">
                <X className="w-3 h-3" />
                {error}
              </div>
            ))}
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            {validation.warnings.map((warning, index) => (
              <div key={index} className="text-yellow-600 text-sm flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {warning}
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="min-h-[400px] bg-muted rounded-lg p-4">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Users className="w-12 h-12 mb-2" />
              <p className="text-center">
                Add players here to build your team
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {players.map((player) => (
                <div key={player.id} className="relative group">
                  <PlayerCard
                    player={player}
                    showActions={false}
                    className="cursor-pointer"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemovePlayer(player)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
