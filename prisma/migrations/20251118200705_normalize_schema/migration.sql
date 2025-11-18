/*
  Warnings:

  - You are about to drop the column `players` on the `teams` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "team1Id" INTEGER NOT NULL,
    "team2Id" INTEGER NOT NULL,
    "team1Score" INTEGER NOT NULL,
    "team2Score" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "playByPlay" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "matches_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_matches" ("createdAt", "id", "playByPlay", "team1Id", "team1Score", "team2Id", "team2Score", "winnerId") SELECT "createdAt", "id", "playByPlay", "team1Id", "team1Score", "team2Id", "team2Score", "winnerId" FROM "matches";
DROP TABLE "matches";
ALTER TABLE "new_matches" RENAME TO "matches";
CREATE TABLE "new_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "team" TEXT,
    "season" INTEGER,
    "gamesPlayed" INTEGER,
    "pointsPerGame" REAL,
    "reboundsPerGame" REAL,
    "assistsPerGame" REAL,
    "stealsPerGame" REAL,
    "blocksPerGame" REAL,
    "fieldGoalPercentage" REAL,
    "threePointPercentage" REAL,
    "freeThrowPercentage" REAL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" INTEGER,
    CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_players" ("assistsPerGame", "blocksPerGame", "createdAt", "fieldGoalPercentage", "freeThrowPercentage", "gamesPlayed", "id", "imageUrl", "name", "pointsPerGame", "position", "reboundsPerGame", "season", "stealsPerGame", "team", "threePointPercentage") SELECT "assistsPerGame", "blocksPerGame", "createdAt", "fieldGoalPercentage", "freeThrowPercentage", "gamesPlayed", "id", "imageUrl", "name", "pointsPerGame", "position", "reboundsPerGame", "season", "stealsPerGame", "team", "threePointPercentage" FROM "players";
DROP TABLE "players";
ALTER TABLE "new_players" RENAME TO "players";
CREATE TABLE "new_teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_teams" ("createdAt", "id", "name", "userId") SELECT "createdAt", "id", "name", "userId" FROM "teams";
DROP TABLE "teams";
ALTER TABLE "new_teams" RENAME TO "teams";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
