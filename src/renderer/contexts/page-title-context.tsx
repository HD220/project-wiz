import { createContext, useContext, useState, ReactNode } from "react";

interface PageTitleContextType {
  title: string;
  icon?: ReactNode;
  setPageTitle: (title: string, icon?: ReactNode) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined,
);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState<ReactNode>();

  const setPageTitle = (newTitle: string, newIcon?: ReactNode) => {
    setTitle(newTitle);
    setIcon(newIcon);
  };

  return (
    <PageTitleContext.Provider value={{ title, icon, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
}
