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
  players: Player[]; // Will be full player objects after fetching
  createdAt: Date;
}

export async function GET(request: NextRequest): Promise<NextResponse<APIResponse<Team[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || null;

    const teams = await prisma.team.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
    });

    // Fetch full player details for each team
    const teamsWithFullPlayers = await Promise.all(
      teams.map(async (team) => {
        const playerIds = JSON.parse(team.players) as number[];

        // Get full player details
        const players = await prisma.player.findMany({
          where: { id: { in: playerIds } },
          select: {
            id: true,
            name: true,
            position: true,
            team: true,
            season: true,
            pointsPerGame: true,
            reboundsPerGame: true,
            assistsPerGame: true,
            stealsPerGame: true,
            blocksPerGame: true,
            fieldGoalPercentage: true,
            threePointPercentage: true,
            freeThrowPercentage: true,
          },
        });

        // Maintain the original order of playerIds
        const orderedPlayers = playerIds.map(id =>
          players.find(p => p.id === id)
        ).filter(Boolean);

        return {
          ...team,
          players: orderedPlayers,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: teamsWithFullPlayers,
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
        players: JSON.stringify(players),
        userId: null, // For now, no user system
      },
    });

    // Get full player details for the created team
    const fullPlayers = await prisma.player.findMany({
      where: { id: { in: players } },
      select: {
        id: true,
        name: true,
        position: true,
        team: true,
        season: true,
        pointsPerGame: true,
        reboundsPerGame: true,
        assistsPerGame: true,
        stealsPerGame: true,
        blocksPerGame: true,
        fieldGoalPercentage: true,
        threePointPercentage: true,
        freeThrowPercentage: true,
      },
    });

    // Maintain the original order of playerIds
    const orderedPlayers = players.map(id =>
      fullPlayers.find(p => p.id === id)
    ).filter(Boolean);

    const teamWithFullPlayers = {
      ...team,
      players: orderedPlayers,
    };

    return NextResponse.json({
      success: true,
      data: teamWithFullPlayers,
    });

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