// src_refactored/presentation/ui/hooks/useIPC.ts

import { ipcService } from '@/presentation/ui/services/ipc.service'; // Using path alias
import { IElectronIPC } from '@/presentation/ui/services/ipc.types'; // Using path alias

/**
 * Custom React hook to access the IPC service for communicating
 * with the Electron main process.
 *
 * @returns The instance of the IPCService, providing methods like `invoke`, `on`, `send`.
 *          Refer to `ipc.service.ts` and `ipc.types.ts` for more details on the API.
 *
 * @example
 * const ipc = useIPC();
 *
 * // Invoking a channel
 * useEffect(() => {
 *   const fetchVersion = async () => {
 *     const result = await ipc.invoke<{ version: string }>('app:get-version');
 *     if (result.success && result.data) {
 *       console.log('App Version:', result.data.version);
 *     } else {
 *       console.error('Failed to get app version:', result.error);
 *     }
 *   };
 *   fetchVersion();
 * }, [ipc]);
 *
 * // Subscribing to an event
 * useEffect(() => {
 *   const handleUpdate = (message: any) => {
 *     console.log('Received update:', message);
 *   };
 *   const unsubscribe = ipc.on('app:update-available', handleUpdate);
 *   return () => unsubscribe(); // Cleanup on unmount
 * }, [ipc]);
 */
export function useIPC(): typeof ipcService {
  // The ipcService is a singleton, so we just return it.
  // No React-specific state or context is needed here unless we wanted to
  // provide different mock implementations via context, which is not the current design.
  return ipcService;
}

// Optional: If we want to expose the raw IElectronIPC interface directly via a hook,
// which might be useful if the service adds too much opinion or for direct use.
// However, the service layer provides better abstraction and error handling.

/*
import { useState, useEffect } from 'react';
import { IElectronIPC } from '@/presentation/ui/services/ipc.types';

export function useRawElectronIPC(): IElectronIPC | null {
  const [api, setApi] = useState<IElectronIPC | null>(null);

  useEffect(() => {
    if (window.electronIPC) {
      setApi(window.electronIPC);
    } else {
      console.warn('[useRawElectronIPC] Electron IPC API not found on window.');
    }
  }, []);

  return api;
}
*/
