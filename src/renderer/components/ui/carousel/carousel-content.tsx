"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useCarousel } from "./carousel-context";

export function CarouselContent(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

export function CarouselItem(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props;
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...rest}
    />
  );
}
