import jwt from "jsonwebtoken";

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
