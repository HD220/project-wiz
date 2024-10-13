"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { forwardRef, ReactNode } from "react";

type TabButonProps = {
  value: string;
  children: ReactNode;
};
export const TabButton = forwardRef<HTMLButtonElement, TabButonProps>(
  ({ value, children }: TabButonProps, ref) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleClick = () => {
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      if (params.get("tab") === "dash") {
        params.delete("tab");
      }
      router.push(`${pathname}?${params.toString()}`);
    };

    return (
      <TabsTrigger ref={ref} value={value} onClick={handleClick}>
        {children}
      </TabsTrigger>
    );
  }
);
TabButton.displayName = "TabButton";
