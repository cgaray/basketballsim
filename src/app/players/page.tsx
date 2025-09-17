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

export default function PlayersPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-basketball-gray via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-basketball-orange to-orange-600 rounded-lg flex items-center justify-center">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-basketball-dark">
                NBA Players Database
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {pagination.total > 0 && (
                <span>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} players
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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

                return (
                  <PlayerCard
                    key={`${playerName}-${displayPlayer.season}`}
                    player={displayPlayer}
                    showActions={false}
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
