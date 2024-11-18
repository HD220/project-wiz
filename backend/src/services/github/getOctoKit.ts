export async function getOctoKit(jwtToken: string) {
  const octo = await import("octokit");

  const octokit = new octo.Octokit({
    auth: jwtToken,
  });

  return octokit;
}
