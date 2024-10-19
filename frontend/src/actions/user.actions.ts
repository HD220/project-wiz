"use server";

import {
  UserConfig,
  userConfigSchema,
} from "@/components/forms/user-config/schema";
import { connectRedis } from "@/lib/redis";
import { decrypt, encrypt } from "./cypher.actions";

export async function saveUserConfigAction(
  username: string,
  values: UserConfig
) {
  const parse = userConfigSchema.safeParse(values);

  if (parse.success) {
    const { allocations, ...data } = parse.data;
    const redis = await connectRedis();
    await redis.json.merge(`user:${username}`, "$", {
      ...data,
      api_token: await encrypt(data.api_token),
      allocations: allocations.reduce(
        (acc, cur) => ({ ...acc, [cur.id]: { budget: cur.budget } }),
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
  const redisData = await redis.json.get(`user:${username}`);
  if (!redisData) return null;

  const { allocations = [], ...data } = redisData as unknown as UserConfig;

  const reponseData = {
    ...data,
    api_token: data.api_token ? await decrypt(data.api_token) : "",
    allocations: Object.entries(allocations)
      .map(([id, { budget }]) => ({
        id,
        budget,
      }))
      .filter(({ budget }) => budget > 0),
  };

  return reponseData as UserConfig;
}
