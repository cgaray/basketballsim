/**
 * Team Builder Page
 * Main page for building basketball teams with drag and drop functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { TeamRoster } from '@/components/teams/TeamRoster';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamBuilder } from '@/hooks/useTeamBuilder';
import { Player, SearchFilters } from '@/types';
import { 
  Circle, 
  Users, 
  ArrowRight, 
  RefreshCw, 
  Save, 
  Play,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TeamBuilderPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const {
    team1,
    team2,
    availablePlayers,
    addPlayerToTeam,
    removePlayerFromTeam,
    movePlayerBetweenTeams,
    setTeamName,
    setAvailablePlayers,
    getTeamValidation,
    canAddPlayerToTeam,
    clearTeam,
  } = useTeamBuilder();

  // Fetch players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...filters,
      });

      const response = await fetch(`/api/players?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch players');
      }

      setPlayers(result.data.players);
      setAvailablePlayers(result.data.players);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) {
      return;
    }

    const playerId = parseInt(draggableId.replace('player-', ''));
    const player = [...team1.players, ...team2.players, ...availablePlayers].find(p => p.id === playerId);

    if (!player) {
      return;
    }

    // Moving from available players to a team
    if (source.droppableId === 'available-players') {
      if (destination.droppableId === 'team-1') {
        addPlayerToTeam(player, 1);
      } else if (destination.droppableId === 'team-2') {
        addPlayerToTeam(player, 2);
      }
    }
    // Moving from one team to another
    else if (source.droppableId.startsWith('team-') && destination.droppableId.startsWith('team-')) {
      const fromTeam = parseInt(source.droppableId.replace('team-', '')) as 1 | 2;
      const toTeam = parseInt(destination.droppableId.replace('team-', '')) as 1 | 2;
      movePlayerBetweenTeams(player, fromTeam, toTeam);
    }
    // Moving from team back to available players
    else if (source.droppableId.startsWith('team-') && destination.droppableId === 'available-players') {
      const fromTeam = parseInt(source.droppableId.replace('team-', '')) as 1 | 2;
      removePlayerFromTeam(player, fromTeam);
    }
  };

  const filteredAvailablePlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const team1Validation = getTeamValidation(1);
  const team2Validation = getTeamValidation(2);

  const canStartMatch = team1Validation.isValid && team2Validation.isValid;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Circle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Players</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPlayers}>Try Again</Button>
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
                Team Builder
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  clearTeam(1);
                  clearTeam(2);
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Clear All
              </Button>
              <Button
                variant="basketball"
                disabled={!canStartMatch}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Match
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Players */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Players
                  </CardTitle>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-basketball-orange" />
                    </div>
                  ) : (
                    <Droppable droppableId="available-players">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 max-h-[600px] overflow-y-auto transition-colors ${
                            snapshot.isDraggingOver ? 'bg-orange-50' : ''
                          }`}
                        >
                          {filteredAvailablePlayers.map((player, index) => (
                            <Draggable
                              key={player.id}
                              draggableId={`player-${player.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                                >
                                  <PlayerCard
                                    player={player}
                                    showActions={false}
                                    className="cursor-move hover:shadow-md transition-shadow"
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {filteredAvailablePlayers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="w-12 h-12 mx-auto mb-2" />
                              <p>No players available</p>
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Teams */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team 1 */}
              <TeamRoster
                teamId={1}
                teamName={team1.name}
                players={team1.players}
                onRemovePlayer={(player) => removePlayerFromTeam(player, 1)}
                onTeamNameChange={(name) => setTeamName(1, name)}
                validation={team1Validation}
              />

              {/* Team 2 */}
              <TeamRoster
                teamId={2}
                teamName={team2.name}
                players={team2.players}
                onRemovePlayer={(player) => removePlayerFromTeam(player, 2)}
                onTeamNameChange={(name) => setTeamName(2, name)}
                validation={team2Validation}
              />
            </div>
          </div>
        </DragDropContext>

        {/* Match Status */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-basketball-orange to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Match Status</h3>
                  <p className="opacity-90">
                    {canStartMatch 
                      ? 'Both teams are ready! You can start the match.'
                      : 'Complete both teams to start the match.'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{team1.players.length}</div>
                    <div className="text-sm opacity-90">Team 1 Players</div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                  <div className="text-center">
                    <div className="text-2xl font-bold">{team2.players.length}</div>
                    <div className="text-sm opacity-90">Team 2 Players</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
