import { Link } from "@tanstack/react-router";

interface SidebarLinkProps {
  to: string;
  label: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
}

export function SidebarLink({ to, label, icon, active }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm rounded-md ${
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  );
}