import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SearcInput } from "@/components/search-input";
import { H2 } from "@/components/typography/h2";
import { ScrollAreaGrab, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LinkRepository } from "@/components/forms/link-repository";

const repositories = [
  {
    id: "repo1",
    name: "Repositório 1",
    indicators: [
      { title: "Orçamento", value: 100 },
      { title: "Orçamento Restante", value: 60 },
      { title: "Tempo Estimado", value: "2h" },
      { title: "Ações Pendentes", value: 5 },
    ],
  },
  {
    id: "repo2",
    name: "Repositório 2",
    indicators: [
      { title: "Orçamento", value: 200 },
      { title: "Orçamento Restante", value: 80 },
      { title: "Tempo Estimado", value: "3h" },
      { title: "Ações Pendentes", value: 2 },
    ],
  },
];

export default function Home() {
  return (
    <div>
      <div className="flex justify-end items-center gap-2 mb-4">
        <SearcInput />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="p-2">
              <Plus className="w-4 h-4" />
              Novo Repo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Repositório</DialogTitle>
              <DialogDescription>
                Link o ProjectWiz ao seu repositório do github.
              </DialogDescription>
            </DialogHeader>
            <LinkRepository />
          </DialogContent>
        </Dialog>
      </div>
      <div>
        {repositories.map((repo) => (
          <div key={repo.id} className="mb-8">
            <div className="flex items-baseline border-b justify-between mb-4">
              <H2>{repo.name}</H2>
              <div className="flex gap-2">
                <Link href={`/repository/${repo.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <ScrollAreaGrab className="w-full pb-3">
              <div className="flex w-max  gap-4">
                {repo.indicators.map((indicator, index) => (
                  <Card key={index} className="shadow-md min-w-60 ">
                    <CardHeader>
                      <CardTitle>{indicator.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl font-semibold">{indicator.value}</p>
                    </CardContent>
                    <CardFooter></CardFooter>
                  </Card>
                ))}
              </div>
              <ScrollBar className="" orientation="horizontal" />
            </ScrollAreaGrab>
          </div>
        ))}
      </div>
    </div>
  );
}
