import { useEffect } from "react";

import { usePageTitle } from "@/renderer/contexts/page-title-context";

interface PageTitleProps {
  title: string;
  icon?: React.ReactNode;
}

export function PageTitle({ title, icon }: PageTitleProps) {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(title, icon);

    // Cleanup on unmount
    return () => {
      setPageTitle("");
    };
  }, [title, icon, setPageTitle]);

  return null;
}
