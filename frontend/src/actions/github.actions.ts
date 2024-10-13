"use server";

import { auth } from "@/lib/auth";
import { Octokit } from "octokit";
import jwt from "jsonwebtoken";

// Função para gerar um JWT
export async function generateJWT() {
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60,
    iss: process.env.AUTH_GITHUB_ID,
  };

  return jwt.sign(payload, process.env.AUTH_GITHUB_PRIVATE_KEY!, {
    algorithm: "RS256",
  });
}

export async function getListOrgsForUser() {
  const session = await auth();
  const octokit = new Octokit({
    auth: session?.user.access_token,
  });
  const orgs = await octokit.rest.orgs.listForAuthenticatedUser({});

  console.log("orgs", orgs.data);

  return orgs.data.map((orgs) => ({
    id: orgs.id,
    name: orgs.login,
    url: orgs.url,
  }));
}

export async function getUserRepos() {
  const session = await auth();
  console.log("token", session?.user.access_token);
  const octokit = new Octokit({
    auth: session?.user.access_token,
  });

  const repos = await octokit.rest.repos.listForAuthenticatedUser({
    type: "all",
  });
  return repos.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    owner: repo.owner,
  }));
}

export async function getUserReposForInstallation(installation_id: number) {
  const session = await auth();
  const octokit = new Octokit({
    auth: session?.user.access_token,
  });

  const repos =
    await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
      installation_id,
    });

  return repos.data.repositories
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      owner: repo.owner,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }))
    .sort((first, second) => {
      const first_date = new Date(first.updated_at || "");
      const second_date = new Date(second.updated_at || "");
      return second_date.getTime() - first_date.getTime();
    });
}

export async function getOrgRepos(org: string) {
  const session = await auth();
  const octokit = new Octokit({
    auth: session?.user.access_token,
  });
  const repos = await octokit.rest.repos.listForOrg({ org });
  return repos.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    owner: repo.owner,
  }));
}

export async function getAppInstallations() {
  const jwtToken = await generateJWT();

  const octokit = new Octokit({
    auth: jwtToken,
  });

  const installs = await octokit.rest.apps.listInstallations();

  return installs.data.map((install) => ({
    id: install.id,
    owner: install.account?.login,
    owner_id: install.account?.id,
    type: install.account?.type,
    installation_type: install.repository_selection,
  }));
}

export async function getUserInstalledRepos({
  search = "",
  owner,
}: {
  owner: string;
  search?: string;
}) {
  let repos = [];
  try {
    const installations = await getAppInstallations();

    for (const installation of installations) {
      const reposUser = await getUserReposForInstallation(installation.id);
      for (const repoUser of reposUser) {
        repos.push({
          ...repoUser,
          installation_id: installation.id,
          installation_type: installation.installation_type,
          installation_owner: installation.owner,
          installation_owner_id: installation,
        });
      }
    }

    repos = repos.filter((repo) => {
      console.log(
        "filtrando",
        repo.name,
        owner,
        repo.owner.id,
        owner == repo.owner.id.toString()
      );
      return repo.owner.id.toString() == owner;
    });

    console.log("filtrado", repos.length);

    // Filtro por nome
    if (search) {
      repos = repos.filter((repo) => repo.name.includes(search));
    }

    return repos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
