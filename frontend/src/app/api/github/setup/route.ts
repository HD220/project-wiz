import { NextRequest } from "next/server";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  console.log("installation_id", searchParams.get("installation_id"));

  return Response.json({ message: "ok" });
}
