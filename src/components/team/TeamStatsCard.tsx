
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TeamStats {
    totalGames: number;
    wins: number;
    losses: number;
    winPercentage: number;
    avgPointsScored: number;
    avgPointsAllowed: number;
}

interface TeamStatsCardProps {
    stats: TeamStats;
    isLoading?: boolean;
}

export function TeamStatsCard({ stats, isLoading = false }: TeamStatsCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-8 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (stats.totalGames === 0) {
        return (
            <Card className="bg-muted/20">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No games played yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Team Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-2xl font-bold">
                            {stats.wins} - {stats.losses}
                        </div>
                        <p className="text-xs text-muted-foreground">Win/Loss Record</p>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${stats.winPercentage >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                            {stats.winPercentage.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Win Percentage</p>
                    </div>
                    <div>
                        <div className="text-lg font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            {stats.avgPointsScored.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">PPG Scored</p>
                    </div>
                    <div>
                        <div className="text-lg font-semibold flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-red-500" />
                            {stats.avgPointsAllowed.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">PPG Allowed</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
