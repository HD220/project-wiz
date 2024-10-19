import { getUserInstalledRepos } from "@/actions/github.actions";
import { getUserConfigAction } from "@/actions/user.actions";
import { UserConfigForm } from "@/components/forms/user-config";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  const config = await getUserConfigAction(session?.user.username);
  const installations = await getUserInstalledRepos(
    session?.user.access_token,
    {}
  );

  return (
    <UserConfigForm
      installations={installations}
      defaultValues={{
        api_token: config?.api_token || "",
        is_batch_api: config?.is_batch_api || true,
        budget: config?.budget || 0,
        allocations: config?.allocations || [],
      }}
    />
  );
}
