"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components//ui/card";
export const description = "A collection of health charts.";

export function CardBudgetUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso do orçamento</CardTitle>
        <CardDescription>{"Acompanhe uso do seu orçamento."}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid auto-rows-min gap-2">
          <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
            $ 100,00
            <span className="text-sm font-normal text-muted-foreground">
              /mês
            </span>
          </div>
        </div>
        <div className="grid auto-rows-min gap-2">
          <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
            $ 44,24
            <span className="text-sm font-normal text-muted-foreground">
              usado
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
