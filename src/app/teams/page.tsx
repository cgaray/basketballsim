/**
 * Teams Page
 * Main page for building and managing basketball teams
 */

'use client';

import React from 'react';
import { TeamRoster } from '@/components/team/TeamRoster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Builder */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Build Your Team</h2>
              <p className="text-muted-foreground">
                Create your dream basketball team by selecting players from our database.
              </p>
            </div>

            <TeamRoster />
          </div>

          {/* Instructions & Tips */}
          <div className="space-y-6">
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
                        Click "Add to Team" on player cards to build your roster
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
                    Build a balanced team with players who complement each other's strengths and weaknesses.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}