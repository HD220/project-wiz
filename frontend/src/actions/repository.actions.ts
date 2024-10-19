"use server";

import {
  RepositoryConfig,
  repositoryConfigSchema,
} from "@/components/forms/repository-config/schema";
import { connectRedis } from "@/lib/redis";
import { decrypt, encrypt } from "./cypher.actions";

export async function saveRepositoryConfigAction(
  id: number,
  owner: string,
  values: RepositoryConfig
) {
  const parse = repositoryConfigSchema.safeParse(values);

  if (parse.success) {
    const redis = await connectRedis();
    await redis.json.merge(`user:${owner}`, `$`, {
      repositories: {
        [id]: {
          ...parse.data,
          api_token: await encrypt(parse.data.api_token),
        },
      },
    });
  }
}

export async function getRepositoryConfigAction(
  owner: string,
  id: number
): Promise<RepositoryConfig | null> {
  const redis = await connectRedis();
  const redisData = await redis.json.get(`user:${owner}`, {
    path: `$.repositories['${id}']`,
  });
  const config = redisData as RepositoryConfig;

  if (!config) return null;

  const reponseData = {
    ...config,
    api_token: config.api_token ? await decrypt(config.api_token) : undefined,
  };

  return reponseData as RepositoryConfig;
}
