/**
 * Players Page
 * Displays a searchable and filterable list of NBA players
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PlayerSearch } from '@/components/players/PlayerSearch';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Circle, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Player, PlayerSearchResult } from '@/types';
import { analyzePlayerYears, getPlayerForYear } from '@/lib/utils/player-stats';
import { useTeam } from '@/contexts/TeamContext';
import { Navbar } from '@/components/layout/Navbar';

export default function PlayersPage() {
  const { addPlayer, removePlayer, isPlayerInTeam } = useTeam();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [playerGroups, setPlayerGroups] = useState<Record<string, Player[]>>({});
  const [playerYears, setPlayerYears] = useState<Record<string, { availableYears: number[]; bestYear: number; selectedYear: number }>>({});

  const fetchPlayers = async (searchTerm: string = '', position: string = '', page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (position) params.append('position', position);

      const response = await fetch(`/api/players?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch players');
      }

      const data: PlayerSearchResult = result.data;
      setPlayers(data.players);
      setPagination(data.pagination);

      // Group players by name for year selection
      const groups: Record<string, Player[]> = {};
      data.players.forEach(player => {
        if (!groups[player.name]) {
          groups[player.name] = [];
        }
        groups[player.name].push(player);
      });
      setPlayerGroups(groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Auto-search when searchTerm or position changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlayers(searchTerm, selectedPosition, 1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedPosition]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPlayers(searchTerm, selectedPosition, 1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedPosition('');
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPlayers('', '', 1);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchPlayers(searchTerm, selectedPosition, newPage);
  };

  const handleYearChange = (playerName: string, year: number) => {
    setPlayerYears(prev => ({
      ...prev,
      [playerName]: {
        ...prev[playerName],
        selectedYear: year,
      },
    }));
  };

  const handlePlayerSelect = (player: Player, teamId: 1 | 2) => {
    addPlayer(player, teamId);
  };

  const handlePlayerDeselect = (player: Player) => {
    const playerTeam = isPlayerInTeam(player.id);
    if (playerTeam) {
      removePlayer(player.id, playerTeam);
    }
  };

  const getPlayerTeamStatus = (playerId: number) => {
    return isPlayerInTeam(playerId);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Circle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Players</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchPlayers()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">NBA Players Database</h2>
          {pagination.total > 0 && (
            <p className="text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} players
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <PlayerSearch
          searchTerm={searchTerm}
          position={selectedPosition}
          onSearchChange={setSearchTerm}
          onPositionChange={setSelectedPosition}
          onClear={handleClear}
        />

        {/* Players Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-basketball-orange mx-auto mb-4" />
              <p className="text-gray-600">Loading players...</p>
            </div>
          </div>
        ) : players.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <Button onClick={() => fetchPlayers()}>Show All Players</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Object.entries(playerGroups).map(([playerName, playerSeasons]) => {
                const yearAnalysis = analyzePlayerYears(playerSeasons);
                
                // Initialize player years data if not exists
                if (!playerYears[playerName]) {
                  setPlayerYears(prev => ({
                    ...prev,
                    [playerName]: {
                      availableYears: yearAnalysis.availableYears,
                      bestYear: yearAnalysis.bestYear,
                      selectedYear: yearAnalysis.availableYears[0] || playerSeasons[0]?.season || 2023,
                    },
                  }));
                }

                const currentYearData = playerYears[playerName];
                const displayPlayer = currentYearData 
                  ? getPlayerForYear(playerSeasons, currentYearData.selectedYear) || playerSeasons[0]
                  : playerSeasons[0];

                if (!displayPlayer) return null;

                const playerTeam = getPlayerTeamStatus(displayPlayer.id);

                return (
                  <PlayerCard
                    key={`${playerName}-${displayPlayer.season}`}
                    player={displayPlayer}
                    showActions={true}
                    isSelected={playerTeam !== null}
                    selectedTeam={playerTeam}
                    onSelectTeam={handlePlayerSelect}
                    onDeselect={handlePlayerDeselect}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, pagination.page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? 'basketball' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
