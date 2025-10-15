/**
 * Add Max Garay - Special Player with AMAZING stats!
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMaxGaray() {
  console.log('🌟 Adding Max Garay - The GOAT!\n');

  try {
    // Create Max Garay with INCREDIBLE stats - better than everyone!
    const maxGaray = await prisma.player.create({
      data: {
        name: 'Max Garay',
        position: 'PG', // Point Guard
        team: 'Garay All-Stars',
        season: 2025,
        gamesPlayed: 82,
        pointsPerGame: 50.5,        // 🔥 More than Wilt!
        reboundsPerGame: 18.0,      // 🔥 Crazy rebounds for a PG!
        assistsPerGame: 15.5,       // 🔥 Amazing playmaker!
        stealsPerGame: 5.0,         // 🔥 Defensive beast!
        blocksPerGame: 3.5,         // 🔥 Unreal for a guard!
        fieldGoalPercentage: 0.650, // 🔥 65% shooting!
        threePointPercentage: 0.550,// 🔥 55% from three!
        freeThrowPercentage: 0.980, // 🔥 98% free throws!
      }
    });

    console.log('✅ Successfully added Max Garay!\n');
    console.log('📊 Max Garay Stats:');
    console.log(`   Position: ${maxGaray.position}`);
    console.log(`   Team: ${maxGaray.team}`);
    console.log(`   Season: ${maxGaray.season}`);
    console.log(`   Points Per Game: ${maxGaray.pointsPerGame} 🔥`);
    console.log(`   Rebounds Per Game: ${maxGaray.reboundsPerGame} 🔥`);
    console.log(`   Assists Per Game: ${maxGaray.assistsPerGame} 🔥`);
    console.log(`   Steals Per Game: ${maxGaray.stealsPerGame} 🔥`);
    console.log(`   Blocks Per Game: ${maxGaray.blocksPerGame} 🔥`);
    console.log(`   FG%: ${(maxGaray.fieldGoalPercentage! * 100).toFixed(1)}% 🔥`);
    console.log(`   3P%: ${(maxGaray.threePointPercentage! * 100).toFixed(1)}% 🔥`);
    console.log(`   FT%: ${(maxGaray.freeThrowPercentage! * 100).toFixed(1)}% 🔥`);
    console.log('\n🎯 Max Garay is now in the database!');
    console.log('   Search for "Max" to find him!\n');

  } catch (error) {
    console.error('❌ Error adding Max Garay:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMaxGaray();
