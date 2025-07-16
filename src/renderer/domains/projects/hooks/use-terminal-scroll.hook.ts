import { useEffect } from "react";

import type { TerminalLine } from "../../../../lib/placeholders";

interface UseTerminalScrollProps {
  terminalLines: TerminalLine[];
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

export function useTerminalScroll({
  terminalLines,
  scrollAreaRef,
}: UseTerminalScrollProps) {
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [terminalLines, scrollAreaRef]);
}
