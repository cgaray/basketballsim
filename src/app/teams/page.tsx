'use client';

import React, { useState, useEffect } from 'react';
import { TeamRoster } from '@/components/team/TeamRoster';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { PlayerCardSkeleton } from '@/components/cards/PlayerCardSkeleton';
import { Player, PlayerSearchResult } from '@/types';
import { analyzePlayerYears, getPlayerForYear } from '@/lib/utils/player-stats';
import { useTeam } from '@/contexts/TeamContext';
import { Navbar } from '@/components/layout/Navbar';

interface SavedTeam {
  id: number;
  name: string;
  players: Player[];
  createdAt: string;
}

export default function TeamsPage() {
  const { addPlayer, removePlayer, isPlayerInTeam } = useTeam();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [playerGroups, setPlayerGroups] = useState<Record<string, Player[]>>({});
  const [playerYears, setPlayerYears] = useState<Record<string, { availableYears: number[]; bestYear: number; selectedYear: number }>>({});

  const fetchPlayers = async (searchTerm: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '24',
      });

      // Smart search: detect if searching by position
      const positionMap: Record<string, string> = {
        'pg': 'PG',
        'point guard': 'PG',
        'point': 'PG',
        'sg': 'SG',
        'shooting guard': 'SG',
        'shooting': 'SG',
        'guard': 'SG',
        'sf': 'SF',
        'small forward': 'SF',
        'small': 'SF',
        'forward': 'SF',
        'pf': 'PF',
        'power forward': 'PF',
        'power': 'PF',
        'c': 'C',
        'center': 'C',
      };

      const lowerSearch = searchTerm.toLowerCase().trim();
      const matchedPosition = positionMap[lowerSearch];

      if (matchedPosition) {
        // Searching by position
        params.append('position', matchedPosition);
      } else if (searchTerm) {
        // Searching by name
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/players?${params}`);
      const result = await response.json();

      if (!result.success) throw new Error(result.error || 'Failed to fetch players');

      const data: PlayerSearchResult = result.data;
      setPlayers(data.players);

      const groups: Record<string, Player[]> = {};
      data.players.forEach(player => {
        if (!groups[player.name]) groups[player.name] = [];
        groups[player.name].push(player);
      });
      setPlayerGroups(groups);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchPlayers(searchTerm), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Initialize player years when playerGroups changes
  useEffect(() => {
    const newPlayerYears: Record<string, { availableYears: number[]; bestYear: number; selectedYear: number }> = {};
    
    Object.entries(playerGroups).forEach(([playerName, playerSeasons]) => {
      if (!playerYears[playerName]) {
        const yearAnalysis = analyzePlayerYears(playerSeasons);
        newPlayerYears[playerName] = {
          availableYears: yearAnalysis.availableYears,
          bestYear: yearAnalysis.bestYear,
          selectedYear: yearAnalysis.availableYears[0] || playerSeasons[0]?.season || 2023,
        };
      }
    });

    if (Object.keys(newPlayerYears).length > 0) {
      setPlayerYears(prev => ({ ...prev, ...newPlayerYears }));
    }
  }, [playerGroups, playerYears]);

  const getPlayerTeamStatus = (playerId: number) => isPlayerInTeam(playerId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Build Your Teams</h1>
          <p className="text-muted-foreground">Search for players by name or position to build your rosters</p>
        </div>
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or position (e.g., LeBron, PG, center)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && players.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">No players found for "{searchTerm}"</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different name or position</p>
          </div>
        )}

        {!loading && players.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(playerGroups).map(([playerName, playerSeasons]) => {
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
                  onSelectTeam={(player, teamId) => addPlayer(player, teamId)}
                  onDeselect={(player) => {
                    const team = isPlayerInTeam(player.id);
                    if (team) removePlayer(player.id, team);
                  }}
                  seasonOptions={currentYearData?.availableYears || []}
                  selectedSeason={currentYearData?.selectedYear}
                  onSeasonChange={(year) => {
                    setPlayerYears(prev => ({
                      ...prev,
                      [playerName]: {
                        ...prev[playerName],
                        selectedYear: year,
                      },
                    }));
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          <div className="space-y-3">
            <div className="bg-blue-500 text-white text-center py-3 rounded-lg">
              <h2 className="text-xl font-bold">Team 1</h2>
            </div>
            <TeamRoster teamId={1} availablePlayers={players} />
          </div>

          <div className="space-y-3">
            <div className="bg-red-500 text-white text-center py-3 rounded-lg">
              <h2 className="text-xl font-bold">Team 2</h2>
            </div>
            <TeamRoster teamId={2} availablePlayers={players} />
          </div>
        </div>
      </main>
    </div>
  );
}
