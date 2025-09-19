import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const team1Id = searchParams.get('team1Id');
    const team2Id = searchParams.get('team2Id');
    const limit = searchParams.get('limit');

    const where: Record<string, unknown> = {};

    if (team1Id && team2Id) {
      where.OR = [
        { AND: [{ team1Id: parseInt(team1Id) }, { team2Id: parseInt(team2Id) }] },
        { AND: [{ team1Id: parseInt(team2Id) }, { team2Id: parseInt(team1Id) }] }
      ];
    } else if (team1Id) {
      where.OR = [
        { team1Id: parseInt(team1Id) },
        { team2Id: parseInt(team1Id) }
      ];
    } else if (team2Id) {
      where.OR = [
        { team1Id: parseInt(team2Id) },
        { team2Id: parseInt(team2Id) }
      ];
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { team1Id, team2Id, team1Score, team2Score, winnerId, playByPlay } = body;

    if (!team1Id || !team2Id || team1Score == null || team2Score == null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const match = await prisma.match.create({
      data: {
        team1Id,
        team2Id,
        team1Score,
        team2Score,
        winnerId,
        playByPlay: playByPlay || null
      }
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}