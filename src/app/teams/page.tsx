/**
 * Teams Page
 * Main page for building and managing basketball teams
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TeamRoster } from '@/components/team/TeamRoster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Trophy, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { PlayerSearch } from '@/components/players/PlayerSearch';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Player, PlayerSearchResult } from '@/types';
import { analyzePlayerYears, getPlayerForYear } from '@/lib/utils/player-stats';
import { useTeam } from '@/contexts/TeamContext';

export default function TeamsPage() {
  const { addPlayer, removePlayer, isPlayerInTeam } = useTeam();
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [playerGroups, setPlayerGroups] = useState<Record<string, Player[]>>({});
  const [playerYears, setPlayerYears] = useState<Record<string, { availableYears: number[]; bestYear: number; selectedYear: number }>>({});

  const fetchPlayers = async (searchTerm: string = '', position: string = '') => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: '1',
        limit: '12', // Smaller limit for embedded search
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

  // Auto-search when searchTerm or position changes
  useEffect(() => {
    if (showPlayerSearch && (searchTerm || selectedPosition)) {
      const timeoutId = setTimeout(() => {
        fetchPlayers(searchTerm, selectedPosition);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedPosition, showPlayerSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedPosition('');
    setPlayers([]);
    setPlayerGroups({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Team Builder
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/players" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse Players
              </Link>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Build Two Teams</h2>
            <p className="text-muted-foreground">
              Create and compare two basketball teams side by side.
            </p>
          </div>

          {/* Player Search Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Add Players to Teams
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlayerSearch(!showPlayerSearch)}
                  className="flex items-center gap-2"
                >
                  {showPlayerSearch ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Search
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Search Players
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showPlayerSearch && (
              <CardContent className="space-y-4">
                <PlayerSearch
                  searchTerm={searchTerm}
                  position={selectedPosition}
                  onSearchChange={setSearchTerm}
                  onPositionChange={setSelectedPosition}
                  onClear={handleClear}
                />

                {players.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                )}


                <div className="text-center">
                  <Link href="/players">
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Full Player Database
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Two Teams Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Team 1 */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">Team 1</h3>
              </div>
              <TeamRoster teamId={1} />
            </div>

            {/* Team 2 */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">Team 2</h3>
              </div>
              <TeamRoster teamId={2} />
            </div>
          </div>

          {/* Instructions Section */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  How to Build Your Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Browse Players</p>
                      <p className="text-sm text-muted-foreground">
                        Go to the Players page to search and filter through NBA players
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Add Players</p>
                      <p className="text-sm text-muted-foreground">
                        Click &quot;Add to Team&quot; on player cards to build your roster
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Complete Your Lineup</p>
                      <p className="text-sm text-muted-foreground">
                        Add at least one player from each position (PG, SG, SF, PF, C)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Save Your Team</p>
                      <p className="text-sm text-muted-foreground">
                        Name your team and save it for future use
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link href="/players">
                    <Button className="w-full">
                      <Search className="w-4 h-4 mr-2" />
                      Start Building Your Team
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Team Building Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Position Balance</h4>
                  <p className="text-sm text-muted-foreground">
                    A complete starting lineup needs one player from each position. You can add up to 15 players total.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Player Stats</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider points per game (PPG), rebounds per game (RPG), and assists per game (APG) when selecting players.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Team Chemistry</h4>
                  <p className="text-sm text-muted-foreground">
                    Build a balanced team with players who complement each other&apos;s strengths and weaknesses.
                  </p>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>

        {/* Floating Add Players Button */}
        {!showPlayerSearch && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setShowPlayerSearch(true)}
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Players
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}