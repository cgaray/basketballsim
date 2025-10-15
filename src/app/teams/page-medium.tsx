/**
 * Teams Page - SIMPLIFIED VERSION
 * Just the essentials: search players, build teams, done!
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TeamRoster } from '@/components/team/TeamRoster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Player, PlayerSearchResult } from '@/types';
import { analyzePlayerYears, getPlayerForYear } from '@/lib/utils/player-stats';
import { useTeam } from '@/contexts/TeamContext';
import { Navbar } from '@/components/layout/Navbar';

export default function TeamsPage() {
  const { addPlayer, removePlayer, isPlayerInTeam } = useTeam();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [playerGroups, setPlayerGroups] = useState<Record<string, Player[]>>({});
  const [playerYears, setPlayerYears] = useState<Record<string, { selectedYear: number }>>({});

  const fetchPlayers = async (searchTerm: string = '') => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: '1',
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/players?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch players');
      }

      const data: PlayerSearchResult = result.data;
      setPlayers(data.players);

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
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
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

  // Auto-search when searchTerm changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlayers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load some players on mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Simple Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Build Your Teams</h1>
          <p className="text-muted-foreground">
            Search for players and add them to Team 1 or Team 2
          </p>
        </div>

        {/* Simple Player Search - Always Visible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Just a search box - that's it! */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by player name (e.g. LeBron, Jordan, Curry)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Player Cards */}
            {loading && (
              <div className="text-center py-8 text-muted-foreground">
                Loading players...
              </div>
            )}

            {!loading && players.length === 0 && searchTerm && (
              <div className="text-center py-8 text-muted-foreground">
                No players found. Try a different name.
              </div>
            )}

            {!loading && players.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(playerGroups).map(([playerName, playerSeasons]) => {
                  const yearAnalysis = analyzePlayerYears(playerSeasons);

                  // Use best year by default
                  if (!playerYears[playerName]) {
                    setPlayerYears(prev => ({
                      ...prev,
                      [playerName]: {
                        selectedYear: yearAnalysis.bestYear,
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
            )}
          </CardContent>
        </Card>

        {/* Two Teams Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">Team 1</h2>
            <TeamRoster teamId={1} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-center mb-4">Team 2</h2>
            <TeamRoster teamId={2} />
          </div>
        </div>
      </main>
    </div>
  );
}
