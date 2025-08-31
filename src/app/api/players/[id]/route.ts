/**
 * Single Player API Route
 * Handles GET requests for fetching a specific player by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import type { APIResponse, Player } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<Player>>> {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid player ID',
        },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { id },
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
    });

    if (!player) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: player,
    });

  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch player',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
