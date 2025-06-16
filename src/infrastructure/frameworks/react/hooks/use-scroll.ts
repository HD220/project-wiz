import { RefObject, useEffect, useRef } from "react";

export function useScroll<T extends any[]>(
  dep: T,
  options?: ScrollIntoViewOptions
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  const { behavior = "instant", ...scrollOptions } = options || {};

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior, ...scrollOptions });
      //   scrollTo({
      //     top: ref.current.scrollHeight,
      //     behavior: "smooth",
      //     left: 0,
      //   });
    }
  }, dep);

  return ref;
}
