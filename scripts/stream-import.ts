/**
 * Streaming CSV Import - Memory efficient!
 * Processes CSV line by line to avoid memory issues
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface PlayerStats {
  name: string;
  position: string;
  team: string;
  season: number;
  gamesPlayed: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalFGAttempts: number;
  totalFGMade: number;
  total3PAttempts: number;
  total3PMade: number;
  totalFTAttempts: number;
  totalFTMade: number;
}

async function importPlayers(limit?: number) {
  console.log('🏀 Starting NBA data import (streaming mode)...\n');
  if (limit) {
    console.log(`📊 Limiting import to ${limit} player-seasons\n`);
  }

  const dataPath = path.join(process.cwd(), 'data');

  try {
    // Step 1: Load player info (small file, can load all at once)
    console.log('📂 Loading player info...');
    const playerLookup = new Map<string, { name: string; position: string }>();

    const playersFile = readline.createInterface({
      input: fs.createReadStream(path.join(dataPath, 'Players.csv')),
      crlfDelay: Infinity
    });

    let headers: string[] = [];
    let playerCount = 0;

    for await (const line of playersFile) {
      if (playerCount === 0) {
        headers = line.split(',');
        playerCount++;
        continue;
      }

      const values = line.split(',');
      const personId = values[0];
      const firstName = values[1];
      const lastName = values[2];
      const guard = values[8];    // Column 8: guard
      const forward = values[9];  // Column 9: forward
      const center = values[10];  // Column 10: center

      // Better position logic - distribute evenly across 5 positions
      let position = 'SG'; // default
      if (center === 'True') {
        position = 'C';
      } else if (guard === 'True' && forward === 'True') {
        // Combo guard/forward - use hash to distribute between SG and SF
        position = parseInt(personId) % 2 === 0 ? 'SG' : 'SF';
      } else if (guard === 'True') {
        // Pure guard - distribute between PG and SG
        position = parseInt(personId) % 2 === 0 ? 'PG' : 'SG';
      } else if (forward === 'True') {
        // Pure forward - distribute between SF and PF
        position = parseInt(personId) % 2 === 0 ? 'SF' : 'PF';
      }

      playerLookup.set(personId, {
        name: `${firstName} ${lastName}`,
        position
      });
      playerCount++;
    }

    console.log(`   Loaded ${playerCount - 1} players\n`);

    // Step 2: Stream PlayerStatistics and aggregate
    console.log('📊 Streaming player statistics (this will take a minute)...');
    const seasonStats = new Map<string, PlayerStats>();

    const statsFile = readline.createInterface({
      input: fs.createReadStream(path.join(dataPath, 'PlayerStatistics.csv')),
      crlfDelay: Infinity
    });

    let statsHeaders: string[] = [];
    let gameCount = 0;

    for await (const line of statsFile) {
      if (gameCount === 0) {
        statsHeaders = line.split(',');
        gameCount++;
        continue;
      }

      const values = line.split(',');
      const row: any = {};
      statsHeaders.forEach((header, i) => {
        row[header] = values[i];
      });

      const personId = row.personId;
      const playerInfo = playerLookup.get(personId);
      if (!playerInfo) continue;

      const gameDate = new Date(row.gameDate);
      const season = gameDate.getFullYear();
      const team = row.playerteamName || 'Free Agent';

      const key = `${personId}-${season}`;

      if (!seasonStats.has(key)) {
        seasonStats.set(key, {
          name: playerInfo.name,
          position: playerInfo.position,
          team: team,
          season: season,
          gamesPlayed: 0,
          totalPoints: 0,
          totalRebounds: 0,
          totalAssists: 0,
          totalSteals: 0,
          totalBlocks: 0,
          totalFGAttempts: 0,
          totalFGMade: 0,
          total3PAttempts: 0,
          total3PMade: 0,
          totalFTAttempts: 0,
          totalFTMade: 0,
        });
      }

      const stats = seasonStats.get(key)!;
      stats.gamesPlayed++;
      stats.totalPoints += parseFloat(row.points || 0);
      stats.totalRebounds += parseFloat(row.reboundsTotal || 0);
      stats.totalAssists += parseFloat(row.assists || 0);
      stats.totalSteals += parseFloat(row.steals || 0);
      stats.totalBlocks += parseFloat(row.blocks || 0);
      stats.totalFGAttempts += parseFloat(row.fieldGoalsAttempted || 0);
      stats.totalFGMade += parseFloat(row.fieldGoalsMade || 0);
      stats.total3PAttempts += parseFloat(row.threePointersAttempted || 0);
      stats.total3PMade += parseFloat(row.threePointersMade || 0);
      stats.totalFTAttempts += parseFloat(row.freeThrowsAttempted || 0);
      stats.totalFTMade += parseFloat(row.freeThrowsMade || 0);

      gameCount++;
      if (gameCount % 100000 === 0) {
        process.stdout.write(`\r   Processed ${gameCount.toLocaleString()} games...`);
      }
    }

    console.log(`\n   Aggregated ${seasonStats.size} player-seasons\n`);

    // Step 3: Clear and import to database
    console.log('🗑️  Clearing old data...');
    await prisma.player.deleteMany({});

    console.log('💾 Importing to database...');
    let imported = 0;
    const batch = [];

    for (const stats of seasonStats.values()) {
      // Only import players with at least 10 games
      if (stats.gamesPlayed < 10) continue;

      // Apply limit if specified
      if (limit && imported >= limit) break;

      const games = stats.gamesPlayed;

      batch.push({
        name: stats.name,
        position: stats.position,
        team: stats.team,
        season: stats.season,
        gamesPlayed: games,
        pointsPerGame: stats.totalPoints / games,
        reboundsPerGame: stats.totalRebounds / games,
        assistsPerGame: stats.totalAssists / games,
        stealsPerGame: stats.totalSteals / games,
        blocksPerGame: stats.totalBlocks / games,
        fieldGoalPercentage: stats.totalFGAttempts > 0 ? stats.totalFGMade / stats.totalFGAttempts : 0.45,
        threePointPercentage: stats.total3PAttempts > 0 ? stats.total3PMade / stats.total3PAttempts : 0.35,
        freeThrowPercentage: stats.totalFTAttempts > 0 ? stats.totalFTMade / stats.totalFTAttempts : 0.75,
      });

      // Import in batches of 100
      if (batch.length >= 100) {
        await prisma.player.createMany({ data: batch });
        imported += batch.length;
        process.stdout.write(`\r   Imported ${imported} player-seasons...`);
        batch.length = 0;
      }
    }

    // Import remaining
    if (batch.length > 0) {
      await prisma.player.createMany({ data: batch });
      imported += batch.length;
    }

    // Add custom players: Max Garay (great stats) and Holly Hughes (bad stats)
    console.log('\n🏆 Adding custom players...');
    
    const customPlayers = [
      // Max Garay - GREAT stats
      {
        name: 'Max Garay',
        position: 'PG',
        team: 'Custom Team',
        season: 2025,
        gamesPlayed: 82,
        pointsPerGame: 35.0,
        reboundsPerGame: 8.5,
        assistsPerGame: 12.0,
        stealsPerGame: 2.5,
        blocksPerGame: 1.2,
        fieldGoalPercentage: 0.65,
        threePointPercentage: 0.48,
        freeThrowPercentage: 0.95,
      },
      // Holly Hughes - BAD stats
      {
        name: 'Holly Hughes',
        position: 'C',
        team: 'Custom Team',
        season: 2025,
        gamesPlayed: 82,
        pointsPerGame: 2.1,
        reboundsPerGame: 1.8,
        assistsPerGame: 0.5,
        stealsPerGame: 0.2,
        blocksPerGame: 0.1,
        fieldGoalPercentage: 0.28,
        threePointPercentage: 0.15,
        freeThrowPercentage: 0.45,
      }
    ];

    await prisma.player.createMany({ data: customPlayers });
    imported += customPlayers.length;

    console.log(`\n\n✅ Successfully imported ${imported} player-seasons!\n`);

    // Show samples
    console.log('📋 Top scorers:');
    const topScorers = await prisma.player.findMany({
      take: 10,
      orderBy: { pointsPerGame: 'desc' }
    });

    topScorers.forEach(p => {
      console.log(`   ${p.name} (${p.position}) - ${p.team} - ${p.season} - ${p.pointsPerGame.toFixed(1)} PPG`);
    });

    console.log('\n📊 Distribution by season:');
    const byYear = await prisma.player.groupBy({
      by: ['season'],
      _count: true,
      orderBy: { season: 'desc' }
    });

    byYear.forEach(y => {
      console.log(`   ${y.season}: ${y._count} players`);
    });

    const total = await prisma.player.count();
    console.log(`\n🎯 Total: ${total} player-seasons in database\n`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const limit = args[0] ? parseInt(args[0]) : undefined;

if (limit && (isNaN(limit) || limit <= 0)) {
  console.error('❌ Invalid limit. Please provide a positive number.');
  process.exit(1);
}

importPlayers(limit);
