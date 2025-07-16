import { Skeleton } from "../../../components/ui/skeleton";

export function ProjectSidebarSkeleton() {
  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="w-12 h-12 rounded-2xl" />
      ))}
    </div>
  );
}
