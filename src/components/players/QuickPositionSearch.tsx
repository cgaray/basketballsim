'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, AlertCircle, Users } from 'lucide-react';
import { Player } from '@/types';
import { analyzePlayerYears, getPlayerForYear } from '@/lib/utils/player-stats';

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

  // Get positions that need filling
  const getMissingPositions = () => {
    const positionCounts: Record<string, number> = {
      PG: 0, SG: 0, SF: 0, PF: 0, C: 0
    };

    currentRoster.forEach(player => {
      if (positionCounts[player.position] !== undefined) {
        positionCounts[player.position]++;
      }
    });

    return Object.entries(positionCounts)
      .filter(([_, count]) => count === 0)
      .map(([pos]) => pos);
  };

  const missingPositions = getMissingPositions();
  const currentRosterIds = currentRoster.map(p => p.id);

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
        // Filter out players already in any roster
        const availablePlayers = result.data.players.filter(
          (player: Player) => !currentRosterIds.includes(player.id)
        );
        setPlayers(availablePlayers);

        // Group players by name for deduplication
        const groups: Record<string, Player[]> = {};
        availablePlayers.forEach(player => {
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
    onAddPlayer(player, teamId);
    // Remove from local list
    setPlayers(players.filter(p => p.id !== player.id));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Quick Add Players - Team {teamId}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Missing Positions Alert */}
        {missingPositions.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Need players for: {missingPositions.join(', ')}
            </span>
          </div>
        )}

        {/* Position Quick Filters */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Position</label>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedPosition === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPosition('')}
            >
              All
            </Button>
            {POSITIONS.map(pos => {
              const isMissing = missingPositions.includes(pos);
              const count = currentRoster.filter(p => p.position === pos).length;

              return (
                <Button
                  key={pos}
                  variant={selectedPosition === pos ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPosition(pos)}
                  className={isMissing ? 'border-orange-500' : ''}
                >
                  {pos}
                  <Badge
                    variant={isMissing ? 'destructive' : 'secondary'}
                    className="ml-2 h-5 px-1"
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">Searching...</p>
            ) : players.length > 0 ? (
              Object.entries(playerGroups).map(([playerName, playerSeasons]) => {
                const yearAnalysis = analyzePlayerYears(playerSeasons);

                // Initialize year selection with best year if not already set
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

                const hasMultipleSeasons = playerSeasons.length > 1;

                return (
                  <div
                    key={`${playerName}-${displayPlayer.season}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{displayPlayer.name}</div>
                        {hasMultipleSeasons && (
                          <div className="flex gap-1">
                            {yearAnalysis.availableYears.map(year => (
                              <Button
                                key={year}
                                variant={currentYearData?.selectedYear === year ? 'default' : 'outline'}
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  setPlayerYears(prev => ({
                                    ...prev,
                                    [playerName]: { selectedYear: year },
                                  }));
                                }}
                              >
                                {year}
                                {year === yearAnalysis.bestYear && ' ⭐'}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {displayPlayer.position} • {displayPlayer.team} • {displayPlayer.pointsPerGame?.toFixed(1)} PPG
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddPlayer(displayPlayer)}
                    >
                      Add to Team {teamId}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {selectedPosition || searchTerm ? 'No players found' : 'Select a position or search'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Team {teamId}: {currentRoster.length}/15 players
          {missingPositions.length === 0 && (
            <span className="text-green-600 ml-2">✓ Complete lineup</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}