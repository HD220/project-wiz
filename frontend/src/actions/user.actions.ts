import { UserConfig } from "@/components/forms/user-config/schema";
import { connectRedis } from "@/lib/redis";
import { decrypt } from "./cypher.actions";

export async function getUserConfigAction(
  username?: string
): Promise<UserConfig | null> {
  if (!username) return null;
  const redis = await connectRedis();
  const redisData = await redis.json.get(`user:${username}:config`);
  if (!redisData) return null;

  const { allocations = {}, ...data } = redisData as unknown as Omit<
    UserConfig,
    "allocations"
  > & {
    allocations: Record<string, { budget: number }>;
  };

  const reponseData = {
    ...data,
    allocations: Object.entries(allocations).map(([key, { budget }]) => ({
      repository: key,
      budget,
    })),
    api_token: await decrypt(data.api_token),
  };

  return reponseData as UserConfig;
}
