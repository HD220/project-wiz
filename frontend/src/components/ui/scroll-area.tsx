"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

const ScrollAreaGrab = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const tabsRef = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [isNormalClick, setIsNormalClick] = React.useState(true);

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const offsetLeft = tabsRef.current?.offsetLeft || 0;
    setIsDragging(true);
    setIsNormalClick(true);
    setStartX(e.pageX - offsetLeft);
    setScrollLeft(tabsRef.current?.scrollLeft || 0);
  };

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const offsetLeft = tabsRef.current?.offsetLeft || 0;
    if (!isDragging) return;
    const x = e.pageX - offsetLeft;
    if (x !== startX) {
      setIsNormalClick(false);
    }
    const walk = (x - startX) * 1; // Adjust scroll speed here
    if (tabsRef.current) {
      tabsRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    setIsNormalClick(true);
    setIsDragging(false);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setIsNormalClick(true);
    setIsDragging(false);
  };

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={tabsRef}
        className="h-full w-full rounded-[inherit] !overflow-hidden whitespace-nowrap flex"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className={cn(!isNormalClick && "pointer-events-none")}>
          {children}
        </div>
      </ScrollAreaPrimitive.Viewport>
      {/* <ScrollBar orientation="vertical" /> */}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollAreaGrab.displayName = "ScrollAreaGrab";

export { ScrollArea, ScrollBar, ScrollAreaGrab };
