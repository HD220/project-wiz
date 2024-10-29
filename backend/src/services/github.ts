import jwt from "jsonwebtoken";
// import { Octokit } from "octokit";

// Função para gerar um JWT
export function generateJWT() {
  try {
    const payload = {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60,
      iss: process.env.AUTH_GITHUB_ID,
    };

    return jwt.sign(payload, process.env.AUTH_GITHUB_PRIVATE_KEY!, {
      algorithm: "RS256",
    });
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function getOctoKit() {
  const jwtToken = generateJWT();
  const octo = await import("octokit");

  const octokit = new octo.Octokit({
    auth: jwtToken,
  });

  return octokit;
}
