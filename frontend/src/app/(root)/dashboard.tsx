import { H2 } from "@/components/typography/h2";
import { DashboardFilters } from "./dashboard-filters";
import { CardBudgetUsage } from "../../components/cards/card-budget-usage";
import { RepositoryList } from "./repo-list";
import { getListOrgsForUser } from "@/actions/github.actions";
import { auth } from "@/lib/auth";

export default async function Dashboard(params: { q: string; owner: string }) {
  const session = await auth();
  const orgs = await getListOrgsForUser(session!.user.access_token);

  return (
    <div className="flex flex-col ">
      <div className="grid grid-cols-4 mb-4 gap-2">
        <CardBudgetUsage />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 justify-between items-baseline mb-8">
          <H2 className="flex flex-1">Repositórios</H2>
          <DashboardFilters orgs={orgs} />
        </div>

        <RepositoryList {...params} />
      </div>
    </div>
  );
}
