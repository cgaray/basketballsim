
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const teamId = parseInt((await params).id);

        if (isNaN(teamId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid team ID' },
                { status: 400 }
            );
        }

        // Fetch all matches where this team participated
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { team1Id: teamId },
                    { team2Id: teamId },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate stats
        let wins = 0;
        let losses = 0;
        let totalPointsScored = 0;
        let totalPointsAllowed = 0;

        matches.forEach((match) => {
            const isTeam1 = match.team1Id === teamId;
            const myScore = isTeam1 ? match.team1Score : match.team2Score;
            const opponentScore = isTeam1 ? match.team2Score : match.team1Score;

            totalPointsScored += myScore;
            totalPointsAllowed += opponentScore;

            if (match.winnerId === teamId) {
                wins++;
            } else if (match.winnerId !== null) {
                losses++;
            }
        });

        const totalGames = wins + losses;
        const winPercentage = totalGames > 0 ? (wins / totalGames) * 100 : 0;
        const avgPointsScored = totalGames > 0 ? totalPointsScored / totalGames : 0;
        const avgPointsAllowed = totalGames > 0 ? totalPointsAllowed / totalGames : 0;

        return NextResponse.json({
            success: true,
            data: {
                teamId,
                totalGames,
                wins,
                losses,
                winPercentage,
                avgPointsScored,
                avgPointsAllowed,
                recentMatches: matches.slice(0, 5), // Return last 5 matches for history
            },
        });

    } catch (error) {
        console.error('Error fetching team stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch team stats' },
            { status: 500 }
        );
    }
}
