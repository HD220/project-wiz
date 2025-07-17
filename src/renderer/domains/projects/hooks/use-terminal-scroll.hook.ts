import { useEffect } from "react";

import type { TerminalLine } from "@/lib/mock-data/types";

export function useTerminalScroll(
  scrollAreaRef: React.RefObject<HTMLDivElement>,
  terminalLines: TerminalLine[],
) {
  useEffect(() => {
    scrollToBottom();
  }, [terminalLines]);

  const scrollToBottom = () => {
    if (!scrollAreaRef.current) return;

    const scrollArea = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );

    if (!scrollArea) return;

    scrollArea.scrollTop = scrollArea.scrollHeight;
  };

  const scrollToTop = () => {
    if (!scrollAreaRef.current) return;

    const scrollArea = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );

    if (!scrollArea) return;

    scrollArea.scrollTop = 0;
  };

  const scrollToLine = (lineId: string) => {
    if (!scrollAreaRef.current) return;

    const lineElement = scrollAreaRef.current.querySelector(
      `[data-line-id="${lineId}"]`,
    );

    if (!lineElement) return;

    lineElement.scrollIntoView({ behavior: "smooth" });
  };

  return {
    scrollToBottom,
    scrollToTop,
    scrollToLine,
  };
}
