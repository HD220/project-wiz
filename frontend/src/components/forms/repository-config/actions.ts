"use server";

import { decrypt, encrypt } from "@/actions/cypher.actions";
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

export async function getRepositoryConfigAction(
  repository?: string
): Promise<RepositoryConfig | null> {
  if (!repository) return null;
  const redis = await connectRedis();
  const redisData = (await redis.json.get(`repository:${repository}:config`, {
    path: `$.allocations.${repository}`,
  })) as unknown as RepositoryConfig;

  if (!redisData) return null;

  const reponseData = {
    ...redisData,
    api_token: await decrypt(redisData.api_token),
  };

  return reponseData as RepositoryConfig;
}
