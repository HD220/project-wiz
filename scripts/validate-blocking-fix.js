/**
 * Validation script to test conversation blocking fix
 *
 * This script validates that:
 * 1. Conversations only unblock when SPECIFIC PARTICIPANT agents become active
 * 2. Creating new agents doesn't unblock unrelated conversations
 * 3. Archiving functionality works correctly
 */

import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and } from "drizzle-orm";

// Import the necessary models and services
import { usersTable } from "../src/main/features/user/user.model.js";
import { agentsTable } from "../src/main/features/agent/agent.model.js";
import {
  conversationsTable,
  conversationParticipantsTable,
} from "../src/main/features/conversation/conversation.model.js";
import { ConversationService } from "../src/main/features/conversation/conversation.service.js";
import { AgentService } from "../src/main/features/agent/agent.service.js";

console.log("🔍 Starting Conversation Blocking Logic Validation");
console.log("=".repeat(60));

async function validateBlockingFix() {
  // Open database
  const sqlite = new Database("project-wiz.db");
  const db = drizzle(sqlite);

  try {
    console.log("📋 Test Scenario: Validate Conversation Blocking Fix");

    // 1. Create test users
    console.log("\n1️⃣ Creating test users...");
    const [humanUser] = await db
      .insert(usersTable)
      .values({
        name: "Test Human",
        type: "human",
      })
      .returning();

    const [agentUser1] = await db
      .insert(usersTable)
      .values({
        name: "Test Agent 1",
        type: "agent",
      })
      .returning();

    const [agentUser2] = await db
      .insert(usersTable)
      .values({
        name: "Test Agent 2",
        type: "agent",
      })
      .returning();

    console.log(
      `✅ Created users: ${humanUser.id}, ${agentUser1.id}, ${agentUser2.id}`,
    );

    // 2. Create test agents (both inactive initially)
    console.log("\n2️⃣ Creating test agents...");
    const [agent1] = await db
      .insert(agentsTable)
      .values({
        userId: agentUser1.id,
        ownerId: humanUser.id,
        name: "Agent 1",
        role: "assistant",
        backstory: "Test agent 1",
        goal: "Testing",
        systemPrompt: "You are a test agent",
        providerId: "test-provider-1",
        modelConfig: "{}",
        status: "inactive", // INACTIVE
      })
      .returning();

    const [agent2] = await db
      .insert(agentsTable)
      .values({
        userId: agentUser2.id,
        ownerId: humanUser.id,
        name: "Agent 2",
        role: "assistant",
        backstory: "Test agent 2",
        goal: "Testing",
        systemPrompt: "You are a test agent",
        providerId: "test-provider-2",
        modelConfig: "{}",
        status: "inactive", // INACTIVE
      })
      .returning();

    console.log(
      `✅ Created agents: ${agent1.id} (inactive), ${agent2.id} (inactive)`,
    );

    // 3. Create test conversation with Agent 1 as participant
    console.log("\n3️⃣ Creating test conversation...");
    const [conversation] = await db
      .insert(conversationsTable)
      .values({
        name: "Test Conversation",
        type: "dm",
      })
      .returning();

    // Add participants: human + agent1 (NOT agent2)
    await db.insert(conversationParticipantsTable).values([
      { conversationId: conversation.id, participantId: humanUser.id },
      { conversationId: conversation.id, participantId: agentUser1.id },
    ]);

    console.log(
      `✅ Created conversation ${conversation.id} with participants: ${humanUser.id}, ${agentUser1.id}`,
    );

    // 4. Test initial blocking state
    console.log("\n4️⃣ Testing initial blocking state...");
    const initialBlocking = await ConversationService.isConversationBlocked(
      conversation.id,
    );
    console.log(`Conversation blocked: ${initialBlocking.isBlocked}`);
    console.log(`Reason: ${initialBlocking.reason}`);
    console.log(`Active agents count: ${initialBlocking.activeAgentsCount}`);

    if (!initialBlocking.isBlocked) {
      console.log(
        "❌ FAILED: Conversation should be blocked when no participant agents are active",
      );
      return false;
    }
    console.log(
      "✅ PASSED: Conversation correctly blocked with no active participant agents",
    );

    // 5. Activate Agent 2 (NOT a participant) - should NOT unblock conversation
    console.log("\n5️⃣ Activating non-participant Agent 2...");
    await db
      .update(agentsTable)
      .set({ status: "active" })
      .where(eq(agentsTable.id, agent2.id));

    const blockingAfterAgent2 = await ConversationService.isConversationBlocked(
      conversation.id,
    );
    console.log(
      `Conversation blocked after activating Agent 2: ${blockingAfterAgent2.isBlocked}`,
    );
    console.log(
      `Active agents count: ${blockingAfterAgent2.activeAgentsCount}`,
    );

    if (!blockingAfterAgent2.isBlocked) {
      console.log(
        "❌ FAILED: Conversation should remain blocked when non-participant agent is activated",
      );
      return false;
    }
    console.log(
      "✅ PASSED: Conversation remains blocked when non-participant agent activated",
    );

    // 6. Activate Agent 1 (participant) - should unblock conversation
    console.log("\n6️⃣ Activating participant Agent 1...");
    await db
      .update(agentsTable)
      .set({ status: "active" })
      .where(eq(agentsTable.id, agent1.id));

    const blockingAfterAgent1 = await ConversationService.isConversationBlocked(
      conversation.id,
    );
    console.log(
      `Conversation blocked after activating Agent 1: ${blockingAfterAgent1.isBlocked}`,
    );
    console.log(
      `Active agents count: ${blockingAfterAgent1.activeAgentsCount}`,
    );

    if (blockingAfterAgent1.isBlocked) {
      console.log(
        "❌ FAILED: Conversation should be unblocked when participant agent is activated",
      );
      return false;
    }
    console.log(
      "✅ PASSED: Conversation correctly unblocked when participant agent activated",
    );

    // 7. Test archiving functionality
    console.log("\n7️⃣ Testing archiving functionality...");
    await ConversationService.archive(
      conversation.id,
      humanUser.id,
      "Test archiving",
    );

    const conversationsBeforeArchive =
      await ConversationService.getUserConversations(humanUser.id);
    const conversationsWithArchived =
      await ConversationService.getUserConversations(humanUser.id, {
        includeArchived: true,
      });

    console.log(
      `Conversations without archived: ${conversationsBeforeArchive.length}`,
    );
    console.log(
      `Conversations with archived: ${conversationsWithArchived.length}`,
    );

    if (conversationsBeforeArchive.length !== 0) {
      console.log(
        "❌ FAILED: Archived conversation should not appear in default listing",
      );
      return false;
    }

    if (conversationsWithArchived.length !== 1) {
      console.log(
        "❌ FAILED: Archived conversation should appear when includeArchived=true",
      );
      return false;
    }

    console.log("✅ PASSED: Archiving functionality works correctly");

    // 8. Test unarchiving
    console.log("\n8️⃣ Testing unarchiving functionality...");
    await ConversationService.unarchive(conversation.id);

    const conversationsAfterUnarchive =
      await ConversationService.getUserConversations(humanUser.id);

    if (conversationsAfterUnarchive.length !== 1) {
      console.log(
        "❌ FAILED: Unarchived conversation should appear in default listing",
      );
      return false;
    }

    console.log("✅ PASSED: Unarchiving functionality works correctly");

    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("=".repeat(60));
    console.log("✅ Conversation blocking logic is working correctly:");
    console.log(
      "   • Conversations only unblock when SPECIFIC participant agents become active",
    );
    console.log(
      "   • Non-participant agents don't affect conversation blocking",
    );
    console.log("   • Archiving and unarchiving work as expected");

    return true;
  } catch (error) {
    console.error("❌ VALIDATION FAILED:", error);
    return false;
  } finally {
    // Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    try {
      await db.delete(conversationParticipantsTable);
      await db.delete(conversationsTable);
      await db.delete(agentsTable);
      await db.delete(usersTable).where(eq(usersTable.name, "Test Human"));
      await db.delete(usersTable).where(eq(usersTable.name, "Test Agent 1"));
      await db.delete(usersTable).where(eq(usersTable.name, "Test Agent 2"));
      console.log("✅ Cleanup completed");
    } catch (cleanupError) {
      console.error("⚠️ Cleanup error (non-critical):", cleanupError.message);
    }

    sqlite.close();
  }
}

// Run validation
validateBlockingFix()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
