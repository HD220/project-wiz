-- Manually Applied Custom Drizzle Migration for sqlite-vec vss_memory_items table
-- =================================================================================
--
-- INSTRUCTIONS FOR USER:
-- --------------------
-- This SQL defines a virtual table required for semantic search with sqlite-vec.
-- Drizzle Kit cannot automatically generate this. Please follow these steps:
--
-- 1. Ensure Drizzle Migrations for `memory_items` Table are Up-to-Date:
--    - Run `npm run db:generate` first. This will create a migration file in the
--      `migrations/` folder if there are any changes to the `memory_items` table
--      (e.g., ensuring the `embedding BLOB` column exists). Let this file be
--      named something like `migrations/XXXX_<name>.sql`.
--
-- 2. Generate a Custom Migration File with Drizzle Kit:
--    - In your terminal, run the following command:
--      `npx drizzle-kit generate --custom --name=create_vss_memory_items_table`
--      (Or `npm run db:generate --custom --name=create_vss_memory_items_table` if you have it as an npm script)
--    - This will create a new, empty SQL file in your `migrations/` folder,
--      named something like `migrations/YYYY_create_vss_memory_items_table.sql`
--      (where YYYY is the next sequential number after XXXX).
--
-- 3. Populate the Custom Migration File:
--    - Open the newly generated empty SQL file (`migrations/YYYY_create_vss_memory_items_table.sql`).
--    - Copy the `CREATE VIRTUAL TABLE` statement below (starting from that line)
--      and paste it into this file.
--
-- 4. Apply All Migrations:
--    - Run `npm run db:migrate`.
--    - This will apply both the Drizzle-generated schema migration(s) and this
--      custom SQL migration in the correct order.
--
-- 5. Verify:
--    - Check your SQLite database to ensure the `vss_memory_items` table exists.
--
-- =================================================================================

-- SQL Content for the custom migration file:

-- This migration depends on the 'memory_items' table and its 'embedding' BLOB column already existing.
-- It also depends on the 'sqlite-vec' extension being loaded by the application when it connects to the DB.

-- IMPORTANT: The dimension '1536' below MUST match the dimension count of your
-- chosen embedding model (e.g., OpenAI's text-embedding-3-small is 1536 dimensions).
-- If you change your embedding model, you will need to update this dimension
-- and likely re-create/re-populate this virtual table.
CREATE VIRTUAL TABLE IF NOT EXISTS vss_memory_items USING vss0(
    embedding(1536) -- Defines the vector column and its dimensionality for indexing
    -- Potentially add other columns to filter by if sqlite-vec vss0 supports it,
    -- or rely on JOINs with the main memory_items table for filtering by agentId, tags etc.
    -- For simplicity, just the embedding column for now.
);

-- NOTES on usage with vss0 (to be handled by DrizzleMemoryRepository):
-- 1. Data Synchronization: After a new MemoryItem is inserted into the 'memory_items' table
--    (and its embedding is generated and stored in the 'embedding' BLOB column),
--    the application layer (specifically DrizzleMemoryRepository) will need to insert its 'rowid'
--    and 'embedding' into this 'vss_memory_items' table.
--    Example DML (to be handled by the repository):
--    INSERT INTO vss_memory_items (rowid, embedding) VALUES (?, ?);
--
-- 2. Deletion: When a MemoryItem is deleted from 'memory_items', its corresponding entry
--    must also be deleted from 'vss_memory_items' using its rowid by the repository.
--
-- 3. Updates: If a MemoryItem's embedding changes, its entry in 'vss_memory_items'
--    needs to be updated (typically by delete then insert) by the repository.
