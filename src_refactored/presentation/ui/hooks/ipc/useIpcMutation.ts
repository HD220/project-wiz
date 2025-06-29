import { useState, useCallback } from 'react';

interface IpcMutationState<TResponse> {
  data: TResponse | null;
  isLoading: boolean;
  error: Error | null;
}

type MutateFunction<TResponse, TRequest> = (params: TRequest) => Promise<TResponse | undefined>;

interface IpcMutationResult<TResponse, TRequest> extends IpcMutationState<TResponse> {
  mutate: MutateFunction<TResponse, TRequest>;
  reset: () => void;
}

/**
 * Custom hook to perform an IPC mutation (invoke for write operations) to the main process.
 * Manages loading, data, and error states for create, update, delete operations.
 *
 * @param channel The IPC channel to invoke.
 * @returns An object containing data, isLoading, error, a mutate function, and a reset function.
 */
export function useIpcMutation<TResponse, TRequest = undefined>(
  channel: string
): IpcMutationResult<TResponse, TRequest> {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (params: TRequest): Promise<TResponse | undefined> => {
    if (!window.electron || !window.electron.ipcRenderer) {
      const errMessage = 'Electron IPC renderer not available. Ensure preload script is correctly configured.';
      console.error(errMessage);
      setError(new Error(errMessage));
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);
    setData(null); // Reset previous data on new mutation

    try {
      // console.log(`useIpcMutation: Invoking channel ${channel} with params:`, params);
      const result = await window.electron.ipcRenderer.invoke<TResponse>(channel, params);
      // console.log(`useIpcMutation: Received result for channel ${channel}:`, result);
      setData(result);
      return result;
    } catch (err: unknown) {
      console.error(`Error invoking IPC channel ${channel} for mutation:`, err);
      if (err instanceof Error) {
        setError(err);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(new Error(String((err as { message: unknown }).message)));
      } else {
        setError(new Error(String(err || 'An unknown error occurred during mutation')));
      }
      setData(null);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [channel]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, mutate, reset };
}

// Example Usage (for documentation purposes, not to be run here):
/*
  // In a component:
  // const { mutate: createProject, isLoading: isCreating, error: createError, data: newProjectData } =
  //   useIpcMutation<CreateProjectResponse, CreateProjectRequest>(CREATE_PROJECT_CHANNEL);

  // const handleCreateProject = async (formData) => {
  //   const result = await createProject({ name: formData.name, description: formData.description });
  //   if (result) {
  //     // Handle successful creation
  //     console.log('Project created:', result.project);
  //   } else {
  //     // Handle error (already set in createError)
  //     console.error('Failed to create project');
  //   }
  // };

  // To reset the state of the mutation (e.g., after displaying an error or success message)
  // resetCreateProjectState(); // Assuming you aliased reset when destructuring or call directly: mutationResult.reset()
*/
