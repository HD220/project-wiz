import { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Gerar o token
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });
};

// Middleware para verificar o token
export const authenticateJWT: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Pega o token do cabeçalho

  if (!token) {
    throw new Error("Authentication token missing");
  }

  jwt.verify(token, process.env.JWT_SECRET || "", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    (req as Request & { user: string | jwt.JwtPayload | undefined }).user =
      user; // Adiciona o usuário à requisição
    next(); // Continua a requisição
  });
};
