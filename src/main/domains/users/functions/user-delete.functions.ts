import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { users } from "../../../persistence/schemas";

export async function deleteUser(id: string): Promise<void> {
  const db = getDatabase();
  await db.delete(users).where(eq(users.id, id));
}
