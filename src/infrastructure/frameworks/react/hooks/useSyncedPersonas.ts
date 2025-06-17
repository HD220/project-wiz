import { useEffect, useState } from 'react';
import { personasPlaceholder, PersonaPlaceholder } from '../lib/placeholders';

export const useSyncedPersonas = () => {
  const [personas, setPersonas] = useState<PersonaPlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPersonas(personasPlaceholder);
      setIsLoading(false);
    }, 1000); // Simulate 1 second delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return { personas, isLoading };
};
