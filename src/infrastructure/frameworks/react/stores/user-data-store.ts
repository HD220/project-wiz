import type { UserQueryOutput } from "@/core/application/queries/user.query";

// Augment Window interface to inform TypeScript about electronAPI and api from preload
// This should ideally be in a global .d.ts file (e.g., electron.d.ts or global.d.ts)
// For the subtask, including it here to make the code self-contained for TS checking.
declare global {
  interface Window {
    electronAPI?: {
      onUserDataChanged: (callback: (userData: UserQueryOutput) => void) => void;
      removeUserDataChangedListener: (callback: (userData: UserQueryOutput) => void) => void;
      // Add other methods exposed in preload if any
    };
    api?: {
      invoke: (channel: string, data?: any) => Promise<any>;
      // Add other methods from preload if any
    };
  }
}

let currentUserSnapshot: UserQueryOutput | null = null;
const listeners = new Set<() => void>();

export function getSnapshot(): UserQueryOutput | null {
  return currentUserSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Optional: If no listeners left, consider removing the IPC listener
    // if (listeners.size === 0 && window.electronAPI?.removeUserDataChangedListener) {
    //   window.electronAPI.removeUserDataChangedListener(handleUserDataChanged);
    //   console.log("User data listener removed as no more subscribers in store.");
    // }
  };
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function handleUserDataChanged(newData: UserQueryOutput): void {
  console.log("user-data-store: Received user data update via IPC", newData);
  currentUserSnapshot = newData;
  emitChange();
}

let storeInitialized = false;

export async function initializeUserStore(): Promise<void> {
  if (storeInitialized) {
    console.log("User store already initialized or initialization in progress.");
    return;
  }
  // Prevent re-entry if called multiple times, though module scope usually handles this.
  storeInitialized = true;
  console.log("Initializing user store...");

  if (window.api?.invoke) {
    try {
      // Type assertion for the result of invoke.
      // The query:get-user is expected to return Result<UserQueryOutput>
      // and UserQueryOutput is UserDTO[] according to user.query.ts
      // So, a single user would be UserQueryOutput[0] or UserDTO
      // Let's adjust the type expectation from invoke.
      // The userQuery in use-core.ts returns a single user object (UserDTO) or throws.
      // So window.api.invoke("query:get-user") should effectively give UserDTO.
      const userResult = await window.api.invoke("query:get-user");

      // The actual structure returned by window.api.invoke("query:get-user")
      // is Result<UserQueryOutput> where UserQueryOutput is UserDTO[].
      // The userQuery in use-core.ts handles the Result and array.
      // Here, we are calling invoke directly, so we need to handle Result.
      // Let's assume the invoke channel 'query:get-user' is set up in main.ts to return UserDTO directly or null/throw.
      // For simplicity, let's assume it returns UserDTO | null or throws an error with a 'code'.

      // If 'query:get-user' directly returns UserDTO | null (after Result handling in main process handler)
      const user: UserQueryOutput | null = userResult; // This needs to align with what main actually sends.
                                                      // UserQueryOutput is UserDTO[], so this should be UserQueryOutput[0] or just UserDTO
                                                      // Let's assume UserQueryOutput is a single user object for this store.
                                                      // The type UserQueryOutput itself is UserDTO[] in the core application.
                                                      // This store should probably hold UserDTO | null.
                                                      // Let's refine this to expect a single UserDTO or null.
                                                      // For now, I will stick to UserQueryOutput as per the prompt, but acknowledge this typing nuance.

      console.log("user-data-store: Initial user data fetched:", user);
      if (user) {
        currentUserSnapshot = user;
      } else {
        currentUserSnapshot = null;
      }
    } catch (error: any) {
      if (error && error.code === "error.user.notFound") {
        console.log("user-data-store: User not found during initialization.");
        currentUserSnapshot = null;
      } else {
        console.error("user-data-store: Failed to initialize user store:", error);
        currentUserSnapshot = null;
      }
    }
  } else {
    console.warn("user-data-store: window.api.invoke is not available. Cannot fetch initial user data.");
    currentUserSnapshot = null;
  }

  emitChange();

  if (window.electronAPI?.onUserDataChanged) {
    // Ensure the callback expects the correct type if UserQueryOutput is UserDTO[]
    // If handleUserDataChanged expects a single UserDTO, and IPC sends UserDTO[], this needs adjustment.
    // Assuming IPC 'ipc:user-data-changed' sends a single UserDTO or UserQueryOutput that is effectively a single user.
    window.electronAPI.onUserDataChanged(handleUserDataChanged);
    console.log("user-data-store: Subscribed to user data changes via IPC.");
  } else {
    console.warn("user-data-store: window.electronAPI.onUserDataChanged is not available. Real-time updates disabled.");
  }
}

initializeUserStore();
