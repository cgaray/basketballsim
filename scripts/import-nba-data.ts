/**
 * Import Real NBA Data using DuckDB + SQLite Hybrid Approach
 *
 * Uses DuckDB for fast CSV processing and aggregation,
 * then exports to SQLite via Prisma for the web app.
 */

import { PrismaClient } from '@prisma/client';
import * as duckdb from 'duckdb';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeasonStats {
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

async function importNBAData() {
  console.log('🏀 Starting NBA data import with DuckDB...\n');

  const db = new duckdb.Database(':memory:');
  const conn = db.connect();

  try {
    // Load CSV files into DuckDB
    console.log('📂 Loading CSV files into DuckDB...');

    const dataPath = path.join(process.cwd(), 'data');

    // Load Players biographical data
    await new Promise((resolve, reject) => {
      conn.run(`
        CREATE TABLE players AS
        SELECT * FROM read_csv_auto('${dataPath}/Players.csv')
      `, (err) => err ? reject(err) : resolve(null));
    });

    // Load PlayerStatistics (game-by-game data)
    // Note: Using explicit column types and quote handling for data quality issues
    console.log('📊 Loading PlayerStatistics.csv (this may take a moment)...');
    await new Promise((resolve, reject) => {
      conn.run(`
        CREATE TABLE player_stats AS
        SELECT * FROM read_csv('${dataPath}/PlayerStatistics.csv',
          delim = ',',
          header = true,
          quote = '"',
          escape = '"',
          columns = {
            'firstName': 'VARCHAR',
            'lastName': 'VARCHAR',
            'personId': 'VARCHAR',  -- Some rows have non-numeric IDs
            'gameId': 'VARCHAR',
            'gameDate': 'VARCHAR',
            'playerteamCity': 'VARCHAR',
            'playerteamName': 'VARCHAR',
            'opponentteamCity': 'VARCHAR',
            'opponentteamName': 'VARCHAR',
            'gameType': 'VARCHAR',
            'gameLabel': 'VARCHAR',
            'gameSubLabel': 'VARCHAR',
            'seriesGameNumber': 'DOUBLE',
            'win': 'INTEGER',
            'home': 'INTEGER',
            'numMinutes': 'VARCHAR',
            'points': 'DOUBLE',
            'assists': 'DOUBLE',
            'blocks': 'DOUBLE',
            'steals': 'DOUBLE',
            'fieldGoalsAttempted': 'DOUBLE',
            'fieldGoalsMade': 'DOUBLE',
            'fieldGoalsPercentage': 'DOUBLE',
            'threePointersAttempted': 'DOUBLE',
            'threePointersMade': 'DOUBLE',
            'threePointersPercentage': 'DOUBLE',
            'freeThrowsAttempted': 'DOUBLE',
            'freeThrowsMade': 'DOUBLE',
            'freeThrowsPercentage': 'DOUBLE',
            'reboundsDefensive': 'DOUBLE',
            'reboundsOffensive': 'DOUBLE',
            'reboundsTotal': 'DOUBLE',
            'foulsPersonal': 'DOUBLE',
            'turnovers': 'DOUBLE',
            'plusMinusPoints': 'DOUBLE'
          }
        )
      `, (err) => err ? reject(err) : resolve(null));
    });

    // Check data loaded
    await new Promise((resolve, reject) => {
      conn.all(`SELECT COUNT(*) as count FROM player_stats`, (err, result) => {
        if (err) reject(err);
        else {
          console.log(`✅ Loaded ${result[0].count.toLocaleString()} game records\n`);
          resolve(null);
        }
      });
    });

    // Aggregate player stats by season using DuckDB's powerful SQL
    console.log('🔄 Aggregating player statistics by season...');

    const aggregateQuery = `
      WITH player_positions AS (
        SELECT
          personId,
          firstName,
          lastName,
          CASE
            WHEN center = true THEN 'C'
            WHEN forward = true AND guard = true THEN 'SF'
            WHEN forward = true THEN 'PF'
            WHEN guard = true AND height <= 74 THEN 'PG'
            WHEN guard = true THEN 'SG'
            ELSE 'SF'
          END as position
        FROM players
      ),
      season_stats AS (
        SELECT
          ps.personId,
          ps.firstName,
          ps.lastName,
          ps.playerteamName as team,
          -- Extract season from game date (Oct-June season)
          CASE
            WHEN MONTH(CAST(ps.gameDate AS DATE)) >= 10
            THEN YEAR(CAST(ps.gameDate AS DATE)) + 1
            ELSE YEAR(CAST(ps.gameDate AS DATE))
          END as season,
          COUNT(*) as games_played,
          AVG(ps.points) as ppg,
          AVG(ps.reboundsTotal) as rpg,
          AVG(ps.assists) as apg,
          AVG(ps.steals) as spg,
          AVG(ps.blocks) as bpg,
          SUM(ps.fieldGoalsMade) as total_fgm,
          SUM(ps.fieldGoalsAttempted) as total_fga,
          SUM(ps.threePointersMade) as total_3pm,
          SUM(ps.threePointersAttempted) as total_3pa,
          SUM(ps.freeThrowsMade) as total_ftm,
          SUM(ps.freeThrowsAttempted) as total_fta
        FROM player_stats ps
        WHERE
          ps.gameDate IS NOT NULL
          AND ps.numMinutes IS NOT NULL
          AND ps.numMinutes != '0:00'
          AND CAST(ps.gameDate AS DATE) <= CURRENT_DATE
        GROUP BY
          ps.personId,
          ps.firstName,
          ps.lastName,
          ps.playerteamName,
          season
        HAVING
          COUNT(*) >= 20  -- At least 20 games
          AND AVG(ps.points) >= 10.0  -- At least 10 PPG
      )
      SELECT
        ss.firstName || ' ' || ss.lastName as name,
        COALESCE(pp.position, 'SF') as position,
        ss.team,
        ss.season,
        ss.games_played as gamesPlayed,
        ROUND(ss.ppg, 1) as pointsPerGame,
        ROUND(ss.rpg, 1) as reboundsPerGame,
        ROUND(ss.apg, 1) as assistsPerGame,
        ROUND(ss.spg, 1) as stealsPerGame,
        ROUND(ss.bpg, 1) as blocksPerGame,
        ROUND(CASE
          WHEN ss.total_fga > 0 THEN ss.total_fgm::FLOAT / ss.total_fga
          ELSE 0
        END, 3) as fieldGoalPercentage,
        ROUND(CASE
          WHEN ss.total_3pa > 0 THEN ss.total_3pm::FLOAT / ss.total_3pa
          ELSE 0
        END, 3) as threePointPercentage,
        ROUND(CASE
          WHEN ss.total_fta > 0 THEN ss.total_ftm::FLOAT / ss.total_fta
          ELSE 0
        END, 3) as freeThrowPercentage
      FROM season_stats ss
      LEFT JOIN player_positions pp ON ss.personId = pp.personId
      WHERE
        ss.season >= 2018  -- Recent seasons only
        AND ss.season <= 2024
      ORDER BY
        ss.ppg DESC
      LIMIT 1000  -- Top 1000 player-seasons
    `;

    const playerSeasons: SeasonStats[] = await new Promise((resolve, reject) => {
      conn.all(aggregateQuery, (err, results) => {
        if (err) reject(err);
        else resolve(results as SeasonStats[]);
      });
    });

    console.log(`✅ Aggregated ${playerSeasons.length} player-seasons\n`);

    // Show sample data
    console.log('📋 Top 10 scoring seasons:');
    playerSeasons.slice(0, 10).forEach((player, i) => {
      console.log(
        `   ${(i + 1).toString().padStart(2)}. ${player.name.padEnd(25)} ` +
        `(${player.team} ${player.season}): ${player.pointsPerGame} PPG`
      );
    });

    // Get unique players count
    const uniquePlayers = new Set(playerSeasons.map(p => p.name));
    console.log(`\n📈 Statistics:`);
    console.log(`   - ${playerSeasons.length} total player-seasons`);
    console.log(`   - ${uniquePlayers.size} unique players`);
    console.log(`   - Seasons: 2018-2024\n`);

    // Clear existing data in SQLite
    console.log('🗑️  Clearing existing player data...');
    await prisma.player.deleteMany();

    // Import to SQLite via Prisma
    console.log('💾 Importing to SQLite database...');

    const batchSize = 100;
    for (let i = 0; i < playerSeasons.length; i += batchSize) {
      const batch = playerSeasons.slice(i, i + batchSize);

      await prisma.player.createMany({
        data: batch.map(p => ({
          name: p.name,
          position: p.position,
          team: p.team,
          season: Number(p.season),  // Convert BigInt to Number
          gamesPlayed: Number(p.gamesPlayed),  // Convert BigInt to Number
          pointsPerGame: p.pointsPerGame,
          reboundsPerGame: p.reboundsPerGame,
          assistsPerGame: p.assistsPerGame,
          stealsPerGame: p.stealsPerGame,
          blocksPerGame: p.blocksPerGame,
          fieldGoalPercentage: p.fieldGoalPercentage,
          threePointPercentage: p.threePointPercentage,
          freeThrowPercentage: p.freeThrowPercentage,
          imageUrl: null,
        })),
      });

      if ((i + batchSize) % 200 === 0) {
        console.log(`   Imported ${Math.min(i + batchSize, playerSeasons.length)} / ${playerSeasons.length} records...`);
      }
    }

    console.log(`\n✅ Successfully imported ${playerSeasons.length} player-seasons!`);

    // Verify import and show some interesting stats
    const topScorers2024 = await prisma.player.findMany({
      where: { season: 2024 },
      orderBy: { pointsPerGame: 'desc' },
      take: 5,
    });

    console.log('\n🏆 Top scorers from 2024 season:');
    topScorers2024.forEach((player, i) => {
      console.log(
        `   ${(i + 1)}. ${player.name.padEnd(25)} ` +
        `(${player.position}): ${player.pointsPerGame} PPG, ` +
        `${player.reboundsPerGame} RPG, ${player.assistsPerGame} APG`
      );
    });

    // Show position distribution
    const positionCounts = await prisma.player.groupBy({
      by: ['position'],
      _count: { position: true },
    });

    console.log('\n📊 Position distribution:');
    positionCounts.forEach(p => {
      console.log(`   ${p.position}: ${p._count.position} player-seasons`);
    });

  } catch (error) {
    console.error('❌ Error importing NBA data:', error);
    throw error;
  } finally {
    conn.close();
    db.close();
    await prisma.$disconnect();
  }
}

// Run the import
console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║   NBA Data Import - DuckDB + SQLite Hybrid  ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

importNBAData()
  .then(() => {
    console.log('\n✨ NBA data import completed successfully!');
    console.log('🚀 Run "npm run dev" to see the real player data in your app.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });