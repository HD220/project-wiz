"use server";

import { validateSignature } from "@/actions/cypher.actions";
import { connectRedis } from "@/lib/redis";
import { NextRequest } from "next/server";

type Repositories = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
};

export async function POST(req: NextRequest) {
  const payload = await req.text();

  const valid = await validateSignature(req, payload);
  if (!valid) {
    return Response.json({ message: "Signature mismatch" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  req.headers.forEach((value, key) =>
    console.log(`header:${key}`, `value:${value}`)
  );
  const data = JSON.parse(payload);
  const redis = await connectRedis();

  const action: "created" | "deleted" | "added" | "removed" = data.action;
  const installation: {
    id: number;
    repository_selection: string;
    created_at: Date;
    updated_at: Date;
  } = data.installation;

  switch (event) {
    case "push": {
      console.log("Push event:", data);
      break;
    }
    case "pull_request": {
      console.log("Pull Request event:", data);
      break;
    }
    case "installation_repositories": {
      const owner = data.installation.account.login;
      switch (action) {
        case "added":
          const added: Repositories[] = data.repositories_added;
          await redis.json.merge(`user:${owner}`, `$`, {
            repositories: added
              .map((repo) => ({
                id: repo.id,
                name: repo.name,
                owner,
                is_batch_api: true,
              }))
              .reduce((acc, curr) => ({ ...acc, [curr.id]: { ...curr } }), {}),
          });

          break;
        case "removed":
          const removed: Repositories[] = data.repositories_removed;
          for (const repo of removed) {
            console.log(
              "removendo",
              `user:${owner}`,
              `$.repositories.${repo.id}`
            );
            await redis.json.del(`user:${owner}`, `$.repositories.${repo.id}`);
          }
          break;
        default:
          break;
      }
      break;
    }
    case "installation": {
      const owner = data.installation.account.login;
      switch (action) {
        case "created":
          const added: Repositories[] = data.repositories;
          await redis.json.set(`user:${owner}`, `$`, {
            installations: {
              [installation.id]: {
                id: installation.id,
                repository_selection: installation.repository_selection,
                created_at: installation.created_at,
                updated_at: installation.updated_at,
              },
            },
            repositories: added
              .map((repo) => ({
                id: repo.id,
                name: repo.name,
                owner,
                is_batch_api: true,
              }))
              .reduce((acc, curr) => ({ ...acc, [curr.id]: { ...curr } }), {}),
          });
          break;
        case "deleted":
          const removed: Repositories[] = data.repositories;
          await redis.json.del(
            `user:${owner}`,
            `$.installations.${installation.id}`
          );
          for (const repo of removed) {
            await redis.json.del(`user:${owner}`, `$.repositories.${repo.id}`);
          }
          break;
        default:
          break;
      }
      // console.log("Installation Request event:", action, repositories);
      break;
    }
    default: {
      console.log("Unhandled event type:", event, data.action);
      break;
    }
  }

  return Response.json(
    { message: "Webhook received successfully" },
    { status: 200 }
  );
}
