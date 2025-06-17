import { useEffect, useState } from 'react';
import { llmProvidersPlaceholder, LLMProviderPlaceholder } from '../lib/placeholders';

export const useSyncedLLMProviders = () => {
  const [llmProviders, setLLMProviders] = useState<LLMProviderPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLLMProviders(llmProvidersPlaceholder);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { llmProviders, isLoading };
};
