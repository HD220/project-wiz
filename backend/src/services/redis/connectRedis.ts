import { createClient } from "redis";

let redis: ReturnType<typeof createClient>;

export async function connectRedis() {
  if (!redis) {
    redis = createClient({
      url: "redis://localhost:6379",
      socket: {
        connectTimeout: 10000,
      },
    });
    redis.on("ready", () => {
      console.log("Redis client connected and ready");
    });
    redis.on("error", (err) => {
      console.error("Redis error:", err);
    });

    // Mantém a conexão viva com ping periódico
    setInterval(() => {
      redis?.ping();
    }, 10000); // Pinga a cada 10 segundos
    await redis.connect();
  }

  async function getLastVersion(owner: string, repo: string) {
    const versions = (await redis.json.get(`version:${owner}:${repo}`, {
      path: "$",
    })) as {
      [commitHash: string]: {
        timestamp: number;
        status?: "analysing" | "analysed";
      };
    } | null;

    if (!versions) return null;

    const [lastestVersion] = Object.entries(versions)
      .filter(([, value]) => value.status === "analysed")
      .map(([hash, value]) => ({
        hash,
        timestamp: value.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .reverse();

    return lastestVersion.hash;
  }

  async function getItemsByKeyPattern<T>(pattern: string) {
    const data: T[] = [];
    let cursor = 0;

    do {
      const result = await redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 1000,
      });

      cursor = result.cursor;
      const keys = result.keys;

      for (const key of keys) {
        const response = await redis.json.get(key);
        data.push({ key, data: response } as T);
      }
    } while (cursor !== 0);

    return data;
  }

  return {
    getLastVersion,
    getItemsByKeyPattern,
  };
}
