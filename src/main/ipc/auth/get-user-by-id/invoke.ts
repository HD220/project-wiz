import { getUserById } from "./model";
import { type GetUserByIdOutput } from "./model";

export default async function(userId: string): Promise<GetUserByIdOutput> {
  return getUserById(userId);
}

declare global {
  namespace WindowAPI {
    interface Auth {
      getUserById: (userId: string) => Promise<GetUserByIdOutput>
    }
  }
}