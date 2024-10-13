import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components//ui/card";
import { auth } from "@/lib/auth";
import { getUserConfigAction } from "../forms/user-config/actions";

export async function CardBudgetUsage() {
  const session = await auth();
  const config = await getUserConfigAction(session?.user.username);
  const reserved =
    config?.allocations.reduce((sum, curr) => sum + curr.budget, 0.0) || 0.0;
  const shared = (config?.budget || 0.0) - reserved;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso do orçamento</CardTitle>
        <CardDescription>{"Acompanhe uso do seu orçamento."}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-baseline gap-1 text-md font-bold tabular-nums leading-none">
          $ {config?.budget.toFixed(2) || "0,00"}
          <span className="text-xs font-normal text-muted-foreground">
            total
          </span>
        </div>
        <div className="flex items-baseline gap-1 text-md font-bold tabular-nums leading-none">
          $ {reserved.toFixed(2) || "0,00"}
          <span className="text-xs font-normal text-muted-foreground">
            dedicado
          </span>
        </div>
        <div className="flex items-baseline gap-1 text-md font-bold tabular-nums leading-none">
          $ {shared.toFixed(2) || "0,00"}
          <span className="text-xs font-normal text-muted-foreground">
            compart.
          </span>
        </div>
        <div className="flex items-baseline gap-1 text-md font-bold tabular-nums leading-none">
          $ 0,00
          <span className="text-xs font-normal text-muted-foreground">
            usado
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
