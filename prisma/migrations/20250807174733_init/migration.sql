/*
  Warnings:

  - You are about to drop the column `key` on the `BotConfig` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `BotConfig` table. All the data in the column will be lost.
  - Added the required column `alternativeIds` to the `BotConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `botNumber` to the `BotConfig` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BotConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "botNumber" TEXT NOT NULL,
    "alternativeIds" TEXT NOT NULL
);
INSERT INTO "new_BotConfig" ("id") SELECT "id" FROM "BotConfig";
DROP TABLE "BotConfig";
ALTER TABLE "new_BotConfig" RENAME TO "BotConfig";
CREATE UNIQUE INDEX "BotConfig_botNumber_key" ON "BotConfig"("botNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
