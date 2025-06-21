import { PlaceholderActivity } from "@/lib/placeholders";
import { Trans } from "@lingui/macro";
// Assuming date-fns is not yet available, use basic date formatting.
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";

interface ActivityListItemProps {
  activity: PlaceholderActivity;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  // The Trans component will use activity.i18nKey as the ID if found in catalogs.
  // If not found, it will render the content of activity.defaultText.
  // The `values` prop is used for interpolation.
  const descriptionNode = (
    <Trans id={activity.i18nKey} values={activity.values}>
      {activity.defaultText}
    </Trans>
  );

  return (
    <li className="p-4 hover:bg-muted/50">
      <p className="font-medium">{descriptionNode}</p>
      <p className="text-sm text-muted-foreground">
        {/* TODO: Replace with date-fns once available */}
        {new Date(activity.timestamp).toLocaleDateString()} (Placeholder Date)
      </p>
    </li>
  );
}
