import { llmModels } from "@/infrastructure/services/drizzle/schemas/llm-models";
import { llmProviders } from "@/infrastructure/services/drizzle/schemas/llm-providers";
import { tryCatch } from "@/shared/tryCatch";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export async function initializeDatabase(
  db: BetterSQLite3Database<Record<string, never>>
) {
  const providers = [
    {
      name: "DeepSeek",
      slug: "deepseek",
      modelsId: [
        { name: "DeepSeek R1", slug: "deepseek-reasoner" },
        { name: "DeepSeek V3", slug: "deepseek-chat" },
      ],
    },
    {
      name: "OpenAI",
      slug: "openai",
      modelsId: [
        { name: "Chat GPT 4.1", slug: "gpt-4.1" },
        { name: "Chat GPT 4.1 Mini", slug: "gpt-4.1-mini" },
        { name: "Chat GPT 4.1 Nano", slug: "gpt-4.1-nano" },
      ],
    },
    {
      name: "Anthropic",
      slug: "anthropic",
      modelsId: [
        { name: "Claude 3.7 Sonnet", slug: "claude-3.7-sonnet" },
        { name: "Claude 3.5 Haiku", slug: "claude-3.5-haiku" },
        { name: "Claude 3 Opus", slug: "claude-3-opus" },
      ],
    },
    {
      name: "Google Generative AI",
      slug: "google",
      modelsId: [{ name: "Gemini 1.5 PRO", slug: "gemini-1.5-pro" }],
    },
  ];

  providers.forEach(async (provider) => {
    const providerData = await tryCatch(
      db
        .insert(llmProviders)
        .values({
          name: provider.name,
          slug: provider.slug,
        })
        .onConflictDoNothing({ target: llmProviders.slug })
        .returning({ id: llmProviders.id })
    );
    // const [{ id: providerInsertedId }] = await ;
    if (providerData.error) {
      console.error(
        `[ERROR][DATABASE_SEED]: ${JSON.stringify(providerData.error)}`
      );
      return;
    }
    if (providerData.data.length >= 1) {
      const [{ id: providerInsertedId }] = providerData.data;

      provider.modelsId.forEach(async (model) => {
        const modelData = await tryCatch(
          db
            .insert(llmModels)
            .values({
              name: model.name,
              slug: model.slug,
              llmProviderId: providerInsertedId,
            })
            .onConflictDoNothing({ target: llmModels.slug })
        );
        if (modelData.error) {
          console.error(
            `[ERROR][DATABASE_SEED]: ${JSON.stringify(modelData.error)}`
          );
        }
      });
    }
  });
}
