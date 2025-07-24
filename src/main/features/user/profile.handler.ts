import { AuthService } from "@/main/features/auth/auth.service";
import type { Theme } from "@/main/features/user/profile.model";
import { ProfileService } from "@/main/features/user/profile.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

export function setupProfileHandlers(): void {
  // Get theme (use session instead of userId parameter)
  createIpcHandler("profile:getTheme", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return ProfileService.getTheme(currentUser.id);
  });

  // Update theme (use session instead of userId parameter)
  createIpcHandler("profile:updateTheme", async (theme: Theme) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    await ProfileService.updateTheme(currentUser.id, theme);
    return { theme };
  });
}
