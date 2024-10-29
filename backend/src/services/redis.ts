import { createClient } from "redis";

let redis: ReturnType<typeof createClient> | undefined;

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

  return redis;
}

export const getItemsByKeyPattern = async <T>(
  redis: ReturnType<typeof createClient>,
  pattern: string
) => {
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
};
