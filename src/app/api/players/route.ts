/**
 * Players API Route
 * Handles GET requests for fetching and searching players
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import type { APIResponse, PlayerSearchResult, Player } from '@/types';

type PrismaPlayer = {
  id: number;
  name: string;
  position: string;
  team: string | null;
  season: number | null;
  gamesPlayed: number | null;
  pointsPerGame: number | null;
  reboundsPerGame: number | null;
  assistsPerGame: number | null;
  stealsPerGame: number | null;
  blocksPerGame: number | null;
  fieldGoalPercentage: number | null;
  threePointPercentage: number | null;
  freeThrowPercentage: number | null;
  imageUrl: string | null;
  createdAt: Date;
};

// Helper function to convert null values to undefined for optional fields
function normalizePlayer(player: PrismaPlayer): Player {
  return {
    ...player,
    team: player.team ?? undefined,
    season: player.season ?? undefined,
    gamesPlayed: player.gamesPlayed ?? undefined,
    pointsPerGame: player.pointsPerGame ?? undefined,
    reboundsPerGame: player.reboundsPerGame ?? undefined,
    assistsPerGame: player.assistsPerGame ?? undefined,
    stealsPerGame: player.stealsPerGame ?? undefined,
    blocksPerGame: player.blocksPerGame ?? undefined,
    fieldGoalPercentage: player.fieldGoalPercentage ?? undefined,
    threePointPercentage: player.threePointPercentage ?? undefined,
    freeThrowPercentage: player.freeThrowPercentage ?? undefined,
    imageUrl: player.imageUrl ?? undefined,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<APIResponse<PlayerSearchResult>>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse simplified query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const position = searchParams.get('position') || '';

    // Build simplified where clause
    const where: Record<string, any> = {};

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (position) {
      where.position = {
        contains: position,
      };
    }

    // Simple ordering by points per game
    const orderBy = { pointsPerGame: 'desc' as const };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          position: true,
          team: true,
          season: true,
          gamesPlayed: true,
          pointsPerGame: true,
          reboundsPerGame: true,
          assistsPerGame: true,
          stealsPerGame: true,
          blocksPerGame: true,
          fieldGoalPercentage: true,
          threePointPercentage: true,
          freeThrowPercentage: true,
          imageUrl: true,
          createdAt: true,
        },
      }),
      prisma.player.count({ where }),
    ]);

    const result: PlayerSearchResult = {
      players: players.map(normalizePlayer),
      pagination: {
        page,
        limit,
        total,
      },
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch players',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
