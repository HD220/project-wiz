import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components//ui/card";

export async function CardBudgetUsage({
  total = 0,
  used = 0,
  shared = 0,
  dedicate = 0,
}: {
  total?: number;
  shared?: number;
  dedicate?: number;
  used?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso do orçamento</CardTitle>
        <CardDescription>{"Acompanhe uso do seu orçamento."}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-baseline gap-1 text-md font-bold tabular-nums leading-none">
          $ {total.toFixed(2) || "0,00"}
          <span className="text-xs font-normal text-muted-foreground">
            total
          </span>
        </div>
        <div className="flex items-baseline gap-1 text-md font-bold tabular-nums leading-none">
          $ {dedicate.toFixed(2) || "0,00"}
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
          $ {used.toFixed(2) || "0,00"}
          <span className="text-xs font-normal text-muted-foreground">
            usado
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
