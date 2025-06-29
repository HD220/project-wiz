import { useState, useEffect, useCallback } from 'react';

interface IpcQueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to perform an IPC query (invoke) to the main process.
 * Manages loading, data, and error states, similar to react-query.
 *
 * @param channel The IPC channel to invoke.
 * @param params Parameters to send with the IPC call.
 * @param options Optional configuration.
 * @param options.enabled Whether the query should automatically run. Defaults to true.
 *                      If false, the query will not run until `refetch` is called.
 * @returns An object containing data, isLoading, error, and a refetch function.
 */
export function useIpcQuery<TResponse, TRequest = undefined>(
  channel: string,
  params?: TRequest,
  options: { enabled?: boolean } = { enabled: true }
): IpcQueryState<TResponse> {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled || false); // Start loading if enabled
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!window.electron || !window.electron.ipcRenderer) {
      console.error('Electron IPC renderer not available. Ensure preload script is correctly configured.');
      setError(new Error('Electron IPC renderer not available.'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // console.log(`useIpcQuery: Invoking channel ${channel} with params:`, params);
      const result = await window.electron.ipcRenderer.invoke<TResponse>(channel, params);
      // console.log(`useIpcQuery: Received result for channel ${channel}:`, result);
      setData(result);
    } catch (err: unknown) {
      console.error(`Error invoking IPC channel ${channel}:`, err);
      if (err instanceof Error) {
        setError(err);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(new Error(String((err as { message: unknown }).message)));
      } else {
        setError(new Error(String(err || 'An unknown error occurred')));
      }
      setData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [channel, params]); // `params` are part of dependencies to refetch if they change

  useEffect(() => {
    if (options.enabled) {
      fetchData();
    }
  }, [fetchData, options.enabled]); // Rerun if fetchData (channel/params) or enabled status changes

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}

// Example Usage (for documentation purposes, not to be run here):
/*
  // In a component:
  // No parameters
  // const { data: projectsData, isLoading: isLoadingProjects, error: projectsError, refetch: refetchProjects } =
  //   useIpcQuery<GetProjectsResponse>(GET_PROJECTS_CHANNEL);

  // With parameters
  // const { data: projectDetails, isLoading: isLoadingDetails, error: detailsError, refetch: refetchDetails } =
  //   useIpcQuery<GetProjectDetailsResponse, GetProjectDetailsRequest>(
  //     GET_PROJECT_DETAILS_CHANNEL,
  //     { projectId: 'some-id' }
  //   );

  // Query initially disabled
  // const { data: userData, isLoading: isLoadingUser, refetch: fetchUser } =
  //   useIpcQuery<GetUserProfileResponse>(GET_USER_PROFILE_CHANNEL, undefined, { enabled: false });
  // ... later call fetchUser() when needed
*/
