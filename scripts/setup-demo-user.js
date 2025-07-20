#!/usr/bin/env node

/**
 * Setup script to create a demo user for testing the application
 *
 * This script creates a demo user with ID "demo-user-id" that the application
 * expects for testing purposes.
 *
 * Usage: node scripts/setup-demo-user.js
 */

const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

// Database file path (relative to project root)
const dbPath = path.resolve(__dirname, "../project-wiz.db");

// Demo user configuration
const DEMO_USER = {
  id: "demo-user-id",
  username: "demo",
  password: "demo123",
  name: "Demo User",
  theme: "system",
};

async function setupDemoUser() {
  console.log("🔧 Setting up demo user...");
  console.log(`📁 Database path: ${dbPath}`);

  const db = new Database(dbPath);

  // Enable foreign key constraints
  db.pragma("foreign_keys = ON");

  try {
    // Check if user already exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(DEMO_USER.id);
    if (existingUser) {
      console.log("✅ Demo user already exists!");
      console.log(`   Username: ${DEMO_USER.username}`);
      console.log(`   Password: ${DEMO_USER.password}`);
      console.log(`   User ID: ${DEMO_USER.id}`);
      return;
    }

    // Check if username already exists
    const existingUsername = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(DEMO_USER.username);
    if (existingUsername) {
      console.log(
        `❌ Username "${DEMO_USER.username}" already exists with different ID!`,
      );
      console.log(
        "   Please choose a different username or delete the existing user.",
      );
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

    // Create user
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, name, avatar, password_hash, created_at, updated_at, theme)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    const userResult = insertUser.run(
      DEMO_USER.id,
      DEMO_USER.username,
      DEMO_USER.name,
      null, // avatar
      passwordHash,
      now,
      now,
      DEMO_USER.theme,
    );

    if (userResult.changes > 0) {
      console.log("✅ Demo user created successfully!");
      console.log(`   Username: ${DEMO_USER.username}`);
      console.log(`   Password: ${DEMO_USER.password}`);
      console.log(`   User ID: ${DEMO_USER.id}`);
      console.log(`   Name: ${DEMO_USER.name}`);
      console.log(`   Theme: ${DEMO_USER.theme}`);
    } else {
      console.log("❌ Failed to create demo user");
    }
  } catch (error) {
    console.error("❌ Error setting up demo user:", error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Check if running directly (not imported)
if (require.main === module) {
  setupDemoUser().catch(console.error);
}

module.exports = { setupDemoUser, DEMO_USER };
