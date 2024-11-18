import { ChromaClient } from "chromadb";

export const createChroma = () => {
  const client = new ChromaClient({
    auth: {
      provider: "basic",
      credentials: "admin:admin",
    },
  });
  client.heartbeat();
  return client;
};
