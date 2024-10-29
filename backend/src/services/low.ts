import { JSONFilePreset } from "lowdb/node";

type Data = {
  messages: string[];
};

export async function getLowDb() {
  const defaultData: Data = { messages: [] };
  return await JSONFilePreset<Data>("db.json", defaultData);
}
