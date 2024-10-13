"use server";

import { auth } from "@/lib/auth";
import { UserConfig, userConfigSchema } from "./schema";
import { createClient } from "redis";

async function connectRedis() {
  const redis = createClient({ url: "redis://redis:6379" });

  while (!redis.isReady) {
    await new Promise((resolve) => setTimeout(() => resolve(true), 200));
  }

  return redis;
}

export async function saveUserConfigAction(
  user_id: string,
  values: UserConfig
) {
  const parse = userConfigSchema.safeParse(values);
  if (parse.success) {
    const redis = await connectRedis();

    const session = await auth();
    if (session) {
      redis.json.set(`user:${session.user.github_id}:config`, "$", parse.data);
    }
  }
}

export async function getUserConfigAction(): Promise<UserConfig | null> {
  const redis = await connectRedis();

  const session = await auth();
  if (session) {
    return (await redis.json.get(
      `user:${session.user.github_id}:config`
    )) as UserConfig;
  }
  return null;
}
