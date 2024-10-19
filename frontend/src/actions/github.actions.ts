"use server";

// import { auth } from "@/lib/auth";
import { Octokit } from "octokit";
import jwt from "jsonwebtoken";
import { Installation } from "./schemas";

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

export async function getListOrgsForUser(access_token: string) {
  if (!access_token) return [];
  try {
    const octokit = new Octokit({
      auth: access_token,
    });
    const orgs = await octokit.rest.orgs.listForAuthenticatedUser();

    return orgs.data.map((orgs) => ({
      id: orgs.id,
      name: orgs.login,
      url: orgs.url,
    }));
  } catch (error) {
    console.error("getListOrgsForUser", error);
    return [];
  }
}

// export async function getUserRepos() {
//   const session = await auth();
//   console.log("token", session?.user.access_token);
//   const octokit = new Octokit({
//     auth: session?.user.access_token,
//   });

//   const repos = await octokit.rest.repos.listForAuthenticatedUser({
//     type: "all",
//   });
//   return repos.data.map((repo) => ({
//     id: repo.id,
//     name: repo.name,
//     description: repo.description,
//     owner: repo.owner,
//   }));
// }

export async function getUserReposForInstallation(
  access_token: string,
  installation_id: number
) {
  try {
    const octokit = new Octokit({
      auth: access_token,
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
        owner: repo.owner.login,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      }))
      .sort((first, second) => {
        const first_date = new Date(first.updated_at || "");
        const second_date = new Date(second.updated_at || "");
        return second_date.getTime() - first_date.getTime();
      });
  } catch (error) {
    console.error(error);
    return [];
  }
}

// export async function getOrgRepos(org: string) {
//   const session = await auth();
//   const octokit = new Octokit({
//     auth: session?.user.access_token,
//   });
//   const repos = await octokit.rest.repos.listForOrg({ org });
//   return repos.data.map((repo) => ({
//     id: repo.id,
//     name: repo.name,
//     description: repo.description,
//     owner: repo.owner,
//   }));
// }

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

export async function getRepository(
  access_token: string,
  owner: string,
  repo: string
) {
  const octokit = new Octokit({
    auth: access_token,
  });

  const fetched = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return {
    id: fetched.data.id,
    name: fetched.data.name,
    description: fetched.data.description,
    owner: fetched.data.owner.login,
    created_at: fetched.data.created_at,
    updated_at: fetched.data.updated_at,
  };
}

export async function getUserInstalledRepos(
  access_token: string = "",
  {
    search = "",
    owner = "all",
  }: {
    owner?: string;
    search?: string;
  }
): Promise<Installation[]> {
  if (!access_token) return [];
  let repos: Installation[] = [];
  try {
    const installations = await getAppInstallations();

    for (const installation of installations) {
      const reposUser = await getUserReposForInstallation(
        access_token,
        installation.id
      );
      for (const repoUser of reposUser) {
        repos.push({
          id: installation.id,
          repository_id: repoUser.id,
          name: repoUser.name,
          owner: repoUser.owner,
          full_name: `${repoUser.owner}/${repoUser.name}`,
        });
      }
    }

    if (owner !== "all") {
      repos = repos.filter((repo) => {
        return repo.owner == owner;
      });
    }

    if (search) {
      repos = repos.filter((repo) => repo.name.includes(search));
    }

    return repos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
