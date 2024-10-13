import { getUserInstalledRepos } from "@/actions/github.actions";
import { UserConfigForm } from "@/components/forms/user-config";
import { getUserConfigAction } from "@/components/forms/user-config/actions";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  const config = await getUserConfigAction(session?.user.username);
  const repositories = await getUserInstalledRepos(
    session?.user.access_token,
    {}
  );

  return (
    <UserConfigForm
      repositories={repositories.map((repo) => ({
        full_name: `${repo.owner}/${repo.name}`,
        name: `${repo.name}/${repo.owner}`,
      }))}
      defaultValues={{
        api_token: config?.api_token || "",
        is_batch_api: config?.is_batch_api || true,
        budget: config?.budget || 0,
        allocations: config?.allocations || [],
      }}
    />
  );
}
