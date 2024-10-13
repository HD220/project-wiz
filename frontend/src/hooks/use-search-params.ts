import {
  usePathname,
  useRouter,
  useSearchParams as useSearchParamsNext,
} from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useSearchParams(key: string, defaultValue: string) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParamsNext();
  const [value, setValue] = useState(defaultValue);

  const fn = useDebouncedCallback((newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue !== defaultValue) {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }

    router.replace(`${pathname}?${params.toString()}`);
  });

  useEffect(() => {
    fn(value);
  }, [fn, value]);

  return [value, setValue] as const;
}
