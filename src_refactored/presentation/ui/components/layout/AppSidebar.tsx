import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/presentation/ui/components/ui/button';
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { Home, Briefcase, Settings, PlusCircle, GripHorizontal } from 'lucide-react';

interface AppSidebarProps {
  className?: string;
  // isMobileOpen?: boolean; // Example prop if parent controls mobile visibility
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  onClick?: () => void; // For closing mobile sidebar on navigation
}

function NavLink({ to, children, icon: Icon, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center space-x-2 px-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
      activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50' }}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  );
}


export function AppSidebar({ className /*, isMobileOpen */ }: AppSidebarProps) {
  // Placeholder data
  const projects = [
    { id: '1', name: 'Project Phoenix' },
    { id: '2', name: 'Operation Chimera' },
    { id: '3', name: 'Project Griffin' },
  ];

  const user = {
    name: 'J. Doe',
    avatarUrl: '',
  };

  // const handleLinkClick = () => {
  //   if (isMobileOpen && closeMobileSidebar) { // Assuming closeMobileSidebar is passed as a prop
  //     closeMobileSidebar();
  //   }
  // };

  return (
    <aside
      className={`
        flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        fixed md:static md:translate-x-0 // Basic responsiveness: fixed for potential mobile overlay, static for desktop
        inset-y-0 left-0 z-50 // For fixed mobile overlay
        w-64 transition-transform duration-300 ease-in-out
        ${className || ''}
        // Example for mobile: ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        // This would be controlled by a parent component and state.
        // For now, it will be hidden on small screens by default if not explicitly shown by a parent.
        // To make it simpler for now: hidden on mobile, shown on md+
        // This means a parent component would need to provide a toggle for mobile.
        // For this isolated component, let's assume it's part of a layout that handles mobile toggling.
        // The `hidden md:flex` approach is common for this.
      `}
    >
      {/* User/Workspace Info */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
            {user.name.substring(0,1).toUpperCase() || <Settings className="w-5 h-5"/>}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personal Workspace</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-grow">
        <nav className="py-4 px-2">
          {/* Main Navigation Links */}
          <div className="mb-4">
            <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Menu
            </h3>
            <div className="space-y-1">
              <NavLink to="/dashboard" icon={Home} /* onClick={handleLinkClick} */ >Dashboard</NavLink>
              <NavLink to="/projects" icon={Briefcase} /* onClick={handleLinkClick} */ >Projects</NavLink>
              <NavLink to="/settings" icon={Settings} /* onClick={handleLinkClick} */ >Settings</NavLink>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Project List */}
          <div className="mb-4">
            <div className="flex justify-between items-center px-2 mb-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Your Projects
              </h3>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only">Add new project</span>
              </Button>
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  // onClick={handleLinkClick}
                  className="group flex items-center justify-between px-2 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                  activeProps={{ className: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50' }}
                >
                  <span className="truncate">{project.name}</span>
                  <GripHorizontal className="h-4 w-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              {projects.length === 0 && (
                <p className="px-2 text-xs text-slate-500 dark:text-slate-400">No projects yet.</p>
              )}
            </div>
          </div>
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add New Project</span>
        </Button>
      </div>
    </aside>
  );
}

export default AppSidebar;
