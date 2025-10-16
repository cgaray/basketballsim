'use client';

import React, { useState, useEffect } from 'react';
import { TeamRoster } from '@/components/team/TeamRoster';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PlayerCard } from '@/components/cards/PlayerCard';
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
  const [playerYears, setPlayerYears] = useState<Record<string, { selectedYear: number }>>({});

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

  const getPlayerTeamStatus = (playerId: number) => isPlayerInTeam(playerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-black text-orange-600 mb-2">Pick Your Players!</h1>
          <p className="text-xl text-gray-600">Type a name like "Max" or a position like "PG"</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="Try: Max, LeBron, center, point guard, PG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-16 text-2xl border-4 border-orange-300 focus:border-orange-500 rounded-xl shadow-lg"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏀</div>
            <p className="text-2xl text-gray-600">Finding players...</p>
          </div>
        )}

        {!loading && players.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷</div>
            <p className="text-2xl text-gray-600">No players found. Try a different name!</p>
          </div>
        )}

        {!loading && players.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(playerGroups).map(([playerName, playerSeasons]) => {
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
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
          <div className="space-y-4">
            <div className="bg-blue-500 text-white text-center py-4 rounded-xl shadow-lg">
              <h2 className="text-3xl font-black">⭐ TEAM 1 ⭐</h2>
            </div>
            <TeamRoster teamId={1} availablePlayers={players} />
          </div>

          <div className="space-y-4">
            <div className="bg-red-500 text-white text-center py-4 rounded-xl shadow-lg">
              <h2 className="text-3xl font-black">🔥 TEAM 2 🔥</h2>
            </div>
            <TeamRoster teamId={2} availablePlayers={players} />
          </div>
        </div>
      </main>
    </div>
  );
}
