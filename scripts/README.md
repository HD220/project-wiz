# Database Setup Scripts

This directory contains utility scripts for setting up and managing the database.

## Available Scripts

### setup-demo-user.js

Creates a demo user for testing the application.

**Usage:**

```bash
# Via npm script (recommended)
npm run db:setup-demo

# Or directly
node scripts/setup-demo-user.js
```

**Demo User Credentials:**

- Username: `demo`
- Password: `demo123`
- User ID: `demo-user-id`

This user is created with the hardcoded ID `demo-user-id` that the application expects for testing purposes.

## Database Management

The main database commands are available via npm scripts:

```bash
# Run database migrations
npm run db:migrate

# Generate new migrations
npm run db:generate

# Open database studio
npm run db:studio

# Setup demo user
npm run db:setup-demo
```

## Database Schema

The application uses SQLite with Drizzle ORM. The database file is located at `./project-wiz.db` in the project root.

Current schema includes:

- `users` - User accounts with authentication data
- `accounts` - Separate authentication table (newer schema)
- `projects` - Project containers
- `llm_providers` - LLM provider configurations
- `agents` - AI agent definitions

**Note:** The application is currently in transition between two schema versions. The demo user is created using the current database schema.
