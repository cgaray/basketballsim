/**
 * Individual Team API Route
 * Handles operations on specific teams
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import type { APIResponse } from '@/types';

interface UpdateTeamRequest {
  name?: string;
  players?: number[];
}

interface TeamWithPlayers {
  id: number;
  name: string;
  players: any[];
  createdAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<TeamWithPlayers>>> {
  try {
    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid team ID',
          message: 'Team ID must be a number',
        },
        { status: 400 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team not found',
          message: 'Team does not exist',
        },
        { status: 404 }
      );
    }

    const playerIds = JSON.parse(team.players);

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
      },
    });

    const teamWithPlayers = {
      ...team,
      players,
    };

    return NextResponse.json({
      success: true,
      data: teamWithPlayers,
    });

  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch team',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<any>>> {
  try {
    const teamId = parseInt(params.id);
    const body: UpdateTeamRequest = await request.json();

    if (isNaN(teamId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid team ID',
          message: 'Team ID must be a number',
        },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.name) {
      updateData.name = body.name;
    }

    if (body.players) {
      // Validate players exist
      const playerCount = await prisma.player.count({
        where: { id: { in: body.players } },
      });

      if (playerCount !== body.players.length) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid players',
            message: 'Some players do not exist',
          },
          { status: 400 }
        );
      }

      updateData.players = JSON.stringify(body.players);
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
    });

    const teamWithParsedPlayers = {
      ...updatedTeam,
      players: JSON.parse(updatedTeam.players),
    };

    return NextResponse.json({
      success: true,
      data: teamWithParsedPlayers,
    });

  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update team',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<APIResponse<null>>> {
  try {
    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid team ID',
          message: 'Team ID must be a number',
        },
        { status: 400 }
      );
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({
      success: true,
      data: null,
    });

  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete team',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}