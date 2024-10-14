import { RepositoryConfig } from "@/components/forms/repository-config/schema";
import { connectRedis } from "@/lib/redis";
import { decrypt } from "./cypher.actions";

export async function getRepositoryConfigAction(
  owner: string,
  repository: string
): Promise<RepositoryConfig | null> {
  if (!repository) return null;
  const redis = await connectRedis();
  const [redisData] = (await redis.json.get(`user:${owner}:config`, {
    path: `$.allocations['${repository}']`,
  })) as unknown as RepositoryConfig[];

  if (!redisData) return null;

  const reponseData = {
    ...redisData,
    api_token: await decrypt(redisData.api_token),
  };

  return reponseData as RepositoryConfig;
}
