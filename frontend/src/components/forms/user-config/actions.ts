"use server";

import { connectRedis } from "@/lib/redis";
import { UserConfig, userConfigSchema } from "./schema";
import { encrypt } from "@/actions/cypher.actions";

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
