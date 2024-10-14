"use server";

import { encrypt } from "@/actions/cypher.actions";
import { RepositoryConfig, repositoryConfigSchema } from "./schema";
import { connectRedis } from "@/lib/redis";

export async function saveRepositoryConfigAction(
  username: string,
  repository: string,
  values: RepositoryConfig
) {
  const parse = repositoryConfigSchema.safeParse(values);

  if (parse.success) {
    const redis = await connectRedis();
    await redis.json.merge(`user:${username}:config`, "$.allocations", {
      [repository]: {
        ...parse.data,
        api_token: await encrypt(parse.data.api_token),
      },
    });
  }
}
