import React from "react";

import { CreateProjectModal } from "./components/create-project-modal";
import { ProjectSidebar } from "./components/project-sidebar";

export const ProjectManagementFeature: React.FC = () => {
  return (
    <div className="flex h-full">
      <ProjectSidebar />
      <div className="flex-1 p-4">
        {/* Main content area for project details or dashboard */}
        <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>
        <CreateProjectModal />
      </div>
    </div>
  );
};
