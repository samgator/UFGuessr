-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "uploader" TEXT DEFAULT 'Anonymous',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Location" ("createdAt", "difficulty", "id", "imageUrl", "latitude", "longitude", "name") SELECT "createdAt", "difficulty", "id", "imageUrl", "latitude", "longitude", "name" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
