-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL
);
