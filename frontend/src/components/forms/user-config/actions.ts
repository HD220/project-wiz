"use server";

import { connectRedis } from "@/lib/redis";
import { UserConfig, userConfigSchema } from "./schema";
import { decrypt, encrypt } from "@/actions/cypher.actions";

export async function saveUserConfigAction(
  username: string,
  values: UserConfig
) {
  const parse = userConfigSchema.safeParse(values);

  if (parse.success) {
    const redis = await connectRedis();
    await redis.json.set(`user:${username}:config`, "$", {
      ...parse.data,
      api_token: await encrypt(parse.data.api_token),
      allocations: parse.data.allocations.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.repository]: { budget: curr.budget },
        }),
        {}
      ),
    });
  }
}

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
