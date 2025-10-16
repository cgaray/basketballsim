/**
 * Team Management Page
 * Load, edit, and delete saved teams
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Users, Calendar, ArrowLeft } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import type { Player } from '@/types';

interface SavedTeam {
  id: number;
  name: string;
  players: Player[];
  createdAt: string;
}

export default function TeamManagePage() {
  const router = useRouter();
  const { loadTeam } = useTeam();
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch all saved teams
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/teams');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch teams');
      }

      setTeams(result.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId: number, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"? This can't be undone!`)) {
      return;
    }

    setDeletingId(teamId);

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete team');
      }

      // Remove from local state
      setTeams(teams.filter(t => t.id !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadTeam = async (team: SavedTeam, targetTeam: 1 | 2) => {
    await loadTeam({ name: team.name, players: team.players }, targetTeam);
    router.push('/teams');
  };

  const getPositionCounts = (players: Player[]): Record<string, number> => {
    const counts: Record<string, number> = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };
    players.forEach(player => {
      if (counts[player.position] !== undefined) {
        counts[player.position]++;
      }
    });
    return counts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/teams')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team Builder
          </Button>

          <h1 className="text-5xl font-black text-purple-600 mb-2">My Saved Teams</h1>
          <p className="text-xl text-gray-600">Load, edit, or delete your teams</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏀</div>
            <p className="text-2xl text-gray-600">Loading your teams...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">❌ {error}</p>
              <Button
                onClick={fetchTeams}
                className="mt-4 mx-auto block"
                variant="outline"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && teams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-2xl text-gray-600 mb-4">No saved teams yet!</p>
            <Button
              onClick={() => router.push('/teams')}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold"
            >
              Build Your First Team
            </Button>
          </div>
        )}

        {/* Teams Grid */}
        {!loading && !error && teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const positionCounts = getPositionCounts(team.players);
              const isDeleting = deletingId === team.id;

              return (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-xl font-bold truncate">{team.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        <Users className="w-3 h-3 mr-1" />
                        {team.players.length}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(team.createdAt).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Position Breakdown */}
                    <div>
                      <p className="text-sm font-medium mb-2">Positions:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(positionCounts).map(([pos, count]) => (
                          <Badge
                            key={pos}
                            variant={count === 0 ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {pos}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Player List */}
                    <div>
                      <p className="text-sm font-medium mb-2">Players:</p>
                      <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-1">
                        {team.players.map((player, idx) => (
                          <div key={idx}>
                            • {player.name} ({player.position})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium mb-2">Load into:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleLoadTeam(team, 1)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Team 1
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleLoadTeam(team, 2)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Team 2
                        </Button>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(team.id, team.name)}
                        disabled={isDeleting}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {isDeleting ? 'Deleting...' : 'Delete Team'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && !error && teams.length > 0 && (
          <div className="mt-8 text-center">
            <Card className="inline-block">
              <CardContent className="pt-6">
                <p className="text-lg">
                  <span className="font-bold text-purple-600">{teams.length}</span> saved team{teams.length !== 1 ? 's' : ''}
                  {' • '}
                  <span className="font-bold text-purple-600">
                    {teams.reduce((sum, t) => sum + t.players.length, 0)}
                  </span> total players
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
