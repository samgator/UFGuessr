/*
  Warnings:

  - You are about to alter the column `imageUrl` on the `Location` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "imageUrl" BLOB NOT NULL,
    "difficulty" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "uploader" TEXT DEFAULT 'Anonymous',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Location" ("approved", "createdAt", "difficulty", "id", "imageUrl", "latitude", "longitude", "name", "uploader") SELECT "approved", "createdAt", "difficulty", "id", "imageUrl", "latitude", "longitude", "name", "uploader" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
