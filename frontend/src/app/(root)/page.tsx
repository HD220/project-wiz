import { auth } from "@/lib/auth";
import Dashboard from "./dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton } from "@/components/signin-button";

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; owner?: string };
}) {
  const session = await auth();
  const { owner = session?.user.username || "", q = "" } = searchParams;

  return (
    <>
      {session?.user && <Dashboard q={q} owner={owner} />}
      {!session?.user && (
        <div className="flex flex-1">
          <Card className="w-1/2 mx-auto">
            <CardHeader>
              <CardTitle>Necessario realizar o login na plataforma</CardTitle>
              <CardDescription>
                Após o login poderá fazer a magíca acontecer!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInButton />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
