import { ReactNode } from "react";
import { UserSidebar } from "@/features/dashboard/components/user-sidebar";
import { RootSidebar } from "@/features/dashboard/components/root-sidebar";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

interface DashboardLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerDescription?: string;
}

export function DashboardLayout({ 
  children, 
  headerTitle, 
  headerDescription 
}: DashboardLayoutProps) {
  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Root Sidebar */}
      <RootSidebar />
      
      {/* User Sidebar */}
      <div className="w-60 flex flex-col">
        <UserSidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader title={headerTitle} description={headerDescription} />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}