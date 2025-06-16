import { RefObject, useEffect, useRef } from "react";

/**
 * Hook para rolar automaticamente um elemento para a visão
 * @param dep - Array de dependências que disparam o scroll
 * @param options - Opções de scroll (comportamento, etc)
 * @returns Ref para ser atribuído ao elemento que deve ser rolado
 */
export function useScroll<T extends unknown[]>(
  dep: T,
  options?: ScrollIntoViewOptions
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  const { behavior = "instant", ...scrollOptions } = options || {};

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior, ...scrollOptions });
    }
  }, dep);

  return ref;
}
