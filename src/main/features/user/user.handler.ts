import { AuthService } from "@/main/features/auth/auth.service";
import { UserService } from "@/main/features/user/user.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

export function setupUserHandlers(): void {
  /**
   * List available users for conversations (ownership-aware)
   * Returns my agents + other humans via UNION ALL
   */
  createIpcHandler("user:listAvailableUsers", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return UserService.listAvailableUsers(currentUser.id);
  });
}
