/**
 * Simple CSV Import - No DuckDB needed!
 * Imports real NBA player data from CSV files
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PlayerStats {
  name: string;
  position: string;
  team: string;
  season: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

// Simple CSV parser
function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
}

// Determine position from Players.csv flags
function getPosition(row: Record<string, string>): string {
  if (row.guard === 'True') return 'PG'; // Default guards to PG
  if (row.forward === 'True') return 'SF'; // Default forwards to SF
  if (row.center === 'True') return 'C';
  return 'SG'; // Default fallback
}

async function importPlayers() {
  console.log('🏀 Starting simple NBA data import...\n');

  const dataPath = path.join(process.cwd(), 'data');

  try {
    // Step 1: Read Players.csv to get player info
    console.log('📂 Reading Players.csv...');
    const playersData = parseCSV(path.join(dataPath, 'Players.csv'));
    console.log(`   Found ${playersData.length} players\n`);

    // Create player lookup by personId
    const playerLookup = new Map();
    playersData.forEach(p => {
      playerLookup.set(p.personId, {
        name: `${p.firstName} ${p.lastName}`,
        position: getPosition(p),
      });
    });

    // Step 2: Read PlayerStatistics.csv and aggregate by player/season
    console.log('📊 Reading PlayerStatistics.csv (this may take a moment)...');
    const statsData = parseCSV(path.join(dataPath, 'PlayerStatistics.csv'));
    console.log(`   Found ${statsData.length} game records\n`);

    // Aggregate stats by player/season
    console.log('🔢 Aggregating stats by player and season...');
    const seasonStats = new Map<string, PlayerStats>();

    statsData.forEach(game => {
      const personId = game.personId;
      const playerInfo = playerLookup.get(personId);
      if (!playerInfo) return;

      const gameDate = new Date(game.gameDate);
      const season = gameDate.getFullYear();
      const team = game.playerteamName || 'Free Agent';

      const key = `${personId}-${season}`;

      if (!seasonStats.has(key)) {
        seasonStats.set(key, {
          name: playerInfo.name,
          position: playerInfo.position,
          team: team,
          season: season,
          gamesPlayed: 0,
          pointsPerGame: 0,
          reboundsPerGame: 0,
          assistsPerGame: 0,
          stealsPerGame: 0,
          blocksPerGame: 0,
          fieldGoalPercentage: 0,
          threePointPercentage: 0,
          freeThrowPercentage: 0,
        });
      }

      const stats = seasonStats.get(key)!;
      stats.gamesPlayed++;

      // Accumulate stats (we'll average them later)
      stats.pointsPerGame += parseFloat(game.points || 0);
      stats.reboundsPerGame += parseFloat(game.reboundsTotal || 0);
      stats.assistsPerGame += parseFloat(game.assists || 0);
      stats.stealsPerGame += parseFloat(game.steals || 0);
      stats.blocksPerGame += parseFloat(game.blocks || 0);

      // For percentages, we'll track makes/attempts
      const fgAttempts = parseFloat(game.fieldGoalsAttempted || 0);
      const fgMade = parseFloat(game.fieldGoalsMade || 0);
      const tpAttempts = parseFloat(game.threePointersAttempted || 0);
      const tpMade = parseFloat(game.threePointersMade || 0);
      const ftAttempts = parseFloat(game.freeThrowsAttempted || 0);
      const ftMade = parseFloat(game.freeThrowsMade || 0);

      stats.fieldGoalPercentage += fgAttempts > 0 ? (fgMade / fgAttempts) : 0;
      stats.threePointPercentage += tpAttempts > 0 ? (tpMade / tpAttempts) : 0;
      stats.freeThrowPercentage += ftAttempts > 0 ? (ftMade / ftAttempts) : 0;
    });

    // Calculate averages
    seasonStats.forEach(stats => {
      const games = stats.gamesPlayed;
      stats.pointsPerGame /= games;
      stats.reboundsPerGame /= games;
      stats.assistsPerGame /= games;
      stats.stealsPerGame /= games;
      stats.blocksPerGame /= games;
      stats.fieldGoalPercentage /= games;
      stats.threePointPercentage /= games;
      stats.freeThrowPercentage /= games;
    });

    console.log(`   Aggregated ${seasonStats.size} player-seasons\n`);

    // Step 3: Clear existing data and import to database
    console.log('🗑️  Clearing existing player data...');
    await prisma.player.deleteMany({});

    console.log('💾 Importing to database...');
    let imported = 0;

    for (const stats of seasonStats.values()) {
      // Only import players with at least 10 games played
      if (stats.gamesPlayed >= 10) {
        await prisma.player.create({
          data: {
            name: stats.name,
            position: stats.position,
            team: stats.team,
            season: stats.season,
            gamesPlayed: stats.gamesPlayed,
            pointsPerGame: stats.pointsPerGame,
            reboundsPerGame: stats.reboundsPerGame,
            assistsPerGame: stats.assistsPerGame,
            stealsPerGame: stats.stealsPerGame,
            blocksPerGame: stats.blocksPerGame,
            fieldGoalPercentage: stats.fieldGoalPercentage,
            threePointPercentage: stats.threePointPercentage,
            freeThrowPercentage: stats.freeThrowPercentage,
          }
        });
        imported++;

        if (imported % 100 === 0) {
          process.stdout.write(`\r   Imported ${imported} player-seasons...`);
        }
      }
    }

    console.log(`\n\n✅ Successfully imported ${imported} player-seasons!`);

    // Show some sample data
    console.log('\n📋 Sample imported players:');
    const samples = await prisma.player.findMany({
      take: 10,
      orderBy: { pointsPerGame: 'desc' }
    });

    samples.forEach(p => {
      console.log(`   ${p.name} (${p.position}) - ${p.team} - ${p.season} - ${p.pointsPerGame.toFixed(1)} PPG`);
    });

    // Show count by season
    console.log('\n📊 Players by season:');
    const seasons = await prisma.player.groupBy({
      by: ['season'],
      _count: true,
      orderBy: { season: 'desc' }
    });

    seasons.forEach(s => {
      console.log(`   ${s.season}: ${s._count} players`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importPlayers();
