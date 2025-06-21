const fs = require("fs");
const path = require("path");

const migrationsDir = path.join(__dirname, "../migrations");

// Remove old migration files (0000-0005)
for (let i = 0; i <= 5; i++) {
  const file = path.join(migrationsDir, `000${i}_*.sql`);
  try {
    fs.unlinkSync(file);
    console.log(`Removed: ${file}`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Error removing ${file}:`, err);
    }
  }
}

// Remove old meta snapshots (0000-0005)
const metaDir = path.join(migrationsDir, "meta");
for (let i = 0; i <= 5; i++) {
  const snapshot = path.join(metaDir, `000${i}_snapshot.json`);
  try {
    fs.unlinkSync(snapshot);
    console.log(`Removed: ${snapshot}`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Error removing ${snapshot}:`, err);
    }
  }
}

console.log("Migration cleanup complete");
