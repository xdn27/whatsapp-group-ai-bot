-- CreateTable
CREATE TABLE "BotConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BotConfig_key_key" ON "BotConfig"("key");
