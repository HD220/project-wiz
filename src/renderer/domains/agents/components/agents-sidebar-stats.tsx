interface AgentsSidebarStatsProps {
  totalAgents: number;
  filteredAgents: number;
}

export function AgentsSidebarStats({
  totalAgents,
  filteredAgents,
}: AgentsSidebarStatsProps) {
  return (
    <div className="p-2 border-b border-border flex-none">
      <div className="grid grid-cols-2 gap-1 text-center">
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{totalAgents}</div>
          <div className="text-xs text-muted-foreground truncate">Total</div>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-green-600 truncate">
            {filteredAgents}
          </div>
          <div className="text-xs text-muted-foreground truncate">Ativas</div>
        </div>
      </div>
    </div>
  );
}
