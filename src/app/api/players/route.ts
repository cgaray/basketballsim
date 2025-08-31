/**
 * Players API Route
 * Handles GET requests for fetching and searching players
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import type { APIResponse, PlayerSearchResult, SearchFilters } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<APIResponse<PlayerSearchResult>>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const position = searchParams.get('position') || '';
    const team = searchParams.get('team') || '';
    const minPoints = searchParams.get('minPoints') ? parseFloat(searchParams.get('minPoints')!) : undefined;
    const maxPoints = searchParams.get('maxPoints') ? parseFloat(searchParams.get('maxPoints')!) : undefined;
    const minRebounds = searchParams.get('minRebounds') ? parseFloat(searchParams.get('minRebounds')!) : undefined;
    const maxRebounds = searchParams.get('maxRebounds') ? parseFloat(searchParams.get('maxRebounds')!) : undefined;
    const minAssists = searchParams.get('minAssists') ? parseFloat(searchParams.get('minAssists')!) : undefined;
    const maxAssists = searchParams.get('maxAssists') ? parseFloat(searchParams.get('maxAssists')!) : undefined;
    const season = searchParams.get('season') ? parseInt(searchParams.get('season')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'pointsPerGame';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }

    if (position) {
      where.position = {
        contains: position,
        mode: 'insensitive' as const,
      };
    }

    if (team) {
      where.team = {
        contains: team,
        mode: 'insensitive' as const,
      };
    }

    if (minPoints !== undefined) {
      where.pointsPerGame = {
        ...where.pointsPerGame,
        gte: minPoints,
      };
    }

    if (maxPoints !== undefined) {
      where.pointsPerGame = {
        ...where.pointsPerGame,
        lte: maxPoints,
      };
    }

    if (minRebounds !== undefined) {
      where.reboundsPerGame = {
        ...where.reboundsPerGame,
        gte: minRebounds,
      };
    }

    if (maxRebounds !== undefined) {
      where.reboundsPerGame = {
        ...where.reboundsPerGame,
        lte: maxRebounds,
      };
    }

    if (minAssists !== undefined) {
      where.assistsPerGame = {
        ...where.assistsPerGame,
        gte: minAssists,
      };
    }

    if (maxAssists !== undefined) {
      where.assistsPerGame = {
        ...where.assistsPerGame,
        lte: maxAssists,
      };
    }

    if (season) {
      where.season = season;
    }

    // Build order by clause
    const orderBy: any = {};
    if (sortBy && ['pointsPerGame', 'reboundsPerGame', 'assistsPerGame', 'name', 'team'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.pointsPerGame = 'desc';
    }

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
      players,
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
