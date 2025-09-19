'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Trophy, Trash2, Eye, Upload, Swords } from 'lucide-react';
import Link from 'next/link';

interface Player {
  id: number;
  name: string;
  position: string;
  team?: string;
  season?: number;
  pointsPerGame?: number;
  reboundsPerGame?: number;
  assistsPerGame?: number;
}

interface SavedTeam {
  id: number;
  name: string;
  players: Player[];
  createdAt: string;
}

interface SavedTeamsListProps {
  onLoadTeam?: (team: SavedTeam, targetTeam: 1 | 2) => void;
}

export function SavedTeamsList({ onLoadTeam }: SavedTeamsListProps) {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  useEffect(() => {
    fetchSavedTeams();
  }, []);

  const fetchSavedTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');

      const result = await response.json();
      if (result.success && result.data) {
        setTeams(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch teams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: number) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete team');

      setTeams(teams.filter(t => t.id !== teamId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    }
  };

  const getPositionCounts = (players: Player[]) => {
    const counts: Record<string, number> = {
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0,
    };

    players.forEach(player => {
      if (counts[player.position] !== undefined) {
        counts[player.position]++;
      }
    });

    return counts;
  };

  const isCompleteRoster = (players: Player[]) => {
    const counts = getPositionCounts(players);
    return Object.values(counts).every(count => count > 0);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading saved teams...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No saved teams yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Build a team and save it to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map(team => {
        const positionCounts = getPositionCounts(team.players);
        const isComplete = isCompleteRoster(team.players);
        const isExpanded = expandedTeam === team.id;

        return (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {team.name}
                  {isComplete && <Trophy className="w-5 h-5 text-yellow-500" />}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {team.players.length} players
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Position Summary */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.entries(positionCounts).map(([pos, count]) => (
                  <Badge
                    key={pos}
                    variant={count > 0 ? "default" : "outline"}
                    className="justify-center py-1"
                  >
                    {pos}: {count}
                  </Badge>
                ))}
              </div>

              {/* Expanded Player List */}
              {isExpanded && (
                <div className="space-y-2 mb-4 border-t pt-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">Roster:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {team.players.map(player => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                      >
                        <div>
                          <span className="font-medium">{player.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {player.position} • {player.pointsPerGame?.toFixed(1) || 0} PPG
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onLoadTeam && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadTeam(team, 1)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Load to Team 1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadTeam(team, 2)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Load to Team 2
                    </Button>
                  </>
                )}
                <Link href={`/matches?team1=${team.id}`}>
                  <Button variant="outline" size="sm">
                    <Swords className="w-4 h-4 mr-2" />
                    Simulate
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTeam(team.id)}
                  className="ml-auto hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}