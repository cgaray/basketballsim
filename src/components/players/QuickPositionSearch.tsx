'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Check, Loader2 } from 'lucide-react';
import { Player } from '@/types';
import { analyzePlayerYears, getPlayerForYear } from '@/lib/utils/player-stats';
import { cn } from '@/lib/utils/cn';

interface QuickPositionSearchProps {
  teamId: 1 | 2;
  position?: string;
  currentRoster: Player[];
  onAddPlayer: (player: Player, teamId: 1 | 2) => void;
  onClose?: () => void;
}

const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

export function QuickPositionSearch({
  teamId,
  position: initialPosition,
  currentRoster,
  onAddPlayer,
  onClose
}: QuickPositionSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(initialPosition || '');
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerGroups, setPlayerGroups] = useState<Record<string, Player[]>>({});
  const [playerYears, setPlayerYears] = useState<Record<string, { selectedYear: number }>>({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<number>>(new Set());

  const currentRosterIds = currentRoster.map(p => p.id);
  const teamColor = teamId === 1 ? 'blue' : 'red';

  const searchPlayers = async () => {
    if (!selectedPosition && !searchTerm) return;

    setLoading(true);
    setShowResults(true);

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedPosition) params.append('position', selectedPosition);

      const response = await fetch(`/api/players?${params}`);
      const result = await response.json();

      if (result.success) {
        const availablePlayers = result.data.players.filter(
          (player: Player) => !currentRosterIds.includes(player.id)
        );
        setPlayers(availablePlayers);

        const groups: Record<string, Player[]> = {};
        availablePlayers.forEach((player: Player) => {
          if (!groups[player.name]) groups[player.name] = [];
          groups[player.name].push(player);
        });
        setPlayerGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedPosition || searchTerm) {
        searchPlayers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedPosition]);

  const handleAddPlayer = (player: Player) => {
    // Add visual feedback
    setRecentlyAdded(prev => new Set(prev).add(player.id));

    // Add the player
    onAddPlayer(player, teamId);

    // Remove from local list after short delay for feedback
    setTimeout(() => {
      setPlayers(players.filter(p => p.id !== player.id));
      setRecentlyAdded(prev => {
        const next = new Set(prev);
        next.delete(player.id);
        return next;
      });
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Position Filters - Compact */}
      <div className="flex gap-1.5 flex-wrap">
        <Button
          variant={selectedPosition === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPosition('')}
          className="h-8 text-xs"
        >
          All
        </Button>
        {POSITIONS.map(pos => {
          const count = currentRoster.filter(p => p.position === pos).length;
          const isCurrentPosition = pos === selectedPosition;

          return (
            <Button
              key={pos}
              variant={isCurrentPosition ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPosition(pos)}
              className={cn(
                'h-8 text-xs',
                count === 0 && !isCurrentPosition && 'border-dashed'
              )}
            >
              {pos}
              {count > 0 && (
                <span className="ml-1 text-xs opacity-70">({count})</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : players.length > 0 ? (
            Object.entries(playerGroups).map(([playerName, playerSeasons]) => {
              const yearAnalysis = analyzePlayerYears(playerSeasons);

              if (!playerYears[playerName]) {
                setPlayerYears(prev => ({
                  ...prev,
                  [playerName]: { selectedYear: yearAnalysis.bestYear },
                }));
              }

              const currentYearData = playerYears[playerName];
              const displayPlayer = currentYearData
                ? getPlayerForYear(playerSeasons, currentYearData.selectedYear) || playerSeasons[0]
                : playerSeasons[0];

              if (!displayPlayer) return null;

              const isAdded = recentlyAdded.has(displayPlayer.id);
              const hasMultipleSeasons = playerSeasons.length > 1;

              return (
                <div
                  key={`${playerName}-${displayPlayer.season}`}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg transition-all',
                    isAdded
                      ? teamId === 1
                        ? 'bg-blue-100 scale-95'
                        : 'bg-red-100 scale-95'
                      : 'bg-muted/50 hover:bg-muted'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {displayPlayer.position}
                      </Badge>
                      <span className="font-medium text-sm truncate">
                        {displayPlayer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground truncate">
                        {displayPlayer.team}
                      </span>
                      <span className="text-xs font-medium">
                        {displayPlayer.pointsPerGame?.toFixed(1)} PPG
                      </span>
                      {hasMultipleSeasons && (
                        <div className="flex gap-0.5">
                          {yearAnalysis.availableYears.slice(0, 3).map(year => (
                            <button
                              key={year}
                              className={cn(
                                'px-1.5 py-0.5 text-xs rounded transition-colors',
                                currentYearData?.selectedYear === year
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              )}
                              onClick={() => {
                                setPlayerYears(prev => ({
                                  ...prev,
                                  [playerName]: { selectedYear: year },
                                }));
                              }}
                            >
                              {year.toString().slice(-2)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddPlayer(displayPlayer)}
                    disabled={isAdded}
                    className={cn(
                      'ml-2 h-8 shrink-0 transition-all',
                      teamId === 1
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-red-500 hover:bg-red-600',
                      isAdded && 'bg-green-500'
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Added
                      </>
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                {selectedPosition || searchTerm
                  ? 'No players found'
                  : 'Select a position or search'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>
          {currentRoster.length} player{currentRoster.length !== 1 ? 's' : ''} on roster
        </span>
        {currentRoster.length >= 5 && (
          <span className={cn(
            'font-medium',
            teamId === 1 ? 'text-blue-600' : 'text-red-600'
          )}>
            Starting 5 complete
          </span>
        )}
      </div>
    </div>
  );
}
