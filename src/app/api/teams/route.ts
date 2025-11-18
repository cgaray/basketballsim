/**
 * Teams API Route
 * Handles team creation, retrieval, and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import type { APIResponse, Player } from '@/types';

interface CreateTeamRequest {
  name: string;
  players: number[]; // Array of player IDs
}

interface Team {
  id: number;
  name: string;
  players: Player[];
  createdAt: Date;
}

export async function GET(request: NextRequest): Promise<NextResponse<APIResponse<Team[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || null;

    const teams = await prisma.team.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        players: true
      }
    });

    return NextResponse.json({
      success: true,
      data: teams as unknown as Team[], // Prisma types might need adjustment, casting for now
    });

  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch teams',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse<Team>>> {
  try {
    const body: CreateTeamRequest = await request.json();
    const { name, players } = body;

    if (!name || !Array.isArray(players)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message: 'Team name and players array are required',
        },
        { status: 400 }
      );
    }

    // Validate that players exist
    const playerCount = await prisma.player.count({
      where: { id: { in: players } },
    });

    if (playerCount !== players.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid players',
          message: 'Some players do not exist',
        },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name,
        userId: null, // For now, no user system
        players: {
          connect: players.map(id => ({ id }))
        }
      },
      include: {
        players: true
      }
    });

    return NextResponse.json({
      success: true,
      data: team as unknown as Team,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create team',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}